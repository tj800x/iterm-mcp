function run(argv) {
    if (argv.length !== 2) {
        return "Error: TTY and prefix arguments are required.";
    }
    const ttyToClose = argv[0];
    const prefix = argv[1];

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
                    if (session.profileName().startsWith(prefix)) {
                        tab.close();
                        sessionClosed = true;
                        break;
                    }
                }
            }
            if (sessionClosed) break;
        }
        if (sessionClosed) break;
    }

    return sessionClosed ? `Session ${ttyToClose} closed.` : `Error: Could not find a session with TTY ${ttyToClose} matching the required prefix.`;
}
