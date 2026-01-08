/**
 * Transaction Queries Example
 *
 * This example demonstrates how to query transaction data:
 * 1. Get transfer history (deposits/withdrawals)
 * 2. Get game transactions
 * 3. Get a specific transaction by ID
 *
 * Usage:
 *   npm run example:transactions
 */

import { WclassGamesMcpClient } from './mcp-client.js';

// Optional: Filter by specific user
const FILTER_USER_ID = process.env.FILTER_USER_ID || '';

// Optional: Specific transaction ID to look up
const TRANSACTION_ID = process.env.TRANSACTION_ID || '';

async function main() {
  console.log('='.repeat(60));
  console.log('WCLASSGAMES MCP - Transaction Queries Example');
  console.log('='.repeat(60));
  console.log();

  const client = new WclassGamesMcpClient();

  try {
    await client.connect();

    // =========================================================================
    // Example 1: Get Transfer History
    // =========================================================================
    console.log('─'.repeat(40));
    console.log('Example 1: Get Transfer History (Last 10)');
    console.log('─'.repeat(40));

    const transferParams: {
      page?: number;
      size?: number;
      userId?: string;
    } = {
      page: 1,
      size: 10,
    };

    if (FILTER_USER_ID) {
      transferParams.userId = FILTER_USER_ID;
      console.log(`   Filtering by User ID: ${FILTER_USER_ID}`);
    }

    const transferHistory = await client.getTransferHistory(transferParams);

    if (transferHistory.success) {
      const items = transferHistory.items || [];
      console.log(`✅ Found ${items.length} transfer(s)`);
      console.log();

      if (items.length > 0) {
        console.log('   Recent Transfers:');
        console.log('   ─'.repeat(30));

        items.forEach((item, index) => {
          const sign = item.type === 'Deposit' ? '+' : '-';
          console.log(`   ${index + 1}. [${item.type}] ${sign}${item.changed}`);
          console.log(`      User: ${item.userName} (${item.userId})`);
          console.log(`      Date: ${item.createdAt}`);
          console.log(`      ID: ${item.transactionId}`);
          console.log();
        });

        if (transferHistory.pagination) {
          console.log(`   Page ${transferHistory.pagination.page} of ${transferHistory.pagination.totalPage}`);
          console.log(`   Total: ${transferHistory.pagination.totalElement} records`);
        }
      } else {
        console.log('   No transfers found.');
      }
    } else {
      console.log(`❌ Error: ${transferHistory.error}`);
    }
    console.log();

    // =========================================================================
    // Example 2: Get Game Transactions
    // =========================================================================
    console.log('─'.repeat(40));
    console.log('Example 2: Get Game Transactions (Last 10)');
    console.log('─'.repeat(40));

    const txParams: {
      page?: number;
      size?: number;
      userId?: string;
    } = {
      page: 1,
      size: 10,
    };

    if (FILTER_USER_ID) {
      txParams.userId = FILTER_USER_ID;
    }

    const transactions = await client.getTransactions(txParams);

    if (transactions.success) {
      const items = transactions.items || [];
      console.log(`✅ Found ${items.length} transaction(s)`);
      console.log();

      if (items.length > 0) {
        console.log('   Recent Game Transactions:');
        console.log('   ─'.repeat(30));

        items.forEach((item, index) => {
          console.log(`   ${index + 1}. [${item.type}] ${item.changed}`);
          console.log(`      User: ${item.userName} (${item.userId})`);
          console.log(`      Game: ${item.gameType}`);
          console.log(`      Date: ${item.createdAt}`);
          console.log();
        });

        if (transactions.pagination) {
          console.log(`   Page ${transactions.pagination.page} of ${transactions.pagination.totalPage}`);
          console.log(`   Total: ${transactions.pagination.totalElement} records`);
        }
      } else {
        console.log('   No game transactions found.');
      }
    } else {
      console.log(`❌ Error: ${transactions.error}`);
    }
    console.log();

    // =========================================================================
    // Example 3: Get Specific Transaction
    // =========================================================================
    console.log('─'.repeat(40));
    console.log('Example 3: Get Specific Transaction by ID');
    console.log('─'.repeat(40));

    if (!TRANSACTION_ID) {
      console.log('⚠️  Skipping - no TRANSACTION_ID provided');
      console.log('   Set TRANSACTION_ID environment variable to test this feature');
      console.log();
      console.log('   Example:');
      console.log('   TRANSACTION_ID=e83adae1-dad8-4e29-ad09-d6ca99609c22 npm run example:transactions');
    } else {
      console.log(`   Looking up: ${TRANSACTION_ID}`);
      console.log();

      const txDetail = await client.getTransaction(TRANSACTION_ID);

      if (txDetail.success && txDetail.transaction) {
        const tx = txDetail.transaction;
        console.log('✅ Transaction Found!');
        console.log();
        console.log(`   ID: ${tx.id}`);
        console.log(`   User: ${tx.userName} (${tx.userId})`);
        console.log(`   Type: ${tx.type}`);
        console.log(`   Changed: ${tx.changed}`);
        console.log(`   Balance After: ${tx.available}`);
        console.log(`   Game Type: ${tx.gameType}`);
        console.log();

        if (tx.gameDetails) {
          console.log('   Game Details:');
          console.log(`   ─ Trade Amount: ${tx.gameDetails.tradeAmount}`);
          console.log(`   ─ Coin: ${tx.gameDetails.gameCoin}`);
          console.log(`   ─ Status: ${tx.gameDetails.status}`);
          console.log(`   ─ PnL: ${tx.gameDetails.pnl}`);
          console.log(`   ─ Result: ${tx.gameDetails.result}`);
        }
      } else {
        console.log(`❌ Error: ${txDetail.error}`);
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
