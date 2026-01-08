/**
 * Configuration loader for WCLASSGAMES MCP Server
 */

export interface Config {
  agentId: string;
  agentSecret: string;
  apiHost: string;
}

function getEnvVar(name: string, required: boolean = true): string {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || '';
}

export function loadConfig(): Config {
  return {
    agentId: getEnvVar('AGENT_ID'),
    agentSecret: getEnvVar('AGENT_SECRET'),
    apiHost: getEnvVar('API_HOST', false) || 'https://ca-api.cateleca.com/api/crypto',
  };
}

// Singleton config instance
let configInstance: Config | null = null;

export function getConfig(): Config {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

export function resetConfig(): void {
  configInstance = null;
}
