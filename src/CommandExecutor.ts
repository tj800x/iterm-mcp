import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

class CommandExecutor {
  async executeCommand(tty: string, command: string): Promise<void> {
    // This is the canonical way to safely pass a command to a shell.
    // The 'quoted form of' property handles all necessary escaping.
    const appleScript = `
      tell application "iTerm2"
        repeat with w in windows
          repeat with t in tabs of w
            repeat with s in sessions of t
              if tty of s is "${tty}" then
                tell s to write text "eval " & (quoted form of "${command}")
                return
              end if
            end repeat
          end repeat
        end repeat
      end tell
    `;
    try {
      await execPromise(`osascript -e '${appleScript.replace(/'/g, "'\\''")}'`);
    } catch (error: unknown) {
      throw new Error(`Failed to execute command in TTY ${tty}: ${(error as Error).message}`);
    }
  }
}

export default CommandExecutor;
