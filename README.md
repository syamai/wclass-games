# WCLASSGAMES MCP Server

An MCP (Model Context Protocol) server for integrating with the WCLASSGAMES API. This server enables AI assistants like Claude to interact with WCLASSGAMES gaming platform.

## Features

- **Integration API**: Launch games and check agent balance
- **Balance Transfer API**: Manage player deposits and withdrawals
- **Data Feed API**: Query transaction history

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

## Installation

```bash
# Clone the repository
git clone https://github.com/syamai/wclass-games.git
cd wclass-games

# Install dependencies
npm install

# Build
npm run build
```

## Configuration

Create a `.env` file in the project root:

```env
AGENT_ID=your_agent_id
AGENT_SECRET=your_agent_secret
API_HOST=https://ca-api.cateleca.com/api/crypto
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "wclassgames": {
      "command": "node",
      "args": ["/path/to/wclass-games/dist/index.js"]
    }
  }
}
```

## Development

```bash
# Run in development mode
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

## Project Structure

```
wclass-games/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── config/               # Configuration loader
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Authentication utilities
│   ├── client/               # HTTP client
│   ├── services/             # Business logic services
│   └── tools/                # MCP tool definitions
├── dist/                     # Compiled output
├── package.json
├── tsconfig.json
└── .env.example
```

## API Documentation

This MCP server is based on the WCLASSGAMES API specification. Key endpoints:

- **Integration**: `/cashier/agent-balance`, `/auth/join`
- **Balance Transfer**: `/cashier/balance`, `/cashier/deposit`, `/cashier/withdraw`
- **Data Feed**: `/trade/transaction`, `/trade/transactions`

## License

MIT
