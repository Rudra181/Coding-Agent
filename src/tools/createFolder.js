import fs from "fs/promises";
import path from "path";
import { OUTPUT_DIR } from "../utils/paths.js";

export async function createFolder(folderName = "") {
  if (!folderName.trim()) {
    return "Folder name is required";
  }

  const folderPath = path.join(OUTPUT_DIR, folderName);
  await fs.mkdir(folderPath, { recursive: true });

  return `Folder created successfully at: ${folderPath}`;
}