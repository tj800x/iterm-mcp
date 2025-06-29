function run(argv) {
    if (argv.length !== 1) {
        return "Error: TTY argument is required.";
    }
    const ttyToClose = argv[0];

    const iTerm = Application('iTerm');
    let sessionClosed = false;

    iTerm.windows().forEach(window => {
        window.tabs().forEach(tab => {
            tab.sessions().forEach(session => {
                if (session.tty() === ttyToClose) {
                    if (session.profileName().startsWith("MCP_")) {
                        tab.close(); // Close the parent tab
                        sessionClosed = true;
                        return; // Exit the loop once found and closed
                    }
                }
            });
            if (sessionClosed) return;
        });
        if (sessionClosed) return;
    });

    return sessionClosed ? `Session ${ttyToClose} closed.` : `Error: Could not find an MCP-controlled session with TTY ${ttyToClose}.`;
}
