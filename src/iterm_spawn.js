function run(argv) {
    ObjC.import('stdlib');
    function sleep(s) { delay(s); }

    const iTerm = Application('iTerm');
    iTerm.activate();
    
    let tab;
    if (iTerm.windows().length === 0) {
        // If no windows exist, create one. This also creates a tab.
        const win = iTerm.createWindow({ withProfile: "MCP_CONTROLLED" });
        tab = win.currentTab();
    } else {
        // If windows exist, create a new tab in the current window.
        let win = iTerm.currentWindow();
        if (!win) {
            // Fallback to the first window if no window is "current"
            win = iTerm.windows[0];
        }
        tab = win.createTab({ withProfile: "MCP_CONTROLLED" });
    }

    // Add a fixed delay to allow iTerm to initialize the session fully.
    sleep(3);

    let session = null;
    // Poll for the session to become available in the new tab.
    for (let i = 0; i < 40; ++i) {
      try { 
        session = tab.currentSession(); 
        if (session) break; 
      } catch (e) {}
      sleep(0.25);
    }

    if (session) {
        return session.tty();
    }
    return "";
}
