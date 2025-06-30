import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface McpSettings {
  mcp_prefix: string;
  mcp_profiles: string[];
}

class SettingsManager {
  private static instance: SettingsManager;
  private settings: McpSettings;

  private constructor() {
    this.settings = this.loadSettings();
  }

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  private loadSettings(): McpSettings {
    try {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      // The settings file is in the root of the project, so we go up one level from src
      const settingsPath = path.join(__dirname, '..', 'iterm_mcp_settings.json');
      const fileContent = readFileSync(settingsPath, 'utf-8');
      const parsedSettings = JSON.parse(fileContent);
      
      // Basic validation
      if (typeof parsedSettings.mcp_prefix !== 'string' || !Array.isArray(parsedSettings.mcp_profiles)) {
        throw new Error("Invalid settings format.");
      }
      
      return parsedSettings;
    } catch (error) {
      console.error("Could not load settings from iterm_mcp_settings.json. Using defaults.", error);
      // Return default settings if file is missing or corrupt
      return {
        mcp_prefix: "MCP_",
        mcp_profiles: ["MCP_CONTROLLED"]
      };
    }
  }

  public getSettings(): McpSettings {
    return this.settings;
  }
}

export default SettingsManager.getInstance();
