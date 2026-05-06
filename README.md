# Coding Agent

An autonomous, AI-powered CLI agent designed to clone any website into high-fidelity, responsive HTML, CSS, and vanilla JS. Leveraging the power of OpenRouter's LLMs, this agent operates in a continuous reasoning loop to fetch, analyze, and faithfully reproduce live web designs.

---

## Features & Architecture Upgrades

This project has been heavily upgraded from a basic CLI into a robust, error-resistant agent:

### 1. Advanced Agentic Loop
- Uses a strict reasoning cycle: `START → THINK → TOOL → OBSERVE → (RETRY) → OUTPUT`.
- **Self-Healing:** If a tool fails (e.g., file too large, invalid URL), the agent triggers a `RETRY` step to evaluate the error and fix its approach.
- **Context Management:** Token caps (`max_tokens`) are enforced to prevent context blowouts and "out of credits" errors.

### 2. Bulletproof JSON Parser
- Replaced basic parsing with a custom **balanced-brace character parser**.
- Automatically strips out DeepSeek/Reasoning `<think>` blocks.
- Ignores Markdown code fences (e.g., ` ```json `).
- Extracts only the *first complete JSON object* found, completely ignoring any hallucinated extra text output by chatty models.

### 3. Intelligent Design Extraction (`fetchUrl`)
- Replaced the basic raw HTML fetcher with a smart analyzer.
- Instead of crashing the LLM with massive amounts of HTML, it extracts:
  - **Design Tokens:** CSS variables (`--color-primary`, etc.)
  - **Color Palette:** Extracts all raw hex, rgb, and hsl values.
  - **Typography:** Identifies Google Fonts used.
- It provides the agent with a clean "Analysis Report" and a truncated, script-free HTML structure, resulting in highly accurate visual clones.

### 4. Human-Readable Code Generation
- The `writeFile` tool now automatically unescapes literal `\n` and `\t` characters.
- System prompt enforces strict 2-space indentation rules.
- Result: The agent writes perfectly formatted, multi-line code files that look like they were written by a human developer, not a single-line minified blob.

### 5. Autonomous & Interactive Modes
- **Chat Mode:** Run interactively and guide the agent step-by-step.
- **Autonomous Mode (`--auto`):** A zero-click workflow. The agent will fetch, design, and write the clone completely on its own until it is finished.

---

## Installation & Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Update your `.env` file with your OpenRouter API key.
   ```env
   GROQ_API_KEY=sk-or-v1-your-key-here
   GROQ_MODEL=google/gemini-2.0-flash-001
   ```
   *(Note: Gemini 2.0 Flash is recommended for its blazing speed and perfect JSON adherence, but you can use any OpenRouter model).*

---

## Usage

### Interactive Mode
Talk to the agent directly:
```bash
npm start
```
*Example: "Make a clone of scaler.com"*

### Autonomous Mode
Let the agent do everything automatically.
```bash
# Clone the default target
npm start -- --auto

# Clone a specific website
npm start -- --auto https://www.scaler.com

# Override the model and max steps
npm start -- --auto https://www.scaler.com --model meta-llama/llama-3.3-70b-instruct --max-steps 30
```

---

## Generated Output
All generated code is saved safely to the `/output/` directory, organized into project folders by the agent. The output is entirely dependency-free vanilla HTML, CSS, and JS.
