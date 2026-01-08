/**
 * Basic MCP Client Example
 *
 * This example demonstrates how to:
 * 1. Connect to the WCLASSGAMES MCP server
 * 2. List available tools
 * 3. Call a simple tool (get_agent_balance)
 * 4. Disconnect from the server
 *
 * Usage:
 *   npm run example:basic
 */

import { WclassGamesMcpClient } from './mcp-client.js';

async function main() {
  console.log('='.repeat(60));
  console.log('WCLASSGAMES MCP - Basic Client Example');
  console.log('='.repeat(60));
  console.log();

  const client = new WclassGamesMcpClient();

  try {
    // Step 1: Connect to the MCP server
    await client.connect();

    // Step 2: List all available tools
    console.log('📋 Available Tools:');
    const tools = await client.listTools();
    tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool}`);
    });
    console.log();

    // Step 3: Call get_agent_balance tool
    console.log('💰 Getting Agent Balance...');
    const balanceResult = await client.getAgentBalance();

    if (balanceResult.success) {
      console.log(`✅ Agent Balance: ${balanceResult.balance}`);
    } else {
      console.log(`❌ Error: ${balanceResult.error}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Step 4: Disconnect
    await client.disconnect();
  }
}

main().catch(console.error);
