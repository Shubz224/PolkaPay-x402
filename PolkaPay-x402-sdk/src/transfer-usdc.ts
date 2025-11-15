/**
 * Real USDC Transfer Script
 * Use your actual Polkadot.js account
 */

import {
  initializeCrypto,
  parseAmount,
  formatBalance,
} from './blockchain/keypair';
import {
  initializeWithRetry,
  verifyConnection,
  disconnect,
} from './blockchain/connection';
import {
  getUSDCBalance,
} from './services/balance';
import {
  buildUSDCTransfer,
  estimateTransactionFees,
  submitTransaction,
} from './services/transactions';

async function main() {
  try {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`  Real USDC Transfer - Polkadot Westend`);
    console.log(`${'='.repeat(70)}\n`);

    // ==================== SETUP ====================
    console.log(`[1/6] Initializing...`);
    await initializeCrypto();
    await initializeWithRetry(3, 1000);
    await verifyConnection();
    console.log();

    // ==================== YOUR DETAILS ====================
    console.log(`[2/6] Your Account Details`);
    
    // ✅ PASTE YOUR ADDRESS HERE
    const yourAddress = '5DNpvfh2VCCn7XVrQbFxgyxUvBxtJ6p2HEJjmrAb6tQLg2EK'; // ← CHANGE THIS TO YOUR ADDRESS
    console.log(`   Your address: ${yourAddress}`);
    
    // ✅ GET YOUR SEED PHRASE
    // From Polkadot.js:
    // 1. Click account name
    // 2. Export account
    // 3. Enter password
    // 4. Copy seed phrase
    const yourSeedPhrase = 'wmechanic tide zebra mango film box similar taste plug daring legal spray'; // ← CHANGE THIS TO YOUR SEED
    console.log(`   ✓ Seed phrase loaded (hidden)`);
    console.log();

    // ==================== CHECK BALANCE ====================
    console.log(`[3/6] Checking your USDC balance...`);
    try {
      const balance = await getUSDCBalance(yourAddress);
      console.log(`   ✓ Balance: ${formatBalance(balance)} USDC`);
      
      if (balance === 0n) {
        console.log(`   ⚠️  WARNING: You have 0 USDC!`);
        console.log(`   Send some USDC to your address first.`);
        process.exit(1);
      }
    } catch (error) {
      console.log(`   ⚠️  Could not check balance:`, error);
    }
    console.log();

    // ==================== RECIPIENT ====================
    console.log(`[4/6] Recipient Details`);
    
    // ✅ CHANGE THIS TO RECIPIENT ADDRESS
    const recipientAddress = '5EcMaUDo1GszHAGJCSMwujuAFqLYWHAYYriAj7ENiyN2Ukgq'; // ← CHANGE THIS TO RECIPIENT
    const amountToSend = '2.5'; // ✅ CHANGE THIS TO AMOUNT
    
    console.log(`   Recipient: ${recipientAddress}`);
    console.log(`   Amount: ${amountToSend} USDC`);
    console.log();

    // ==================== BUILD TRANSACTION ====================
    console.log(`[5/6] Building transaction...`);
    const tx = await buildUSDCTransfer(recipientAddress, amountToSend);
    console.log();

    // ==================== ESTIMATE FEES ====================
    console.log(`[6/6] Estimating fees...`);
    try {
      const fees = await estimateTransactionFees(tx, yourAddress);
      console.log(`   Fee: ${formatBalance(fees)} DOT`);
    } catch (error) {
      console.log(`   ℹ️  Could not estimate fees (continue anyway)`);
    }
    console.log();

    // ==================== CONFIRM ====================
    console.log(`${'='.repeat(70)}`);
    console.log(`  TRANSACTION SUMMARY`);
    console.log(`${'='.repeat(70)}`);
    console.log(`  From:   ${yourAddress}`);
    console.log(`  To:     ${recipientAddress}`);
    console.log(`  Amount: ${amountToSend} USDC`);
    console.log(`${'='.repeat(70)}\n`);

    console.log(`⚠️  READY TO SUBMIT?`);
    console.log(`   This will transfer ${amountToSend} USDC`);
    console.log(`   From: ${yourAddress.substring(0, 20)}...`);
    console.log(`   To:   ${recipientAddress.substring(0, 20)}...\n`);

    // ==================== SUBMIT ====================
    console.log(`[SUBMIT] Submitting transaction...`);
    console.log(`   Signing with your keypair...`);
    console.log(`   Broadcasting to Westend AssetHub...\n`);
    
    try {
      const result = await submitTransaction(tx, yourSeedPhrase);
      
      console.log(`✅ TRANSACTION SUCCESSFUL!`);
      console.log(`   Tx Hash: ${result.txHash}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Block: #${result.block?.number}`);
      console.log(`   Block Hash: ${result.block?.hash}\n`);

      console.log(`📋 View on Explorer:`);
      console.log(`   https://westend-asset-hub.subscan.io/extrinsic/${result.txHash}\n`);

    } catch (error) {
      console.error(`❌ TRANSACTION FAILED`);
      console.error(`   Error:`, error);
      console.log(`\n   Possible reasons:`);
      console.log(`   - Insufficient USDC balance`);
      console.log(`   - Insufficient DOT for fees`);
      console.log(`   - Invalid recipient address`);
      console.log(`   - Network error`);
    }

    console.log(`${'='.repeat(70)}\n`);

  } catch (error) {
    console.error(`\n✗ Failed:`, error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

main();
