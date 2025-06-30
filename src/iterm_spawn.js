function run(argv) {
    const app = Application.currentApplication();
    app.includeStandardAdditions = true;

    // Using a raw AppleScript string is more robust for this specific edge case.
    const appleScript = `
      tell application "iTerm2"
        activate
        
        if (count of windows) is 0 then
          create window with profile "MCP_CONTROLLED"
        else
          tell current window
            create tab with profile "MCP_CONTROLLED"
          end tell
        end if
        
        -- Give the new session a moment to initialize before getting its TTY
        delay 1
        
        tell current window to tell current tab to tell current session
          return tty
        end tell
      end tell
    `;

    // The 'osascript -e' command executes the script string.
    return app.doShellScript(`osascript -e '${appleScript.replace(/'/g, "'\\''")}'`);
}
