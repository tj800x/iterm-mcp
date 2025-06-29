ObjC.import('stdlib');
const iTerm = Application('iTerm');
iTerm.includeStandardAdditions = true;

function sleep(seconds) { delay(seconds); }
const colorRed = [65535, 0, 0, 0];

iTerm.activate();
sleep(0.5);

let wind = iTerm.currentWindow();
if (!wind) {
  // Defensive: create a window if none exists
  iTerm.createWindowWithProfile({ withProfile: "MCP_CONTROLLED" });
  sleep(1.0); // Let iTerm2 process window creation
  wind = iTerm.currentWindow();
  if (!wind) throw new Error("Failed to create or fetch a window.");
}

