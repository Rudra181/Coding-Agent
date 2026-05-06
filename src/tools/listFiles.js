import fs from "fs/promises";
import path from "path";
import { OUTPUT_DIR } from "../utils/paths.js";

export async function listFiles(folderName = "") {
  const targetPath = folderName
    ? path.join(OUTPUT_DIR, folderName)
    : OUTPUT_DIR;

  const items = await fs.readdir(targetPath);
  return items;
}