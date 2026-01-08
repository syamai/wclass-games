# WCLASSGAMES MCP Examples

This directory contains example code demonstrating how to use the WCLASSGAMES MCP server programmatically.

## Prerequisites

1. **Build the MCP server first:**
   ```bash
   cd ..
   npm install
   npm run build
   ```

2. **Configure your credentials:**
   Create a `.env` file in the project root with your WCLASSGAMES credentials.

3. **Install example dependencies:**
   ```bash
   cd examples
   npm install
   ```

## Available Examples

### 1. Basic Client (`basic-client.ts`)

Demonstrates the fundamentals of connecting to the MCP server.

```bash
npm run example:basic
```

**What it does:**
- Connects to the MCP server
- Lists all available tools
- Calls `get_agent_balance` tool
- Disconnects from the server

---

### 2. Agent Operations (`agent-operations.ts`)

Demonstrates agent-level operations.

```bash
# Without user token (balance only)
npm run example:agent

# With user token (includes game launch)
TEST_USER_TOKEN=eyJhbGciOi... npm run example:agent
```

**What it does:**
- Check agent balance
- Launch a game for a player (requires user token)

---

### 3. Player Operations (`player-operations.ts`)

Demonstrates player balance management.

```bash
TEST_USER_TOKEN=eyJhbGciOi... npm run example:player
```

**What it does:**
- Check initial player balance
- Deposit funds to player
- Withdraw funds from player
- Verify final balance

---

### 4. Transaction Queries (`transaction-queries.ts`)

Demonstrates how to query transaction history.

```bash
# Basic usage
npm run example:transactions

# Filter by user
FILTER_USER_ID=1597876055493 npm run example:transactions

# Look up specific transaction
TRANSACTION_ID=e83adae1-dad8-4e29-ad09-d6ca99609c22 npm run example:transactions
```

**What it does:**
- Get transfer history (deposits/withdrawals)
- Get game transactions
- Look up specific transaction by ID

---

## Using the MCP Client in Your Code

### Basic Usage

```typescript
import { WclassGamesMcpClient } from './mcp-client.js';

const client = new WclassGamesMcpClient();

try {
  // Connect to server
  await client.connect();

  // Use convenience methods
  const balance = await client.getAgentBalance();
  console.log('Balance:', balance);

  // Or call tools directly
  const result = await client.callTool('get_agent_balance', {});
  console.log('Result:', result);

} finally {
  await client.disconnect();
}
```

### Custom Server Path

```typescript
const client = new WclassGamesMcpClient({
  serverPath: '/custom/path/to/dist/index.js',
  envPath: '/custom/path/to/.env',
});
```

### Available Methods

| Method | Description |
|--------|-------------|
| `connect()` | Connect to the MCP server |
| `disconnect()` | Disconnect from the server |
| `listTools()` | List all available tools |
| `callTool(name, args)` | Call any tool directly |
| `getAgentBalance()` | Get agent balance |
| `launchGame(userToken)` | Launch game for player |
| `getPlayerBalance(userToken)` | Get player balance |
| `deposit(userToken, amount)` | Deposit to player |
| `withdraw(userToken, amount)` | Withdraw from player |
| `getTransferHistory(params)` | Get transfer history |
| `getTransaction(id)` | Get specific transaction |
| `getTransactions(params)` | Get transaction list |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TEST_USER_TOKEN` | JWT token for player operations | For player/game examples |
| `FILTER_USER_ID` | Filter transactions by user ID | Optional |
| `TRANSACTION_ID` | Specific transaction to look up | Optional |

## Output Example

```
============================================================
WCLASSGAMES MCP - Basic Client Example
============================================================

🔌 Connecting to WCLASSGAMES MCP Server...
   Server: /path/to/dist/index.js
   Env: /path/to/.env
✅ Connected to MCP Server

📋 Available Tools:
   1. get_agent_balance
   2. launch_game
   3. get_player_balance
   4. deposit
   5. withdraw
   6. get_transfer_history
   7. get_transaction
   8. get_transactions

💰 Getting Agent Balance...
📤 Calling tool: get_agent_balance
📥 Response: {
  "success": true,
  "balance": 99092.80
}

✅ Agent Balance: 99092.80

🔌 Disconnected from MCP Server
```
