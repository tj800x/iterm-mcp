import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

class CommandExecutor {
  async executeCommand(tty: string, command: string): Promise<void> {
    const base64Text = Buffer.from(command).toString('base64');
    const appleScript = `
      set decoded_text to do shell script "echo " & (quoted form of "${base64Text}") & " | base64 -d"
      tell application "iTerm2"
        repeat with w in windows
          repeat with t in tabs of w
            repeat with s in sessions of t
              if tty of s is "${tty}" then
                tell s to write text decoded_text
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

  async writeBase64(tty: string, base64Command: string): Promise<void> {
    const appleScript = `
      set decoded_text to do shell script "echo " & (quoted form of "${base64Command}") & " | base64 -d"
      tell application "iTerm2"
        repeat with w in windows
          repeat with t in tabs of w
            repeat with s in sessions of t
              if tty of s is "${tty}" then
                tell s to write text decoded_text
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
      throw new Error(`Failed to write base64 text to TTY ${tty}: ${(error as Error).message}`);
    }
  }
}

export default CommandExecutor;
