import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { openSync, closeSync, appendFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import ProcessTracker from './ProcessTracker.js';
import TtyOutputReader from './TtyOutputReader.js';
import { after } from 'node:test';

const execPromise = promisify(exec);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class CommandExecutor {
  async executeCommand(command: string): Promise<string> {
    const escapedCommand = command.replace(/"/g, '\\"');
    const appleScript = `
      tell application "iTerm2"
        tell current session of current window
          write text "${escapedCommand}"
        end tell
      end tell
    `;
    try {
      await execPromise(`osascript -e '${appleScript}'`);
      await sleep(500);
      return await TtyOutputReader.retrieveBuffer();
    } catch (error: unknown) {
      throw new Error(`Failed to execute command: ${(error as Error).message}`);
    }
  }

  async isWaitingForUserInput(ttyPath: string): Promise<boolean> {
    let fd;
    try {
      // Open the TTY file descriptor in non-blocking mode
      fd = openSync(ttyPath, 'r');
      const tracker = new ProcessTracker();
      let belowThresholdTime = 0;
      
      while (true) {
        try {
          const activeProcess = await tracker.getActiveProcess(ttyPath);
          
          if (!activeProcess) return true;

          if (activeProcess.metrics.totalCPUPercent < 1) {
            belowThresholdTime += 350;
            if (belowThresholdTime >= 1000) return true;
          } else {
            belowThresholdTime = 0;
          }

        } catch {
          return true;
        }

        await sleep(350);
      }
    } catch (error: unknown) {
      return true;
    } finally {
      if (fd !== undefined) {
        closeSync(fd);
      }
      return true;
    }
  }


  private async retrieveTtyPath(): Promise<string> {
    try {
      const { stdout } = await execPromise(`/usr/bin/osascript -e 'tell application "iTerm2" to tell current session of current window to get tty'`);
      return stdout.trim();
    } catch (error: unknown) {
      throw new Error(`Failed to retrieve TTY path: ${(error as Error).message}`);
    }
  }

  private async isProcessing(): Promise<boolean> {
    try {
      const { stdout } = await execPromise(`/usr/bin/osascript -e 'tell application "iTerm2" to tell current session of current window to get is processing'`);
      return stdout.trim() === 'true';
    } catch (error: unknown) {
      throw new Error(`Failed to check processing status: ${(error as Error).message}`);
    }
  }
}

export default CommandExecutor;
