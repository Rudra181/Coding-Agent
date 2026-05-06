import { exec } from "child_process";


export async function runCommand(command = "") {
  if (!command) return "Command is required";

  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve(`Command failed: ${error.message}\nStderr: ${stderr}`);
        return;
      }
      resolve(stdout || "Command executed successfully (no output).");
    });
  });
}
