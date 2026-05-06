import fs from "fs/promises";
import path from "path";
import { OUTPUT_DIR } from "../utils/paths.js";

export async function readFile(args = {}) {
  const { folderName, fileName } = args;

  if (!folderName || !fileName) {
    return "folderName and fileName are required";
  }

  const filePath = path.join(OUTPUT_DIR, folderName, fileName);
  const data = await fs.readFile(filePath, "utf-8");

  return data;
}