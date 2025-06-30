function run(argv) {
    if (argv.length !== 1) {
        return "Error: Profile name argument is required.";
    }
    const profileName = argv[0];

    const app = Application.currentApplication();
    app.includeStandardAdditions = true;

    const appleScript = `
      tell application "iTerm2"
        activate
        
        if (count of windows) is 0 then
          create window with profile "${profileName}"
        else
          tell current window
            create tab with profile "${profileName}"
          end tell
        end if
        
        delay 1
        
        tell current window to tell current tab to tell current session
          return tty
        end tell
      end tell
    `;

    return app.doShellScript(`osascript -e '${appleScript.replace(/'/g, "'\\''")}'`);
}
