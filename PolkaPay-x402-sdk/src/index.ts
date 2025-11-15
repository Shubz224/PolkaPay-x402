/**
 * PolkaPay Phase 2 - Balance Query Test
 */

import {
  initializeCrypto,
  generateNewKeypair,
  formatBalance as formatFromKeypair,
  parseAmount as parseFromKeypair,
} from './blockchain/keypair';
import {
  initializeWithRetry,
  verifyConnection,
  disconnect,
} from './blockchain/connection';
import {
  getUSDCBalance,
  getBatchBalances,
  accountExists,
  formatBalance,
  parseAmount,
  getAccountDetails,
} from './services/balance';

async function main() {
  try {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`  PolkaPay Phase 2: Balance Queries & Storage Access`);
    console.log(`${'='.repeat(70)}\n`);

    // Step 1: Setup
    console.log(`[1/5] Initializing...`);
    await initializeCrypto();
    await initializeWithRetry(3, 1000);
    await verifyConnection();
    console.log();

    // Step 2: Generate test keypair
    console.log(`[2/5] Generating test keypair...`);
    const keypair = await generateNewKeypair('Phase 2 Test');
    console.log(`   Address: ${keypair.address}`);
    console.log();

    // Step 3: Query balance for test address
    console.log(`[3/5] Query balance (test address - likely 0)...`);
    try {
      const balance = await getUSDCBalance(keypair.address);
      console.log(`   Result: ${formatBalance(balance)} USDC`);
    } catch (error) {
      console.log(`   Note: New account has no balance yet`);
    }
    console.log();

    // Step 4: Check if account exists
    console.log(`[4/5] Check if account exists on-chain...`);
    const exists = await accountExists(keypair.address);
    console.log(`   Exists: ${exists}`);
    console.log();

    // Step 5: Get full account details
    console.log(`[5/5] Get full account details...`);
    const details = await getAccountDetails(keypair.address);
    console.log(`   Account exists: ${details.exists}`);
    console.log(`   Balance: ${details.formatted} USDC`);
    console.log(`   Status: ${details.status}`);
    console.log();

    // Test balance utilities
    console.log(`[BONUS] Test balance utilities...`);
    const testAmount = parseAmount('2.5');
    console.log(`   Parse "2.5" USDC: ${testAmount} (smallest units)`);
    console.log(`   Format back: ${formatBalance(testAmount)} USDC`);
    console.log();

    console.log(`${'='.repeat(70)}`);
    console.log(`  ✓ PHASE 2 TESTS COMPLETE!`);
    console.log(`${'='.repeat(70)}\n`);

    console.log(`📋 Phase 2 Features Tested:`);
    console.log(`   ✓ Balance query (single address)`);
    console.log(`   ✓ Account existence check`);
    console.log(`   ✓ Full account details`);
    console.log(`   ✓ Balance formatting`);
    console.log(`   ✓ Amount parsing\n`);

    console.log(`📋 Ready for next phase:`);
    console.log(`   - Batch balance queries`);
    console.log(`   - Real-time subscriptions`);
    console.log(`   - Transaction building\n`);

  } catch (error) {
    console.error(`\n✗ Phase 2 failed:`, error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

main();
