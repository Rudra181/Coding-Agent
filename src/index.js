import "dotenv/config";
import readline from "readline";
import { runAgent } from "./agent/runner.js";


const args = process.argv.slice(2);
let isAuto = false;
let autoTarget = "https://www.scaler.com";
let customModel = null;
let maxSteps = 20;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--auto") {
    isAuto = true;
    if (args[i + 1] && !args[i + 1].startsWith("--")) {
      autoTarget = args[i + 1];
      i++;
    }
  } else if (args[i] === "--model") {
    customModel = args[i + 1];
    process.env.GROQ_MODEL = customModel;
    i++;
  } else if (args[i] === "--max-steps") {
    maxSteps = parseInt(args[i + 1], 10);
    process.env.MAX_ITERATIONS = maxSteps;
    i++;
  }
}

if (isAuto) {
  console.log(`\n🤖 Auto Mode Activated`);
  console.log(`Target: ${autoTarget}`);
  if (customModel) console.log(`Model: ${customModel}`);
  console.log(`Max Steps: ${maxSteps}\n`);

  const prompt = `Clone ${autoTarget} autonomously without asking for input.`;
  runAgent(prompt).then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error("Unexpected error in auto mode:", err.message);
    process.exit(1);
  });
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const BANNER = `
╔══════════════════════════════════════════════════════════╗
║          Welcome to Coding Agent                         ║
║  Type your instruction and press Enter.                  ║
║  Type 'exit' to quit.                                    ║
║  (Run with --auto to enable autonomous mode)             ║
╚══════════════════════════════════════════════════════════╝
`;

  console.log(BANNER);

  function ask() {
    rl.question("You: ", async (input) => {
      const text = input.trim();

      if (!text) {
        ask();
        return;
      }

      if (text.toLowerCase() === "exit") {
        console.log("\nGoodbye! \n");
        rl.close();
        return;
      }

      try {
        await runAgent(text);
      } catch (err) {
        console.error("Unexpected error:", err.message);
      }

      ask();
    });
  }

  ask();
}
