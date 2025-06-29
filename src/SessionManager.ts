import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import iTermState, { iTermSession } from './iTermState.js';

const execPromise = promisify(exec);

export default class SessionManager {
  static async launchSession(sessionName: string): Promise<string> {
    const appleScript = `
      tell application "iTerm2"
        create window with profile "MCP_CONTROLLED"
        tell current session of current window
          set name to "${sessionName}"
          return tty
        end tell
      end tell
    `;
    const { stdout } = await execPromise(`osascript -e '${appleScript}'`);
    const tty = stdout.trim();
    await iTermState.getInstance().refresh();
    return tty;
  }

  static async listSessions(): Promise<string[]> {
    await iTermState.getInstance().refresh();
    return iTermState.getInstance().getSessions()
      .filter(s => s.profileName === 'MCP_CONTROLLED')
      .map(s => s.tty);
  }
  
  static async listAllSessions(): Promise<iTermSession[]> {
    await iTermState.getInstance().refresh();
    return iTermState.getInstance().getSessions();
  }
  
  static async setActiveSession(tty: string): Promise<void> {
    const appleScript = `
      tell application "iTerm2"
        repeat with w in windows
          repeat with t in tabs of w
            if tty of session of t is "${tty}" then
              tell w
                activate
              end tell
              tell t
                select
              end tell
              return
            end if
          end repeat
        end repeat
      end tell
    `;
    await execPromise(`osascript -e '${appleScript}'`);
  }
}
