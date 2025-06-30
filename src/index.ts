#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import CommandExecutor from "./CommandExecutor.js";
import TtyOutputReader from "./TtyOutputReader.js";
import SendControlCharacter from "./SendControlCharacter.js";
import SessionManager from "./SessionManager.js";
import iTermState from "./iTermState.js";

const server = new Server(
  {
    name: "iterm-mcp",
    version: "0.4.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "launch_session",
        description: "Launches a new iTerm2 session.",
        inputSchema: {
          type: "object",
          properties: {},
        }
      },
      {
        name: "close_session",
        description: "Closes a specific MCP-controlled iTerm2 session.",
        inputSchema: {
          type: "object",
          properties: {
            tty: {
              type: "string",
              description: "The TTY of the session to close."
            },
          },
          required: ["tty"]
        }
      },
      {
        name: "list_sessions",
        description: "Lists all active iTerm2 sessions managed by this MCP.",
        inputSchema: {
          type: "object",
          properties: {},
        }
      },
      {
        name: "list_all_sessions",
        description: "Lists all iTerm2 sessions regardless of controllability.",
        inputSchema: {
          type: "object",
          properties: {},
        }
      },
      {
        name: "write_to_terminal",
        description: "Writes text to a specific iTerm terminal.",
        inputSchema: {
          type: "object",
          properties: {
            tty: {
              type: "string",
              description: "The TTY of the session to write to."
            },
            command: {
              type: "string",
              description: "The command to run or text to write to the terminal."
            },
          },
          required: ["tty", "command"]
        }
      },
      {
        name: "read_terminal_output",
        description: "Reads the output from a specific iTerm terminal.",
        inputSchema: {
          type: "object",
          properties: {
            tty: {
              type: "string",
              description: "The TTY of the session to read from."
            },
            linesOfOutput: {
              type: "number",
              description: "The number of lines of output to read."
            },
          },
          required: ["tty"]
        }
      },
      {
        name: "send_control_character",
        description: "Sends a control character to a specific iTerm terminal (e.g., Control-C).",
        inputSchema: {
          type: "object",
          properties: {
            tty: {
              type: "string",
              description: "The TTY of the session to send the character to."
            },
            letter: {
              type: "string",
              description: "The letter corresponding to the control character (e.g., 'C' for Control-C)."
            },
          },
          required: ["tty", "letter"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  console.log(`Tool called: ${toolName}`);

  switch (toolName) {
    case "launch_session": {
      const tty = await SessionManager.launchSession();
      return { content: [{ type: "text", text: `Launched session with TTY: ${tty}` }] };
    }
    case "close_session": {
      const tty = String(request.params.arguments?.tty);
      const result = await SessionManager.closeSession(tty);
      return { content: [{ type: "text", text: result }] };
    }
    case "list_sessions": {
      const sessions = await SessionManager.listSessions();
      return { content: [{ type: "text", text: JSON.stringify(sessions, null, 2) }] };
    }
    case "list_all_sessions": {
      const sessions = await SessionManager.listAllSessions();
      return { content: [{ type: "text", text: JSON.stringify(sessions, null, 2) }] };
    }
    case "write_to_terminal": {
      const tty = String(request.params.arguments?.tty);
      const command = String(request.params.arguments?.command);
      const executor = new CommandExecutor();
      await executor.executeCommand(tty, command);
      return { content: [{ type: "text", text: `Wrote command to TTY ${tty}.` }] };
    }
    case "read_terminal_output": {
      const tty = String(request.params.arguments?.tty);
      const linesOfOutput = Number(request.params.arguments?.linesOfOutput) || 25;
      const output = await TtyOutputReader.call(tty, linesOfOutput);
      return { content: [{ type: "text", text: output }] };
    }
    case "send_control_character": {
      const tty = String(request.params.arguments?.tty);
      const letter = String(request.params.arguments?.letter);
      const ttyControl = new SendControlCharacter();
      await ttyControl.send(tty, letter);
      return { content: [{ type: "text", text: `Sent Control-${letter.toUpperCase()} to TTY ${tty}.` }] };
    }
    default:
      throw new Error("Unknown tool");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  await iTermState.getInstance().refresh();
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
