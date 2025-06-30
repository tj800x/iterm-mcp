import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

class SendControlCharacter {
  async send(tty: string, letter: string): Promise<void> {
    // Validate input
    letter = letter.toUpperCase();
    if (!/^[A-Z]$/.test(letter)) {
      throw new Error('Invalid control character letter');
    }

    // Convert to control code
    const controlCode = letter.charCodeAt(0) - 64;

    // AppleScript to send the control character
    const ascript = `
      tell application "iTerm2"
        -- Find the session with the matching TTY and send the character.
        repeat with w in windows
          repeat with t in tabs of w
            repeat with s in sessions of t
              if tty of s is "${tty}" then
                tell s to write text (ASCII character ${controlCode})
                return
              end if
            end repeat
          end repeat
        end repeat
      end tell
    `;

    try {
      await execPromise(`osascript -e '${ascript}'`);
    } catch (error: unknown) {
      throw new Error(`Failed to send control character to TTY ${tty}: ${(error as Error).message}`);
    }
  }
}

export default SendControlCharacter;
