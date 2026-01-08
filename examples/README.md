# WCLASSGAMES MCP Examples

This directory contains example code demonstrating how to use the WCLASSGAMES MCP server.

**The MCP server is automatically installed from GitHub** - no need to clone or build the server separately!

## Quick Start

### 1. Create a new project directory

```bash
mkdir my-wclassgames-app
cd my-wclassgames-app
```

### 2. Copy the example files

Copy these files from the examples directory:
- `package.json`
- `tsconfig.json`
- `mcp-client.ts`
- Any example files you want to run (e.g., `basic-client.ts`)

Or clone just the examples:
```bash
git clone --depth 1 https://github.com/syamai/wclass-games.git temp
cp -r temp/examples/* .
rm -rf temp
```

### 3. Install dependencies

```bash
npm install
```

This will:
1. Install the MCP server from GitHub (`github:syamai/wclass-games`)
2. Automatically build the server (via `postinstall` script)
3. Install other dependencies

### 4. Create your `.env` file

Create a `.env` file in the examples directory:

```env
AGENT_ID=your-agent-id
AGENT_SECRET=your-agent-secret
API_HOST=https://ca-api.cateleca.com/api/crypto
```

### 5. Run examples

```bash
npm run example:basic
```

---

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

## Using in Your Own Project

### Step 1: Add dependency

In your `package.json`:

```json
{
  "dependencies": {
    "wclassgames-mcp": "github:syamai/wclass-games",
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "scripts": {
    "postinstall": "cd node_modules/wclassgames-mcp && npm install && npm run build"
  }
}
```

### Step 2: Copy the MCP client wrapper

Copy `mcp-client.ts` to your project, or write your own using the MCP SDK directly.

### Step 3: Use the client

```typescript
import { WclassGamesMcpClient } from './mcp-client.js';

async function main() {
  const client = new WclassGamesMcpClient();

  try {
    // Connect to server
    await client.connect();

    // Use convenience methods
    const balance = await client.getAgentBalance();
    console.log('Agent Balance:', balance);

    // Deposit to a player
    const deposit = await client.deposit('user-jwt-token', 1000);
    console.log('Deposit result:', deposit);

    // Get transaction history
    const history = await client.getTransferHistory({
      page: 1,
      size: 10,
      userId: '1234567890'
    });
    console.log('History:', history);

  } finally {
    await client.disconnect();
  }
}

main();
```

### Step 4: Create `.env` file

```env
AGENT_ID=your-agent-id
AGENT_SECRET=your-agent-secret
API_HOST=https://ca-api.cateleca.com/api/crypto
```

---

## Direct MCP SDK Usage

If you prefer to use the MCP SDK directly without the wrapper:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['node_modules/wclassgames-mcp/dist/index.js'],
  env: {
    ...process.env,
    ENV_PATH: './.env',  // Path to your .env file
  },
});

const client = new Client(
  { name: 'my-app', version: '1.0.0' },
  { capabilities: {} }
);

await client.connect(transport);

// List available tools
const tools = await client.listTools();
console.log('Tools:', tools.tools.map(t => t.name));

// Call a tool
const result = await client.callTool({
  name: 'get_agent_balance',
  arguments: {}
});

// Parse result
const content = result.content as Array<{ type: string; text: string }>;
const data = JSON.parse(content[0].text);
console.log('Balance:', data.balance);

await client.close();
```

---

## Available Methods (MCP Client Wrapper)

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

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AGENT_ID` | Your WCLASSGAMES agent ID | Yes (in .env) |
| `AGENT_SECRET` | Your WCLASSGAMES secret key | Yes (in .env) |
| `API_HOST` | API endpoint URL | No (has default) |
| `TEST_USER_TOKEN` | JWT token for player operations | For player examples |
| `FILTER_USER_ID` | Filter transactions by user ID | Optional |
| `TRANSACTION_ID` | Specific transaction to look up | Optional |

---

## Troubleshooting

### Error: "MCP server not found"

Make sure you ran `npm install`. The postinstall script should automatically build the server.

If it still fails, try:
```bash
cd node_modules/wclassgames-mcp
npm install
npm run build
```

### Error: "Missing required environment variable"

Create a `.env` file in the examples directory with your credentials.

### Error: "Cannot find module"

Make sure you're using Node.js 18+ and have `"type": "module"` in your package.json.

---

## File Structure

After `npm install`, your project should look like:

```
my-wclassgames-app/
├── .env                      # Your credentials (create this)
├── package.json
├── tsconfig.json
├── mcp-client.ts             # MCP client wrapper
├── basic-client.ts           # Example file
└── node_modules/
    └── wclassgames-mcp/      # Installed from GitHub
        ├── dist/             # Built server
        │   └── index.js
        └── src/              # Source code
```
