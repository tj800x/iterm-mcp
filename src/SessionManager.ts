import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import iTermState, { iTermSession } from './iTermState.js';

const execPromise = promisify(exec);

export default class SessionManager {
  static async launchSession(): Promise<string> {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const scriptPath = path.join(__dirname, 'iterm_spawn.js');
    const command = `osascript -l JavaScript ${scriptPath}`;
    
    const { stdout } = await execPromise(command);
    const tty = stdout.trim();

    await iTermState.getInstance().refresh();
    return tty;
  }

  static async listSessions(): Promise<iTermSession[]> {
    await iTermState.getInstance().refresh();
    return iTermState.getInstance().getSessions()
      .filter(s => s.profileName.startsWith('MCP_'));
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

  static async closeSession(tty: string): Promise<string> {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const scriptPath = path.join(__dirname, 'close_session.js');
    const command = `osascript -l JavaScript ${scriptPath} ${tty}`;
    
    const { stdout } = await execPromise(command);
    return stdout.trim();
  }
}
