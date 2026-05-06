import axios from "axios";


export async function fetchUrl(url = "") {
  if (!url) return "URL is required";

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 15000,
    });


    const cssVarMatches = data.match(/--[\w-]+\s*:\s*[^;}"]+/g) || [];
    const cssVars = [...new Set(cssVarMatches)].slice(0, 60).join("\n");


    const colorMatches =
      data.match(/#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|hsl\([^)]+\)/g) || [];
    const uniqueColors = [...new Set(colorMatches)].slice(0, 30).join(", ");


    const fontMatches =
      data.match(/font-family\s*:\s*[^;}"]+|fonts\.googleapis\.com\/css[^"']*/g) || [];
    const uniqueFonts = [...new Set(fontMatches)].slice(0, 10).join("\n");


    let structural = data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "[SVG]")
      .replace(/class="[^"]{200,}"/g, 'class="[long-class]"')
      .replace(/\s\s+/g, " ")
      .trim();


    if (structural.length > 12000) {
      structural = structural.substring(0, 12000) + "\n... [HTML Truncated]";
    }


    const report = `
=== WEBSITE ANALYSIS REPORT FOR: ${url} ===

--- DESIGN TOKENS (CSS Variables) ---
${cssVars || "None found (likely a Next.js/Tailwind app — infer from class names)"}

--- COLOR PALETTE ---
${uniqueColors || "No explicit hex/rgb colors found"}

--- FONTS ---
${uniqueFonts || "No font-family declarations found"}

--- STRUCTURAL HTML (first 12,000 chars, scripts/styles removed) ---
${structural}
`.trim();

    return report;
  } catch (error) {
    return `Error fetching URL: ${error.message}`;
  }
}
