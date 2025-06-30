import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execPromise = promisify(exec);

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const scriptPath = path.join(__dirname, 'iterm_sessions.js');
  const command = `osascript -l JavaScript ${scriptPath}`;

  console.error(`Executing command: ${command}`);

  try {
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.error('Stderr:', stderr);
    }

    console.error('Stdout:', stdout);
    
    if (stdout.trim()) {
        const sessions = JSON.parse(stdout);
        console.error('Parsed sessions:', sessions);
    } else {
        console.error('No sessions found or iTerm is not running.');
    }

  } catch (error) {
    console.error('Error executing script:', error);
  }
}

main();
