# Web Cloner Agent

An intelligent, AI-driven command-line tool that transforms any live website into clean, responsive HTML, CSS, and vanilla JavaScript. Powered by OpenRouter's language models, it runs a continuous reasoning loop to fetch, interpret, and accurately recreate web interfaces from scratch.

---

## Features & Architecture

This project has evolved well beyond a simple CLI script into a reliable, self-correcting agent system:

### 1. Structured Agentic Reasoning Loop

- Follows a defined execution cycle: `START → THINK → TOOL → OBSERVE → (RETRY) → OUTPUT`.
- **Self-Correcting Behavior:** When a tool call fails (e.g., oversized file, broken URL), the agent enters a `RETRY` phase, diagnoses the issue, and adjusts its strategy automatically.
- **Token Budget Control:** Enforces `max_tokens` limits throughout the loop to prevent context overflow and unexpected credit exhaustion.

### 2. Robust JSON Extraction Engine

- Features a custom **balanced-brace character-level parser** replacing naive JSON parsing.
- Strips out DeepSeek/Reasoning `<think>` blocks before processing.
- Skips Markdown code fences (e.g., ` ```json `).
- Pulls only the *first complete JSON object* found, discarding any extra hallucinated text that chatty models may append.

### 3. Smart Design Extraction (`fetchUrl`)

- Moves beyond raw HTML dumping with an intelligent site analyzer.
- Instead of overwhelming the model with full page markup, it distills:
  - **Design Tokens:** CSS custom properties (`--color-primary`, etc.)
  - **Color Palette:** All detected hex, rgb, and hsl values.
  - **Typography:** Google Fonts referenced by the page.
- Delivers a concise "Analysis Report" alongside a stripped, script-free HTML snapshot — resulting in visually accurate clones.

### 4. Clean, Human-Readable Code Output

- The `writeFile` tool automatically unescapes literal `\n` and `\t` characters in generated content.
- System prompt enforces consistent 2-space indentation throughout all output files.
- End result: properly formatted, multi-line code that reads like hand-written source, not a minified blob.

### 5. Interactive and Autonomous Operation

- **Chat Mode:** Engage with the agent directly and guide it step by step.
- **Autonomous Mode (`--auto`):** A fully hands-free workflow — the agent fetches, analyzes, and generates the clone on its own until completion.

---

## Installation & Setup

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Configure Environment:**

   Update your `.env` file with your OpenRouter API key:

   ```env
   GROQ_API_KEY=sk-or-v1-your-key-here
   GROQ_MODEL=google/gemini-2.0-flash-001
   ```

   > **Note:** Gemini 2.0 Flash is the recommended model for its speed and reliable JSON output, but any OpenRouter-compatible model will work.

---

## Usage

### Interactive Mode

Start a conversation with the agent:

```bash
npm start
```

*Example prompt: "Make a clone of scaler.com"*

### Autonomous Mode

Let the agent handle everything without any input:

```bash
# Clone the default target
npm start -- --auto

# Clone a specific website
npm start -- --auto https://www.scaler.com

# Override the model and step limit
npm start -- --auto https://www.scaler.com --model meta-llama/llama-3.3-70b-instruct --max-steps 30
```

---

## Output

All generated files are written to the `/output/` directory, organized into named project subfolders. Every output is a self-contained, dependency-free bundle of vanilla HTML, CSS, and JavaScript — no frameworks, no build tools required.