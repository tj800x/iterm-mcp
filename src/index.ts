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

let activeSession: string | null = null;

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
        description: "Launches a new iTerm2 session with a given name.",
        inputSchema: {
          type: "object",
          properties: {
            sessionName: {
              type: "string",
              description: "The name for the new session."
            },
          },
          required: ["sessionName"]
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
        name: "set_active_session",
        description: "Sets the active iTerm2 session for subsequent commands.",
        inputSchema: {
          type: "object",
          properties: {
            sessionTty: {
              type: "string",
              description: "The TTY of the session to activate."
            },
          },
          required: ["sessionTty"]
        }
      },
      {
        name: "write_to_terminal",
        description: "Writes text to the active iTerm terminal - often used to run a command in the terminal",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "The command to run or text to write to the terminal"
            },
          },
          required: ["command"]
        }
      },
      {
        name: "read_terminal_output",
        description: "Reads the output from the active iTerm terminal",
        inputSchema: {
          type: "object",
          properties: {
            linesOfOutput: {
              type: "number",
              description: "The number of lines of output to read."
            },
          },
        }
      },
      {
        name: "send_control_character",
        description: "Sends a control character to the active iTerm terminal (e.g., Control-C)",
        inputSchema: {
          type: "object",
          properties: {
            letter: {
              type: "string",
              description: "The letter corresponding to the control character (e.g., 'C' for Control-C)"
            },
          },
          required: ["letter"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  console.log(`Tool called: ${toolName}, Active session: ${activeSession}`);
  const toolsRequiringSession = [
    "set_active_session",
    "write_to_terminal",
    "read_terminal_output",
    "send_control_character",
  ];

  if (toolsRequiringSession.includes(toolName) && !activeSession) {
    throw new Error(
      `Tool '${toolName}' requires an active session. Please launch or set an active session.`
    );
  }

  switch (toolName) {
    case "launch_session": {
      const sessionName = String(request.params.arguments?.sessionName);
      const tty = await SessionManager.launchSession(sessionName);
      activeSession = tty;
      return { content: [{ type: "text", text: `Launched and activated session with TTY: ${tty}` }] };
    }
    case "list_sessions": {
      const sessions = await SessionManager.listSessions();
      return { content: [{ type: "text", text: `Available sessions (by TTY): ${sessions.join(', ')}` }] };
    }
    case "list_all_sessions": {
      const sessions = await SessionManager.listAllSessions();
      return { content: [{ type: "text", text: JSON.stringify(sessions, null, 2) }] };
    }
    case "set_active_session": {
      const sessionTty = String(request.params.arguments?.sessionTty);
      await SessionManager.setActiveSession(sessionTty);
      activeSession = sessionTty;
      return { content: [{ type: "text", text: `Active session set to TTY: ${activeSession}` }] };
    }
    case "write_to_terminal": {
      let executor = new CommandExecutor();
      const command = String(request.params.arguments?.command);
      const beforeCommandBuffer = await TtyOutputReader.retrieveBuffer();
      const beforeCommandBufferLines = beforeCommandBuffer.split("\n").length;
      
      await executor.executeCommand(command);
      
      const afterCommandBuffer = await TtyOutputReader.retrieveBuffer();
      const afterCommandBufferLines = afterCommandBuffer.split("\n").length;
      const outputLines = afterCommandBufferLines - beforeCommandBufferLines

      return {
        content: [{
          type: "text",
          text: `${outputLines} lines were output after sending the command to the terminal. Read the last ${outputLines} lines of terminal contents to orient yourself. Never assume that the command was executed or that it was successful.`
        }]
      };
    }
    case "read_terminal_output": {
      const linesOfOutput = Number(request.params.arguments?.linesOfOutput) || 25
      const output = await TtyOutputReader.call(linesOfOutput)

      return {
        content: [{
          type: "text",
          text: output
        }]
      };
    }
    case "send_control_character": {
      const ttyControl = new SendControlCharacter();
      const letter = String(request.params.arguments?.letter);
      await ttyControl.send(letter);
      
      return {
        content: [{
          type: "text",
          text: `Sent control character: Control-${letter.toUpperCase()}`
        }]
      };
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
