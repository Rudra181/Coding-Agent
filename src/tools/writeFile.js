import fs from "fs/promises";
import path from "path";
import { OUTPUT_DIR } from "../utils/paths.js";

export async function writeFile(args = {}) {
  const { folderName, fileName, content } = args;

  if (!folderName || !fileName) {
    return "folderName and fileName are required";
  }

  const folderPath = path.join(OUTPUT_DIR, folderName);
  await fs.mkdir(folderPath, { recursive: true });

  const filePath = path.join(folderPath, fileName);


  const finalContent = (content ?? "").replace(/\\n/g, "\n").replace(/\\t/g, "\t");
  await fs.writeFile(filePath, finalContent, "utf-8");

  return `File written successfully: ${filePath}`;
}