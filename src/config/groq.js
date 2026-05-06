import "dotenv/config";
import OpenAI from "openai";

const groq = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.GROQ_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Coding Agent",
  },
});

export default groq;