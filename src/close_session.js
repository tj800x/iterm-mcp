function run(argv) {
    if (argv.length !== 1) {
        return "Error: TTY argument is required.";
    }
    const ttyToClose = argv[0];

    const iTerm = Application('iTerm');
    let sessionClosed = false;

    const windows = iTerm.windows();
    for (let i = windows.length - 1; i >= 0; i--) {
        const window = windows[i];
        const tabs = window.tabs();
        for (let j = tabs.length - 1; j >= 0; j--) {
            const tab = tabs[j];
            const sessions = tab.sessions();
            for (let k = sessions.length - 1; k >= 0; k--) {
                const session = sessions[k];
                if (session.tty() === ttyToClose) {
                    if (session.profileName().startsWith("MCP_")) {
                        tab.close();
                        sessionClosed = true;
                        // Using break statements to exit the loops
                        break;
                    }
                }
            }
            if (sessionClosed) break;
        }
        if (sessionClosed) break;
    }

    return sessionClosed ? `Session ${ttyToClose} closed.` : `Error: Could not find an MCP-controlled session with TTY ${ttyToClose}.`;
}
