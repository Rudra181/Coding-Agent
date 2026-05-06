
export function parseResponse(raw) {
  if (raw === null || raw === undefined) {
    throw new Error("Received null or undefined response from model.");
  }
  
  let cleaned = String(raw).trim();

  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();

  const start = cleaned.indexOf("{");
  if (start === -1) {
    throw new Error("No JSON object found in response.");
  }

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\" && inString) {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        const jsonOnly = cleaned.substring(start, i + 1);
        try {
          return JSON.parse(jsonOnly);
        } catch (err) {
          // If JSON.parse fails, try a simple fix for common LLM JSON errors (like trailing commas)
          try {
             // Basic regex to remove trailing commas before closing braces/brackets
             const fixedJson = jsonOnly.replace(/,(\s*[\]}])/g, '$1');
             return JSON.parse(fixedJson);
          } catch (e) {
             throw new Error(`JSON parse error: ${err.message}. Content: ${jsonOnly.substring(0, 100)}...`);
          }
        }
      }
    }
  }

  throw new Error("Incomplete JSON object in response (unmatched braces). The model's response might have been truncated.");
}
