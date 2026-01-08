/**
 * Player Operations Example
 *
 * This example demonstrates player-level operations:
 * 1. Check player balance
 * 2. Deposit funds to player
 * 3. Withdraw funds from player
 * 4. Check balance again to verify
 *
 * Usage:
 *   TEST_USER_TOKEN=your-jwt-token npm run example:player
 */

import { WclassGamesMcpClient } from './mcp-client.js';

// Replace with your actual user JWT token
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || '';

async function main() {
  console.log('='.repeat(60));
  console.log('WCLASSGAMES MCP - Player Operations Example');
  console.log('='.repeat(60));
  console.log();

  if (!TEST_USER_TOKEN) {
    console.log('❌ Error: TEST_USER_TOKEN environment variable is required');
    console.log();
    console.log('   Usage:');
    console.log('   TEST_USER_TOKEN=eyJhbGciOi... npm run example:player');
    console.log();
    return;
  }

  const client = new WclassGamesMcpClient();

  try {
    await client.connect();

    // =========================================================================
    // Step 1: Check Initial Balance
    // =========================================================================
    console.log('─'.repeat(40));
    console.log('Step 1: Check Initial Player Balance');
    console.log('─'.repeat(40));

    const initialBalance = await client.getPlayerBalance(TEST_USER_TOKEN);

    if (initialBalance.success) {
      console.log(`✅ Player Balance: ${initialBalance.balance}`);
      console.log(`   Agent Balance: ${initialBalance.agentBalance}`);
    } else {
      console.log(`❌ Error: ${initialBalance.error}`);
      return;
    }
    console.log();

    // =========================================================================
    // Step 2: Deposit Funds
    // =========================================================================
    console.log('─'.repeat(40));
    console.log('Step 2: Deposit 100 to Player');
    console.log('─'.repeat(40));

    const depositAmount = 100;
    const depositResult = await client.deposit(TEST_USER_TOKEN, depositAmount);

    if (depositResult.success) {
      console.log(`✅ Deposit Successful!`);
      console.log(`   Amount: ${depositResult.amount}`);
      console.log(`   Balance Before: ${depositResult.balanceBefore}`);
      console.log(`   Balance After: ${depositResult.balanceAfter}`);
    } else {
      console.log(`❌ Deposit Failed: ${depositResult.error}`);
    }
    console.log();

    // =========================================================================
    // Step 3: Withdraw Funds
    // =========================================================================
    console.log('─'.repeat(40));
    console.log('Step 3: Withdraw 50 from Player');
    console.log('─'.repeat(40));

    const withdrawAmount = 50;
    const withdrawResult = await client.withdraw(TEST_USER_TOKEN, withdrawAmount);

    if (withdrawResult.success) {
      console.log(`✅ Withdrawal Successful!`);
      console.log(`   Amount: ${withdrawResult.amount}`);
      console.log(`   Balance Before: ${withdrawResult.balanceBefore}`);
      console.log(`   Balance After: ${withdrawResult.balanceAfter}`);
    } else {
      console.log(`❌ Withdrawal Failed: ${withdrawResult.error}`);
    }
    console.log();

    // =========================================================================
    // Step 4: Verify Final Balance
    // =========================================================================
    console.log('─'.repeat(40));
    console.log('Step 4: Verify Final Balance');
    console.log('─'.repeat(40));

    const finalBalance = await client.getPlayerBalance(TEST_USER_TOKEN);

    if (finalBalance.success) {
      console.log(`✅ Final Player Balance: ${finalBalance.balance}`);

      const initialNum = parseFloat(initialBalance.balance || '0');
      const finalNum = parseFloat(finalBalance.balance || '0');
      const netChange = finalNum - initialNum;

      console.log();
      console.log('📊 Summary:');
      console.log(`   Initial Balance: ${initialNum}`);
      console.log(`   Deposited: +${depositAmount}`);
      console.log(`   Withdrawn: -${withdrawAmount}`);
      console.log(`   Net Change: ${netChange >= 0 ? '+' : ''}${netChange}`);
      console.log(`   Final Balance: ${finalNum}`);
    } else {
      console.log(`❌ Error: ${finalBalance.error}`);
    }
    console.log();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.disconnect();
  }
}

main().catch(console.error);
