/**
 * WCLASSGAMES MCP Client Usage Example
 *
 * MCP SDK를 사용하여 WCLASSGAMES MCP 서버에 연결하고
 * 각종 도구를 호출하는 예제입니다.
 *
 * 실행 방법:
 *   1. 먼저 MCP 서버를 빌드하세요 (루트에서 npm run build)
 *   2. .env 파일에 AGENT_ID, AGENT_SECRET 설정
 *   3. npm run client
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// MCP 서버 경로 (빌드된 서버)
const SERVER_PATH = resolve(__dirname, '..', 'dist', 'index.js');
const ENV_PATH = resolve(__dirname, '..', '.env');

// 테스트용 사용자 토큰 (Agent 서버에서 발급)
const TEST_USER_TOKEN = 'user-token-123';

async function main() {
  console.log('═'.repeat(60));
  console.log('WCLASSGAMES MCP Client Usage Example');
  console.log('═'.repeat(60));
  console.log();

  // ============================================================================
  // 1. MCP 서버 연결
  // ============================================================================
  console.log('📡 Connecting to MCP Server...');
  console.log(`   Server: ${SERVER_PATH}`);
  console.log(`   Env: ${ENV_PATH}`);
  console.log();

  const transport = new StdioClientTransport({
    command: 'node',
    args: [SERVER_PATH],
    env: {
      ...process.env,
      ENV_PATH: ENV_PATH,
    },
  });

  const client = new Client(
    { name: 'wclassgames-example', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log('✅ Connected!\n');

  try {
    // ============================================================================
    // 2. 사용 가능한 도구 목록 조회
    // ============================================================================
    console.log('─'.repeat(60));
    console.log('📋 Available Tools');
    console.log('─'.repeat(60));

    const tools = await client.listTools();
    tools.tools.forEach((tool, i) => {
      console.log(`   ${i + 1}. ${tool.name}`);
      console.log(`      ${tool.description}`);
    });
    console.log();

    // ============================================================================
    // 3. 에이전트 잔액 조회
    // ============================================================================
    console.log('─'.repeat(60));
    console.log('💰 Get Agent Balance');
    console.log('─'.repeat(60));

    const balanceResult = await callTool(client, 'get_agent_balance', {});
    console.log(`   Result: ${JSON.stringify(balanceResult, null, 2)}`);
    console.log();

    // ============================================================================
    // 4. 게임 런칭 URL 생성
    // ============================================================================
    console.log('─'.repeat(60));
    console.log('🎮 Launch Game');
    console.log('─'.repeat(60));
    console.log(`   User Token: ${TEST_USER_TOKEN}`);

    const launchResult = await callTool(client, 'launch_game', {
      userToken: TEST_USER_TOKEN,
    });
    console.log(`   Result: ${JSON.stringify(launchResult, null, 2)}`);
    console.log();

    // ============================================================================
    // 5. 플레이어 잔액 조회
    // ============================================================================
    console.log('─'.repeat(60));
    console.log('👤 Get Player Balance');
    console.log('─'.repeat(60));

    const playerBalance = await callTool(client, 'get_player_balance', {
      userToken: TEST_USER_TOKEN,
    });
    console.log(`   Result: ${JSON.stringify(playerBalance, null, 2)}`);
    console.log();

    // ============================================================================
    // 6. 플레이어에게 입금
    // ============================================================================
    console.log('─'.repeat(60));
    console.log('💵 Deposit to Player');
    console.log('─'.repeat(60));
    console.log(`   Amount: 1000`);

    const depositResult = await callTool(client, 'deposit', {
      userToken: TEST_USER_TOKEN,
      amount: 1000,
    });
    console.log(`   Result: ${JSON.stringify(depositResult, null, 2)}`);
    console.log();

    // ============================================================================
    // 7. 플레이어로부터 출금
    // ============================================================================
    console.log('─'.repeat(60));
    console.log('💸 Withdraw from Player');
    console.log('─'.repeat(60));
    console.log(`   Amount: 500`);

    const withdrawResult = await callTool(client, 'withdraw', {
      userToken: TEST_USER_TOKEN,
      amount: 500,
    });
    console.log(`   Result: ${JSON.stringify(withdrawResult, null, 2)}`);
    console.log();

    // ============================================================================
    // 8. 거래 내역 조회
    // ============================================================================
    console.log('─'.repeat(60));
    console.log('📜 Get Transactions');
    console.log('─'.repeat(60));

    const transactions = await callTool(client, 'get_transactions', {
      page: 1,
      size: 5,
    });
    console.log(`   Result: ${JSON.stringify(transactions, null, 2)}`);
    console.log();

  } finally {
    await client.close();
    console.log('🔌 Disconnected from MCP Server');
  }
}

/**
 * MCP 도구 호출 헬퍼 함수
 */
async function callTool(
  client: Client,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const result = await client.callTool({ name, arguments: args });
  const content = result.content as Array<{ type: string; text: string }>;

  if (content && content[0]?.type === 'text') {
    return JSON.parse(content[0].text);
  }

  return result;
}

main().catch(console.error);
