# iTerm2 Multi-Session MCP Server

This is a fork of the original [iterm-mcp repository](https://github.com/pashpashpash/iterm-mcp), heavily modified and tested for use with Cline to provide robust, multi-session iTerm2 control.

**This tool is for macOS only.** Windows users should refer to the original repository.

![Main Image](.github/images/demo.gif)

## 🚨 WARNING: ALPHA QUALITY SOFTWARE 🚨

This software is of ALPHA quality. By using this tool, you acknowledge and accept **ALL THE RISKS OF LETTING AN AI CONTROL YOUR TERMINAL SESSIONS.** The user is solely responsible for monitoring the AI's actions and ensuring the safety and integrity of their system. Start with focused, simple tasks and always supervise the AI's behavior.

## Features

*   **True Multi-Session Control:** Launch, manage, and interact with multiple, independent iTerm2 sessions simultaneously.
*   **Configurable & Sandboxed:** Control which iTerm profiles the AI can access via a simple JSON configuration file. It is strongly recommended to use dedicated, sandboxed profiles with limited permissions for AI use.
*   **REPL Support:** Launch sessions with specific profiles designed to start a REPL, such as for Python or Julia, enabling powerful, environment-specific automation.
*   **Tested with Cline:** This fork has been tested with Cline to ensure stability and reliability across various edge cases.

## Safety & Configuration

This MCP will only control iTerm sessions that are launched with a profile name listed in the `iterm_mcp_settings.json` file. Furthermore, all safety checks (like closing a session) rely on the profile name starting with a configurable prefix (default: `"MCP_"`).

It is **highly recommended** to create specific iTerm profiles for the AI that are sandboxed or have limited permissions. Do not give the AI access to profiles with broad administrative privileges unless you fully understand and accept the risks.

### `iterm_mcp_settings.json`

Create this file in the root of the `iterm-mcp` project directory to configure the server:

```json
{
  "mcp_prefix": "MCP_",
  "mcp_profiles": [
    "MCP_ZSH_SANDBOXED",
    "MCP_PYTHON",
    "MCP_JULIA"
  ]
}
```

*   `mcp_prefix`: A safety prefix used to identify all sessions controlled by this MCP.
*   `mcp_profiles`: A list of the exact profile names that the AI is allowed to launch.

## Tools

*   **`get_mcp_profiles`**: Returns a list of the available MCP profiles that can be launched. These are the profiles defined in `iterm_mcp_settings.json` that the AI is allowed to use.
    *   Arguments: None
*   **`all_profiles`**: Returns a list of all available iTerm2 profiles, regardless of whether they are MCP-enabled. Note that only profiles listed in `iterm_mcp_settings.json` can be launched by the AI.
    *   Arguments: None
*   **`launch_session`**: Launches a new iTerm2 session with a specific, allowed profile.
    *   Arguments:
        *   `profile_name` (string, required): The name of the profile to launch from the `mcp_profiles` list.
*   **`close_session`**: Closes a specific MCP-controlled iTerm2 session.
    *   Arguments:
        *   `tty` (string, required): The TTY of the session to close (e.g., `"/dev/ttys007"`).
*   **`list_sessions`**: Lists all active iTerm2 sessions managed by this MCP (matching the `mcp_prefix`).
    *   Arguments: None
*   **`list_all_sessions`**: Lists all iTerm2 sessions regardless of controllability.
    *   Arguments: None
*   **`execute_command_in_terminal`**: Executes a command or writes text to a specific iTerm terminal. **Note:** For commands to execute, you must include a newline character (`\n`) at the end of the command string.
    *   Arguments:
        *   `tty` (string, required): The TTY of the session to write to.
        *   `command` (string, required): The command or text to write.
*   **`write_base64_to_terminal`**: Writes a Base64 encoded string to a specific iTerm terminal. This is the most reliable way to write complex strings with special characters. **Note:** This tool does not automatically add a newline character. If you need one, you must include it in the original string before encoding.
    *   Arguments:
        *   `tty` (string, required): The TTY of the session to write to.
        *   `base64_command` (string, required): The Base64 encoded string to write.
*   **`read_terminal_output`**: Reads output from a specific iTerm terminal.
    *   Arguments:
        *   `tty` (string, required): The TTY of the session to read from.
        *   `linesOfOutput` (number, optional): The number of recent lines to read. Defaults to 25.
*   **`send_control_character`**: Sends a control character to a specific iTerm terminal. This is useful for interrupting a hung or long-running process (e.g., sending `C` for `Ctrl-C`).
    *   Arguments:
        *   `tty` (string, required): The TTY of the session to send the character to.
        *   `letter` (string, required): The letter for the control character (e.g., `"C"`, `"D"`, `"Z"`).

## Usage Notes

If the user asks for help with a command or issue within a managed iTerm session, the AI should use the `read_terminal_output` tool to assess the situation and provide assistance.

## Installation

1.  **Clone this Fork**:
    ```bash
    git clone https://github.com/tj800x/iterm-mcp.git
    cd iterm-mcp
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Build the Project**:
    ```bash
    npm run build
    ```

4.  **Configure Cline**:
    Add the server configuration to your Cline settings.

## License

Licensed under MIT - see [LICENSE](LICENSE) file.
