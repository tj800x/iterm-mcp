import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import iTermState, { iTermSession } from './iTermState.js';
import SettingsManager from './SettingsManager.js';

const execPromise = promisify(exec);

export default class SessionManager {
  static async launchSession(profileName: string): Promise<string> {
    const { mcp_profiles } = SettingsManager.getSettings();
    if (!mcp_profiles.includes(profileName)) {
      throw new Error(`Profile "${profileName}" is not in the list of allowed MCP profiles.`);
    }

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const scriptPath = path.join(__dirname, 'iterm_spawn.js');
    const command = `osascript -l JavaScript ${scriptPath} "${profileName}"`;
    
    const { stdout } = await execPromise(command);
    const tty = stdout.trim();

    await iTermState.getInstance().refresh();
    return tty;
  }

  static async listSessions(): Promise<iTermSession[]> {
    const { mcp_prefix } = SettingsManager.getSettings();
    await iTermState.getInstance().refresh();
    return iTermState.getInstance().getSessions()
      .filter(s => s.profileName.startsWith(mcp_prefix));
  }
  
  static getMcpProfiles(): string[] {
    return SettingsManager.getSettings().mcp_profiles;
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
    const { mcp_prefix } = SettingsManager.getSettings();
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const scriptPath = path.join(__dirname, 'close_session.js');
    const command = `osascript -l JavaScript ${scriptPath} ${tty} ${mcp_prefix}`;
    
    const { stdout } = await execPromise(command);
    return stdout.trim();
  }
}
