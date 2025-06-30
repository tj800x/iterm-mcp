ObjC.import('stdlib');

const systemEvents = Application('System Events');
const iTerm = Application('iTerm');
iTerm.includeStandardAdditions = true;

function sleep(seconds) {
  iTerm.delay(seconds);
}

const isRunning = systemEvents.processes.byName('iTerm2').exists();
let startupCondition = 0;

if (isRunning) {
  // console.log("Was Running");
  iTerm.activate();
  const windows = iTerm.windows.whose({ visible: true });
  const windowCount = windows.length;
  // console.log(`WindowCount=${windowCount}`);
  if (windowCount === 0) {
    // console.log("Special Boundary Case");
    startupCondition = 1;
  } else {
    startupCondition = 2;
  }
} else {
  // console.log("Starting");
  iTerm.activate();
  startupCondition = 0;
}

// console.log(`Starting Condition = ${startupCondition}`);

if (startupCondition === 1) {
  iTerm.createWindowWithProfile('MCP_CONTROLLED');
}

if (startupCondition < 5) {
  const currentWindow = iTerm.currentWindow();
  let targetSession;
  if (startupCondition > 1) {
    const newTab = currentWindow.createTabWithProfile('MCP_CONTROLLED');
    targetSession = newTab.currentSession();
  } else {
    targetSession = currentWindow.currentSession();
  }

  sleep(3);

  let retries = 20;
  let success = false;
  while (retries > 0 && !success) {
    try {
      // ⭐ Fix: wrap the array for AppleScript compatibility!
      targetSession.foregroundColor = $([65535, 0, 0, 0]);
      success = true;
    } catch (e) {
      sleep(1);
      retries--;
    }
  }

  if (!success) {
    // console.log("Failed to set foreground color after retries.");
  }
}

// Final color reset, again wrap the array
const session = iTerm.currentWindow().currentSession();
session.foregroundColor = $([65535, 65535, 65535, 0]);

const thisTTY = session.tty();
// console.log(`TTY is ${thisTTY}`);
