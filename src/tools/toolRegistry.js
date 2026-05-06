import { createFolder } from "./createFolder.js";
import { writeFile } from "./writeFile.js";
import { readFile } from "./readFile.js";
import { listFiles } from "./listFiles.js";
import { fetchUrl } from "./fetchUrl.js";
import { runCommand } from "./runCommand.js";
import { installPackage } from "./installPackage.js";

export const toolRegistry = {
  createFolder,
  writeFile,
  readFile,
  listFiles,
  fetchUrl,
  runCommand,
  installPackage
};