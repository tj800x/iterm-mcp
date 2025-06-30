
function createTabWithProfileAndColor(window, profile, color) {
  // Create the tab with the given profile
  const tab = window.createTab({ withProfile: profile });

  // Wait for the session to become available and set its color
  let session;
  let retries = 20;
  while (retries-- > 0) {
    try {
      session = tab.currentSession();
      if (session) {
        session.foregroundColor = $(color);

        // Defensive: wait a moment for tty to appear
        let ttyRetries = 10;
        let tty;
        while (ttyRetries-- > 0) {
          tty = session.tty();
          if (tty && tty.length > 0) {
            return { tab, session, tty };
          }
          delay(0.2);
        }
        throw new Error("Session created but tty unavailable.");
      }
    } catch (e) {
      // Ignore transient failures
    }
    delay(0.3);
  }
  throw new Error("Failed to set session foreground color in new tab.");
}


ObjC.import('stdlib');
const iTerm = Application('iTerm');
iTerm.includeStandardAdditions = true;

iTerm.activate();
const wind = iTerm.currentWindow();
const colorRed = [65535, 0, 0, 0];

try {
  const newTab = createTabWithProfileAndColor(wind, "MCP_CONTROLLED", colorRed);
  // Optionally, do more with `newTab` or its session...
} catch (e) {
  // console.log(e.message);
}
