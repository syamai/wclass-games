#!/usr/bin/env node

/**
 * WCLASSGAMES MCP Server
 *
 * An MCP server that provides tools for interacting with the WCLASSGAMES API.
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file from project root or custom path
const envPath = process.env.ENV_PATH || resolve(import.meta.dirname, '..', '.env');
config({ path: envPath });

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { getConfig } from './config/index.js';
import { WclassGamesClient } from './client/http-client.js';
import { IntegrationService } from './services/integration.service.js';
import { BalanceService } from './services/balance.service.js';
import { DataFeedService } from './services/datafeed.service.js';
import { toolDefinitions } from './tools/index.js';

// Initialize server
const server = new Server(
  {
    name: 'wclassgames-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize services (lazy loading to handle missing config gracefully)
let client: WclassGamesClient | null = null;
let integrationService: IntegrationService | null = null;
let balanceService: BalanceService | null = null;
let dataFeedService: DataFeedService | null = null;

function initializeServices() {
  if (!client) {
    const config = getConfig();
    client = new WclassGamesClient(config);
    integrationService = new IntegrationService(client);
    balanceService = new BalanceService(client);
    dataFeedService = new DataFeedService(client);
  }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolDefinitions,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    initializeServices();

    switch (name) {
      case 'get_agent_balance': {
        const result = await integrationService!.getAgentBalance();
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    balance: result.balance,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, error: result.error }, null, 2),
            },
          ],
          isError: true,
        };
      }

      case 'launch_game': {
        const { userToken } = args as { userToken: string };
        const result = await integrationService!.launchGame(userToken);
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    launchUrl: result.launchUrl,
                    joinToken: result.joinToken,
                    userId: result.userId,
                    expiresAt: result.expiresAt?.toISOString(),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, error: result.error }, null, 2),
            },
          ],
          isError: true,
        };
      }

      case 'get_player_balance': {
        const { userToken } = args as { userToken: string };
        const result = await balanceService!.getPlayerBalance(userToken);
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    balance: result.balance,
                    agentBalance: result.agentBalance,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, error: result.error }, null, 2),
            },
          ],
          isError: true,
        };
      }

      case 'deposit': {
        const { userToken, amount } = args as { userToken: string; amount: number };
        const result = await balanceService!.deposit(userToken, amount);
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    amount: result.amount,
                    balanceBefore: result.balanceBefore,
                    balanceAfter: result.balanceAfter,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, error: result.error }, null, 2),
            },
          ],
          isError: true,
        };
      }

      case 'withdraw': {
        const { userToken, amount } = args as { userToken: string; amount: number };
        const result = await balanceService!.withdraw(userToken, amount);
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    amount: result.amount,
                    balanceBefore: result.balanceBefore,
                    balanceAfter: result.balanceAfter,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, error: result.error }, null, 2),
            },
          ],
          isError: true,
        };
      }

      case 'get_transfer_history': {
        const params = args as {
          page?: number;
          size?: number;
          startTime?: string;
          endTime?: string;
          userId?: string;
        };
        const result = await balanceService!.getTransferHistory(params);
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    items: result.items,
                    pagination: result.pagination,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, error: result.error }, null, 2),
            },
          ],
          isError: true,
        };
      }

      case 'get_transaction': {
        const { transactionId } = args as { transactionId: string };
        const result = await dataFeedService!.getTransaction(transactionId);
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    transaction: result.transaction,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, error: result.error }, null, 2),
            },
          ],
          isError: true,
        };
      }

      case 'get_transactions': {
        const params = args as {
          page?: number;
          size?: number;
          startTime?: string;
          endTime?: string;
          userId?: string;
        };
        const result = await dataFeedService!.getTransactions(params);
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    items: result.items,
                    pagination: result.pagination,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, error: result.error }, null, 2),
            },
          ],
          isError: true,
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown tool: ${name}` }, null, 2),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('WCLASSGAMES MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
