function run(argv) {
    ObjC.import('stdlib');
    function sleep(s) { delay(s); }

    const iTerm = Application('iTerm');
    iTerm.activate();
    
    let win = iTerm.currentWindow();
    if (!win) {
        win = iTerm.createWindow({ withProfile: "MCP_CONTROLLED" });
    }
    
    const tab = win.createTab({ withProfile: "MCP_CONTROLLED" });

    let session = null;
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
    return ""; // Return empty string if session not found
}
