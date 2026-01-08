/**
 * Agent Operations Example
 *
 * This example demonstrates agent-level operations:
 * 1. Check agent balance
 * 2. Launch a game for a player
 *
 * Usage:
 *   npm run example:agent
 *
 * Note: You need a valid user JWT token to launch games
 */

import { WclassGamesMcpClient } from './mcp-client.js';

// Replace with your actual user JWT token
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || 'your-test-jwt-token-here';

async function main() {
  console.log('='.repeat(60));
  console.log('WCLASSGAMES MCP - Agent Operations Example');
  console.log('='.repeat(60));
  console.log();

  const client = new WclassGamesMcpClient();

  try {
    await client.connect();

    // =========================================================================
    // Example 1: Check Agent Balance
    // =========================================================================
    console.log('─'.repeat(40));
    console.log('Example 1: Check Agent Balance');
    console.log('─'.repeat(40));

    const balanceResult = await client.getAgentBalance();

    if (balanceResult.success) {
      console.log(`✅ Current Agent Balance: ${balanceResult.balance}`);
      console.log();
      console.log('   This is the total balance available for your agent account.');
      console.log('   You can use this balance to fund player deposits.');
    } else {
      console.log(`❌ Failed to get balance: ${balanceResult.error}`);
    }
    console.log();

    // =========================================================================
    // Example 2: Launch a Game
    // =========================================================================
    console.log('─'.repeat(40));
    console.log('Example 2: Launch Game for Player');
    console.log('─'.repeat(40));

    if (TEST_USER_TOKEN === 'your-test-jwt-token-here') {
      console.log('⚠️  Skipping game launch - no user token provided');
      console.log('   Set TEST_USER_TOKEN environment variable to test this feature');
      console.log();
      console.log('   Example:');
      console.log('   TEST_USER_TOKEN=eyJhbGciOi... npm run example:agent');
    } else {
      const launchResult = await client.launchGame(TEST_USER_TOKEN);

      if (launchResult.success) {
        console.log('✅ Game Launch Successful!');
        console.log();
        console.log(`   Launch URL: ${launchResult.launchUrl}`);
        console.log(`   Join Token: ${launchResult.joinToken?.substring(0, 20)}...`);
        console.log(`   User ID: ${launchResult.userId}`);
        console.log(`   Expires At: ${launchResult.expiresAt}`);
        console.log();
        console.log('   The player can use this URL to access the game.');
        console.log('   The URL will expire at the specified time.');
      } else {
        console.log(`❌ Failed to launch game: ${launchResult.error}`);
      }
    }
    console.log();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.disconnect();
  }
}

main().catch(console.error);
