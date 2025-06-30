import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

export default class TtyOutputReader {
  static async call(tty: string, linesOfOutput?: number) {
    const buffer = await this.retrieveBuffer(tty);
    if (!linesOfOutput) {
      return buffer;
    }
    const lines = buffer.split('\n');
    return lines.slice(-linesOfOutput).join('\n');
  }

  static async retrieveBuffer(tty: string): Promise<string> {
    const appleScript = `
      tell application "iTerm2"
        -- Find the session with the matching TTY and get its contents.
        repeat with w in windows
          repeat with t in tabs of w
            repeat with s in sessions of t
              if tty of s is "${tty}" then
                return contents of s
              end if
            end repeat
          end repeat
        end repeat
        return "Error: Could not find session with TTY ${tty}"
      end tell
    `;
    const { stdout } = await execPromise(`osascript -e '${appleScript}'`);
    return stdout.trim();
  }
}
