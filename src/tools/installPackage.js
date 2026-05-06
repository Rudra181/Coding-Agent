import { runCommand } from "./runCommand.js";


export async function installPackage(packageName = "") {
  if (!packageName) return "Package name is required";

  const result = await runCommand(`npm install ${packageName}`);
  return `Installation result for ${packageName}: ${result}`;
}
