import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

export default class TtyOutputReader {
  static async call(linesOfOutput?: number) {
    const buffer = await this.retrieveBuffer();
    if (!linesOfOutput) {
      return buffer;
    }
    const lines = buffer.split('\n');
    return lines.slice(-linesOfOutput - 1).join('\n');
  }

  static async retrieveBuffer(): Promise<string> {
    const appleScript = `
      tell application "iTerm2"
        tell current session of current window
          contents
        end tell
      end tell
    `;
    const { stdout } = await execPromise(`osascript -e '${appleScript}'`);
    return stdout.trim();
  }
}
