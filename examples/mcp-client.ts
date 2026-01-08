/**
 * MCP Client Wrapper for WCLASSGAMES
 *
 * This module provides a simple interface to connect to the WCLASSGAMES MCP server
 * and call its tools.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface McpClientOptions {
  serverPath?: string;
  envPath?: string;
}

export class WclassGamesMcpClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private serverPath: string;
  private envPath: string;

  constructor(options: McpClientOptions = {}) {
    this.serverPath = options.serverPath || resolve(__dirname, '..', 'dist', 'index.js');
    this.envPath = options.envPath || resolve(__dirname, '..', '.env');
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    console.log('🔌 Connecting to WCLASSGAMES MCP Server...');
    console.log(`   Server: ${this.serverPath}`);
    console.log(`   Env: ${this.envPath}`);

    this.transport = new StdioClientTransport({
      command: 'node',
      args: [this.serverPath],
      env: {
        ...process.env,
        ENV_PATH: this.envPath,
      },
    });

    this.client = new Client(
      {
        name: 'wclassgames-example-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await this.client.connect(this.transport);
    console.log('✅ Connected to MCP Server\n');
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.transport = null;
      console.log('\n🔌 Disconnected from MCP Server');
    }
  }

  /**
   * List all available tools
   */
  async listTools(): Promise<string[]> {
    if (!this.client) throw new Error('Not connected');

    const result = await this.client.listTools();
    return result.tools.map((t) => t.name);
  }

  /**
   * Call a tool with the given arguments
   */
  async callTool(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
    if (!this.client) throw new Error('Not connected');

    console.log(`📤 Calling tool: ${name}`);
    if (Object.keys(args).length > 0) {
      console.log(`   Args: ${JSON.stringify(args, null, 2)}`);
    }

    const result = await this.client.callTool({ name, arguments: args });

    // Parse the result
    const content = result.content as Array<{ type: string; text: string }>;
    if (content && content[0]?.type === 'text') {
      const parsed = JSON.parse(content[0].text);
      console.log(`📥 Response: ${JSON.stringify(parsed, null, 2)}\n`);
      return parsed;
    }

    return result;
  }

  // ============================================================================
  // Convenience Methods for WCLASSGAMES Tools
  // ============================================================================

  /**
   * Get the agent balance
   */
  async getAgentBalance(): Promise<{ success: boolean; balance?: number; error?: string }> {
    return (await this.callTool('get_agent_balance')) as {
      success: boolean;
      balance?: number;
      error?: string;
    };
  }

  /**
   * Launch a game for a player
   */
  async launchGame(userToken: string): Promise<{
    success: boolean;
    launchUrl?: string;
    joinToken?: string;
    userId?: number;
    expiresAt?: string;
    error?: string;
  }> {
    return (await this.callTool('launch_game', { userToken })) as {
      success: boolean;
      launchUrl?: string;
      joinToken?: string;
      userId?: number;
      expiresAt?: string;
      error?: string;
    };
  }

  /**
   * Get a player's balance
   */
  async getPlayerBalance(userToken: string): Promise<{
    success: boolean;
    balance?: string;
    agentBalance?: string;
    error?: string;
  }> {
    return (await this.callTool('get_player_balance', { userToken })) as {
      success: boolean;
      balance?: string;
      agentBalance?: string;
      error?: string;
    };
  }

  /**
   * Deposit funds to a player
   */
  async deposit(
    userToken: string,
    amount: number
  ): Promise<{
    success: boolean;
    amount?: number;
    balanceBefore?: number;
    balanceAfter?: number;
    error?: string;
  }> {
    return (await this.callTool('deposit', { userToken, amount })) as {
      success: boolean;
      amount?: number;
      balanceBefore?: number;
      balanceAfter?: number;
      error?: string;
    };
  }

  /**
   * Withdraw funds from a player
   */
  async withdraw(
    userToken: string,
    amount: number
  ): Promise<{
    success: boolean;
    amount?: number;
    balanceBefore?: number;
    balanceAfter?: number;
    error?: string;
  }> {
    return (await this.callTool('withdraw', { userToken, amount })) as {
      success: boolean;
      amount?: number;
      balanceBefore?: number;
      balanceAfter?: number;
      error?: string;
    };
  }

  /**
   * Get transfer history
   */
  async getTransferHistory(params?: {
    page?: number;
    size?: number;
    startTime?: string;
    endTime?: string;
    userId?: string;
  }): Promise<{
    success: boolean;
    items?: Array<{
      id: number;
      userId: string;
      userName: string;
      type: string;
      changed: string;
      available: string;
      transactionId: string;
      createdAt: string;
    }>;
    pagination?: {
      totalElement: number;
      totalPage: number;
      page: number;
      size: number;
      hasNext: boolean;
    };
    error?: string;
  }> {
    return (await this.callTool('get_transfer_history', params || {})) as any;
  }

  /**
   * Get a specific transaction
   */
  async getTransaction(transactionId: string): Promise<{
    success: boolean;
    transaction?: {
      id: number;
      userId: string;
      userName: string;
      type: string;
      changed: string;
      available: string;
      gameType: string;
      gameDetails: {
        id: string;
        tradeAmount: string;
        gameCoin: string;
        status: string;
        pnl: string;
        result: string;
      };
    };
    error?: string;
  }> {
    return (await this.callTool('get_transaction', { transactionId })) as any;
  }

  /**
   * Get list of transactions
   */
  async getTransactions(params?: {
    page?: number;
    size?: number;
    startTime?: string;
    endTime?: string;
    userId?: string;
  }): Promise<{
    success: boolean;
    items?: Array<{
      id: number;
      userId: string;
      userName: string;
      type: string;
      changed: string;
      gameType: string;
      createdAt: string;
    }>;
    pagination?: {
      totalElement: number;
      totalPage: number;
      page: number;
      size: number;
      hasNext: boolean;
    };
    error?: string;
  }> {
    return (await this.callTool('get_transactions', params || {})) as any;
  }
}

export default WclassGamesMcpClient;
