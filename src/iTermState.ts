import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execPromise = promisify(exec);

export interface iTermSession {
  id: string;
  name: string;
  tty: string;
  profileName: string;
  isProcessing: boolean;
}

interface iTermTab {
  id: string;
  sessions: iTermSession[];
}

interface iTermWindow {
  id: string;
  tabs: iTermTab[];
}

export default class iTermState {
  private static instance: iTermState;
  private windows: iTermWindow[] = [];

  private constructor() {}

  public static getInstance(): iTermState {
    if (!iTermState.instance) {
      iTermState.instance = new iTermState();
    }
    return iTermState.instance;
  }

  public async refresh(): Promise<void> {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const scriptPath = path.join(__dirname, 'iterm_sessions.js');
    const command = `osascript -l JavaScript ${scriptPath}`;
    try {
      const { stdout, stderr } = await execPromise(command);
      if (stderr) {
        console.error(`OsaScript stderr: ${stderr}`);
      }
      // It's better to check if stdout is empty or just whitespace
      if (!stdout.trim()) {
        console.error("OsaScript produced no output. Current sessions are empty or iTerm is not running.");
        this.windows = [];
        return;
      }
      const sessions: iTermSession[] = JSON.parse(stdout);
      this.windows = [{
        id: "dummy_window",
        tabs: [{
          id: "dummy_tab",
          sessions: sessions
        }]
      }];
    } catch (error) {
      console.error("Error executing osascript:", error);
      this.windows = [];
    }
  }

  public getSessions(): iTermSession[] {
    return this.windows.flatMap(w => w.tabs.flatMap(t => t.sessions));
  }

  public getSessionByTty(tty: string): iTermSession | undefined {
    return this.getSessions().find(s => s.tty === tty);
  }
}
