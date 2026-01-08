/**
 * MCP Tool Definitions for WCLASSGAMES API
 */

// ============================================================================
// Tool Definitions for MCP Server
// ============================================================================

export const toolDefinitions = [
  {
    name: 'get_agent_balance',
    description: 'Retrieve the current balance of the agent account in WCLASSGAMES',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'launch_game',
    description: 'Generate a game launch URL for a player to join WCLASSGAMES',
    inputSchema: {
      type: 'object' as const,
      properties: {
        userToken: {
          type: 'string',
          description: 'JWT bearer token for the user from the agent system',
        },
      },
      required: ['userToken'],
    },
  },
  {
    name: 'get_player_balance',
    description: 'Retrieve the current balance of a specific player in WCLASSGAMES',
    inputSchema: {
      type: 'object' as const,
      properties: {
        userToken: {
          type: 'string',
          description: 'JWT bearer token for the player',
        },
      },
      required: ['userToken'],
    },
  },
  {
    name: 'deposit',
    description: 'Transfer funds into a player\'s balance in WCLASSGAMES',
    inputSchema: {
      type: 'object' as const,
      properties: {
        userToken: {
          type: 'string',
          description: 'JWT bearer token for the player',
        },
        amount: {
          type: 'number',
          description: 'Amount to deposit (must be positive)',
        },
      },
      required: ['userToken', 'amount'],
    },
  },
  {
    name: 'withdraw',
    description: 'Transfer funds out of a player\'s balance in WCLASSGAMES',
    inputSchema: {
      type: 'object' as const,
      properties: {
        userToken: {
          type: 'string',
          description: 'JWT bearer token for the player',
        },
        amount: {
          type: 'number',
          description: 'Amount to withdraw (must be positive)',
        },
      },
      required: ['userToken', 'amount'],
    },
  },
  {
    name: 'get_transfer_history',
    description: 'Retrieve transfer history (deposits/withdrawals) with optional filters',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page: {
          type: 'number',
          description: 'Page number for pagination (default: 1)',
        },
        size: {
          type: 'number',
          description: 'Number of records per page (default: 20, max: 100)',
        },
        startTime: {
          type: 'string',
          description: 'Start time filter (format: YYYY-MM-DD HH:mm:ss)',
        },
        endTime: {
          type: 'string',
          description: 'End time filter (format: YYYY-MM-DD HH:mm:ss)',
        },
        userId: {
          type: 'string',
          description: 'Filter by specific user ID',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_transaction',
    description: 'Get detailed information about a specific transaction by ID',
    inputSchema: {
      type: 'object' as const,
      properties: {
        transactionId: {
          type: 'string',
          description: 'Unique transaction ID (UUID format)',
        },
      },
      required: ['transactionId'],
    },
  },
  {
    name: 'get_transactions',
    description: 'Retrieve a list of game transactions with optional filters (up to 100 records)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page: {
          type: 'number',
          description: 'Page number for pagination (default: 1)',
        },
        size: {
          type: 'number',
          description: 'Number of records per page (default: 20, max: 100)',
        },
        startTime: {
          type: 'string',
          description: 'Start time filter (format: YYYY-MM-DD HH:mm:ss)',
        },
        endTime: {
          type: 'string',
          description: 'End time filter (format: YYYY-MM-DD HH:mm:ss)',
        },
        userId: {
          type: 'string',
          description: 'Filter by specific user ID',
        },
      },
      required: [],
    },
  },
];
