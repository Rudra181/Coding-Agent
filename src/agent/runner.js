import groq from "../config/groq.js";
import { SYSTEM_PROMPT } from "./prompt.js";
import { parseResponse } from "./parser.js";
import { toolRegistry } from "../tools/toolRegistry.js";
import { exec } from "child_process";
import path from "path";
import { OUTPUT_DIR } from "../utils/paths.js";

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const MAX_ITERATIONS = process.env.MAX_ITERATIONS ? parseInt(process.env.MAX_ITERATIONS, 10) : 40;

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

function label(step) {
  const map = {
    START:   `${c.cyan}${c.bold}[ START   ]${c.reset}`,
    THINK:   `${c.yellow}${c.bold}[ THINK   ]${c.reset}`,
    TOOL:    `${c.magenta}${c.bold}[ TOOL    ]${c.reset}`,
    OBSERVE: `${c.blue}${c.bold}[ OBSERVE ]${c.reset}`,
    RETRY:   `${c.red}${c.bold}[ RETRY   ]${c.reset}`,
    OUTPUT:  `${c.green}${c.bold}[ OUTPUT  ]${c.reset}`,
  };
  return map[step] || `[ ${step} ]`;
}

export async function runAgent(userInstruction) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userInstruction },
  ];

  console.log(`\n${c.bold}Agent starting...${c.reset}\n`);

  let lastHtmlPath = null;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let rawContent;
    let apiSuccess = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await groq.chat.completions.create({
          model: MODEL,
          messages,
          temperature: 0.3,
          max_tokens: 8192,
        });
        rawContent = response.choices[0].message.content;
        apiSuccess = true;
        break;
      } catch (err) {
        console.error(`${c.red}API Error (Attempt ${attempt}/3):${c.reset}`, err.response?.data || err.message);
        if (attempt === 3) break;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!apiSuccess) {
      console.error(`${c.red}Fatal API Error. Exiting loop.${c.reset}`);
      break;
    }

    let parsed;
    try {
      if (!rawContent) {
        throw new Error("Model returned an empty or null response.");
      }
      parsed = parseResponse(rawContent);
    } catch (err) {
      console.error(`${c.red}Parse error:${c.reset}`, err.message);
      
      messages.push({
        role: "user",
        content: `I couldn't parse your last response. Error: ${err.message}. Please respond with ONLY a single valid JSON object following the required schema.`,
      });
      continue;
    }

    const { step, content, tool_name, tool_args } = parsed;
    const stepLabel = label(step);

    messages.push({ role: "assistant", content: JSON.stringify(parsed) });

    if (step === "START") {
      console.log(`${stepLabel} ${content}\n`);
    }

    else if (step === "THINK") {
      console.log(`${stepLabel} ${content}\n`);
    }

    else if (step === "TOOL") {
      const fn = toolRegistry[tool_name];
      console.log(`${stepLabel} Calling ${c.bold}${tool_name}${c.reset}`);

      if (!fn) {
        const errMsg = `Tool "${tool_name}" not found in registry.`;
        console.log(`  ${c.red}✗ ${errMsg}${c.reset}\n`);
        messages.push({
          role: "user",
          content: JSON.stringify({ step: "OBSERVE", content: errMsg }),
        });
        continue;
      }

      let result;
      try {
        result = await fn(tool_args);
      } catch (err) {
        result = `Tool error: ${err.message}`;
      }

      const display = typeof result === "string" && result.length > 300
        ? result.slice(0, 300) + "…"
        : JSON.stringify(result);

      console.log(`  ${c.gray}↳ Result: ${display}${c.reset}\n`);

      messages.push({
        role: "user",
        content: JSON.stringify({ step: "OBSERVE", content: result }),
      });

      if (tool_name === "writeFile" && typeof tool_args === "object" && tool_args !== null && tool_args.fileName === "index.html" && tool_args.folderName) {
        lastHtmlPath = path.join(OUTPUT_DIR, tool_args.folderName, tool_args.fileName);
      }
    }

    else if (step === "OBSERVE") {
      console.log(`${stepLabel} ${content}\n`);
    }

    else if (step === "RETRY") {
      console.log(`${stepLabel} ${c.red}${content}${c.reset}\n`);
    }

    else if (step === "OUTPUT") {
      console.log(`${stepLabel} ${c.bold}${content}${c.reset}\n`);
      console.log(`${c.green}✓ Agent completed successfully.${c.reset}\n`);

      if (lastHtmlPath) {
        console.log(`${c.cyan}Opening website in default browser...${c.reset}\n`);
        const openCommand = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
        exec(`${openCommand} "${lastHtmlPath}"`);
      }

      return;
    }

    else {
      console.log(`${c.gray}[unknown step: ${step}]${c.reset} ${content}\n`);
    }

    if (i === MAX_ITERATIONS - 1) {
      console.log(`${c.red}⚠ Agent hit max iterations (${MAX_ITERATIONS}) without OUTPUT.${c.reset}\n`);
    }
  }
}
