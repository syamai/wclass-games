# WCLASSGAMES MCP Server

An MCP (Model Context Protocol) server for integrating with the WCLASSGAMES API. This server enables AI assistants like Claude to interact with WCLASSGAMES gaming platform.

## Table of Contents

- [Features](#features)
- [Available Tools](#available-tools)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage with Claude Desktop](#usage-with-claude-desktop)
- [Tool Usage Examples](#tool-usage-examples)
- [Development](#development)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- **Integration API**: Launch games and check agent balance
- **Balance Transfer API**: Manage player deposits and withdrawals
- **Data Feed API**: Query transaction history
- **Secure Authentication**: SHA512 signature-based API authentication
- **TypeScript**: Full type safety with comprehensive type definitions

## Available Tools

| Tool | Description |
|------|-------------|
| `get_agent_balance` | Retrieve the current balance of the agent account |
| `launch_game` | Generate a game launch URL for a player |
| `get_player_balance` | Retrieve the current balance of a specific player |
| `deposit` | Transfer funds into a player's balance |
| `withdraw` | Transfer funds out of a player's balance |
| `get_transfer_history` | Retrieve transfer history with optional filters |
| `get_transaction` | Get detailed information about a specific transaction |
| `get_transactions` | Retrieve a list of game transactions |

## Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **WCLASSGAMES Account**: Agent ID and Secret Key from WCLASSGAMES

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/syamai/wclass-games.git
cd wclass-games
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build the Project

```bash
npm run build
```

### Step 4: Verify Installation

```bash
# Check if build was successful
ls dist/
# You should see: index.js, index.d.ts, and other compiled files
```

## Configuration

### Step 1: Create Environment File

Create a `.env` file in the project root directory:

```bash
cp .env.example .env
```

### Step 2: Edit the `.env` File

Open `.env` and fill in your credentials:

```env
# WCLASSGAMES MCP Server Configuration

# Agent ID (required)
# Get this from your WCLASSGAMES dashboard
AGENT_ID=your-agent-id-here

# Agent Secret Key (required)
# Keep this secure and never share it
AGENT_SECRET=your-agent-secret-key-here

# API Host (optional - defaults to production)
API_HOST=https://ca-api.cateleca.com/api/crypto
```

### Configuration Options

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AGENT_ID` | Yes | - | Your WCLASSGAMES agent identifier (UUID format) |
| `AGENT_SECRET` | Yes | - | Your secret key for API authentication |
| `API_HOST` | No | `https://ca-api.cateleca.com/api/crypto` | WCLASSGAMES API endpoint |

## Usage with Claude Desktop

### Step 1: Locate Claude Desktop Config File

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Add MCP Server Configuration

Edit the config file and add the `wclassgames` server:

```json
{
  "mcpServers": {
    "wclassgames": {
      "command": "node",
      "args": ["/full/path/to/wclass-games/dist/index.js"]
    }
  }
}
```

**Example for macOS:**
```json
{
  "mcpServers": {
    "wclassgames": {
      "command": "node",
      "args": ["/Users/username/wclass-games/dist/index.js"]
    }
  }
}
```

**Example for Windows:**
```json
{
  "mcpServers": {
    "wclassgames": {
      "command": "node",
      "args": ["C:\\Users\\username\\wclass-games\\dist\\index.js"]
    }
  }
}
```

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop to load the new MCP server.

### Step 4: Verify Connection

In Claude Desktop, you should now see the WCLASSGAMES tools available. Try asking:

> "Check my WCLASSGAMES agent balance"

## Tool Usage Examples

### 1. Get Agent Balance

Check the current balance of your agent account.

**Request:**
```
"What is my agent balance in WCLASSGAMES?"
```

**Response:**
```json
{
  "success": true,
  "balance": 99092.80
}
```

---

### 2. Launch Game

Generate a game launch URL for a player.

**Request:**
```
"Launch a game for the user with token eyJhbGciOiJIUzI1NiIs..."
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userToken` | string | Yes | JWT bearer token from your authentication system |

**Response:**
```json
{
  "success": true,
  "launchUrl": "https://wclassgames.com?id=xxx&join_token=xxx",
  "joinToken": "RuMCULSHwpmP3z4GYt50sTKTs9Bz...",
  "userId": 1,
  "expiresAt": "2025-01-08T12:00:00.000Z"
}
```

---

### 3. Get Player Balance

Check a specific player's current balance.

**Request:**
```
"Get balance for player with token eyJhbGciOiJIUzI1NiIs..."
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userToken` | string | Yes | Player's JWT bearer token |

**Response:**
```json
{
  "success": true,
  "balance": "99092.80273446",
  "agentBalance": "1000004236.20000000"
}
```

---

### 4. Deposit

Transfer funds into a player's balance.

**Request:**
```
"Deposit 1000 to the player with token eyJhbGciOiJIUzI1NiIs..."
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userToken` | string | Yes | Player's JWT bearer token |
| `amount` | number | Yes | Amount to deposit (must be positive) |

**Response:**
```json
{
  "success": true,
  "amount": 1000,
  "balanceBefore": 98092.80,
  "balanceAfter": 99092.80
}
```

---

### 5. Withdraw

Transfer funds out of a player's balance.

**Request:**
```
"Withdraw 500 from the player with token eyJhbGciOiJIUzI1NiIs..."
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userToken` | string | Yes | Player's JWT bearer token |
| `amount` | number | Yes | Amount to withdraw (must be positive) |

**Response:**
```json
{
  "success": true,
  "amount": 500,
  "balanceBefore": 99092.80,
  "balanceAfter": 98592.80
}
```

---

### 6. Get Transfer History

Retrieve deposit/withdrawal history with optional filters.

**Request:**
```
"Show me the transfer history for user 1760597855492 from 2025-01-01 to 2025-01-08"
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `size` | number | No | Records per page (default: 20, max: 100) |
| `startTime` | string | No | Start date filter (YYYY-MM-DD HH:mm:ss) |
| `endTime` | string | No | End date filter (YYYY-MM-DD HH:mm:ss) |
| `userId` | string | No | Filter by specific user ID |

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": 2,
      "userId": "1597876055493",
      "userName": "testuser",
      "type": "Withdraw",
      "changed": "-1000.00000000",
      "available": "170.55089549",
      "note": "Withdraw",
      "transactionId": "1c4ee995-d1a9-49bf-9c73-f693feb2fe7b",
      "createdAt": "2025-01-06T17:27:41.000Z"
    }
  ],
  "pagination": {
    "totalElement": 1,
    "currentElement": 1,
    "totalPage": 1,
    "page": 1,
    "size": 20,
    "hasNext": false
  }
}
```

---

### 7. Get Transaction

Get detailed information about a specific transaction.

**Request:**
```
"Get details for transaction e83adae1-dad8-4e29-ad09-d6ca99609c22"
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `transactionId` | string | Yes | Transaction UUID |

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": 9,
    "userId": "1597876055493",
    "userName": "testuser",
    "type": "OpenPosition",
    "changed": "-100.00000000",
    "available": "92691.61670010",
    "note": "[Futures/Seamless]Open 100 Points Long position BTC with multiplier x10",
    "refId": "e83adae1-dad8-4e29-ad09-d6ca99609c22",
    "asset": "Points",
    "createdAt": "2025-01-07T16:09:29.000Z",
    "gameType": "Futures",
    "gameDetails": {
      "id": "e83adae1-dad8-4e29-ad09-d6ca99609c22",
      "tradeAmount": "100.000000",
      "gameCoin": "BTC",
      "status": "Closed",
      "pnl": "-0.149883",
      "result": "Lose"
    }
  }
}
```

---

### 8. Get Transactions

Retrieve a list of game transactions.

**Request:**
```
"Show me the last 10 transactions for user 1597876055493"
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `size` | number | No | Records per page (default: 20, max: 100) |
| `startTime` | string | No | Start date filter (YYYY-MM-DD HH:mm:ss) |
| `endTime` | string | No | End date filter (YYYY-MM-DD HH:mm:ss) |
| `userId` | string | No | Filter by specific user ID |

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": 10,
      "userId": "1597876055493",
      "userName": "testuser",
      "type": "ClosePosition",
      "changed": "99.45011744",
      "available": "99.45011744",
      "note": "[Futures/Seamless] Close position e83adae1-dad8-4e29-ad09-d6ca99609c22",
      "refId": "e83adae1-dad8-4e29-ad09-d6ca99609c22",
      "asset": "Points",
      "createdAt": "2025-01-07T16:09:31.000Z",
      "gameType": "Futures",
      "gameDetails": {
        "id": "e83adae1-dad8-4e29-ad09-d6ca99609c22",
        "tradeAmount": "100.000000",
        "gameCoin": "BTC",
        "status": "Closed",
        "pnl": "-0.149883",
        "result": "Lose"
      }
    }
  ],
  "pagination": {
    "totalElement": 1,
    "currentElement": 1,
    "totalPage": 1,
    "page": 1,
    "size": 20,
    "hasNext": false
  }
}
```

## Development

### Run in Development Mode

```bash
# Set environment variables and run
AGENT_ID=your-id AGENT_SECRET=your-secret npm run dev
```

### Type Check

```bash
npm run typecheck
```

### Build for Production

```bash
npm run build
```

### Test the Server Manually

You can test the server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Project Structure

```
wclass-games/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── config/
│   │   └── index.ts          # Configuration loader (dotenv)
│   ├── types/
│   │   └── api.ts            # TypeScript type definitions
│   ├── utils/
│   │   └── auth.ts           # SHA512 signature generation
│   ├── client/
│   │   └── http-client.ts    # HTTP client with authentication
│   ├── services/
│   │   ├── integration.service.ts  # Game launching & agent balance
│   │   ├── balance.service.ts      # Player balance management
│   │   └── datafeed.service.ts     # Transaction queries
│   └── tools/
│       └── index.ts          # MCP tool definitions
├── dist/                     # Compiled JavaScript output
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### Error: "Missing required environment variable: AGENT_ID"

**Cause:** The `.env` file is missing or not properly configured.

**Solution:**
1. Make sure `.env` file exists in the project root
2. Check that `AGENT_ID` and `AGENT_SECRET` are set correctly
3. Restart Claude Desktop after making changes

### Error: "API Error (401): Unauthorized"

**Cause:** Invalid agent credentials or signature.

**Solution:**
1. Verify your `AGENT_ID` is correct
2. Verify your `AGENT_SECRET` is correct
3. Check if your agent account is active in WCLASSGAMES

### Error: "API Error (400): InsufficientBalance"

**Cause:** The player doesn't have enough balance for the withdrawal.

**Solution:**
1. Check the player's current balance first
2. Request a withdrawal amount less than or equal to available balance

### Claude Desktop doesn't show WCLASSGAMES tools

**Cause:** Configuration issue or server not starting.

**Solution:**
1. Check the path in `claude_desktop_config.json` is correct
2. Make sure you ran `npm run build` successfully
3. Check the Claude Desktop logs for errors
4. Restart Claude Desktop

### How to view server logs

The server outputs logs to stderr. In Claude Desktop, you can check the logs in:

**macOS:**
```bash
~/Library/Logs/Claude/mcp*.log
```

## API Reference

This MCP server is based on the WCLASSGAMES API. Key endpoints:

| Category | Endpoint | Description |
|----------|----------|-------------|
| Integration | `GET /cashier/agent-balance` | Get agent balance |
| Integration | `POST /auth/join` | Launch game |
| Balance | `GET /cashier/balance` | Get player balance |
| Balance | `POST /cashier/deposit` | Deposit funds |
| Balance | `POST /cashier/withdraw` | Withdraw funds |
| Balance | `GET /cashier/history` | Transfer history |
| Data Feed | `GET /trade/transaction` | Get single transaction |
| Data Feed | `GET /trade/transactions` | Get transaction list |

## Security Notes

- **Never commit `.env` file** to version control
- **Keep `AGENT_SECRET` secure** - treat it like a password
- **Use environment variables** in production deployments
- **Rotate secrets regularly** as per your security policy

## License

MIT

## Support

For issues related to:
- **This MCP Server**: Open an issue on [GitHub](https://github.com/syamai/wclass-games/issues)
- **WCLASSGAMES API**: Contact WCLASSGAMES support
- **Claude Desktop**: Visit [Anthropic Support](https://support.anthropic.com)
