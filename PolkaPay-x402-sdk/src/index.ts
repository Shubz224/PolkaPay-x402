/**
 * PolkaPay Phase 1 - Initialization Test
 * Using ONLY polkadot-api (no @polkadot/* packages)
 */

import {
  initializeCrypto,
  generateNewKeypair,
  formatBalance,
  parseAmount,
} from './blockchain/keypair';
import {
  initializeWithRetry,
  verifyConnection,
  disconnect,
} from './blockchain/connection';

async function main() {
  try {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`  PolkaPay Phase 1: Polkadot-API Initialization`);
    console.log(`  ✓ Using ONLY polkadot-api (no legacy @polkadot/* packages)`);
    console.log(`${'='.repeat(70)}\n`);

    // Step 1: Initialize Crypto
    console.log(`[1/4] Initializing crypto subsystem...`);
    await initializeCrypto();
    console.log();

    // Step 2: Connect to AssetHub
    console.log(`[2/4] Connecting to AssetHub via PAPI...`);
    await initializeWithRetry(3, 1000);
    console.log();

    // Step 3: Verify Connection
    console.log(`[3/4] Verifying connection...`);
    const block = await verifyConnection();
    console.log();

    // Step 4: Generate Test Keypair
    console.log(`[4/4] Generating sr25519 keypair...`);
    const keypair = await generateNewKeypair('PolkaPay Test');
    console.log(`   Name: ${keypair.name}`);
    console.log(`   Address: ${keypair.address}`);
    console.log(`   Public Key: ${keypair.publicKeyHex}`);
    if (keypair.seedPhrase) {
      console.log(`   Mnemonic: ${keypair.seedPhrase.substring(0, 30)}...`);
    }
    console.log();

    // Demonstrate balance formatting
    console.log(`[BONUS] Balance formatting examples:`);
    const example1 = 1500000n; // 1.5 USDC
    console.log(`   ${example1} → ${formatBalance(example1)} USDC`);

    const example2 = parseAmount('2.5');
    console.log(`   2.5 USDC → ${example2} (smallest units)`);
    console.log();

    console.log(`${'='.repeat(70)}`);
    console.log(`  ✓ PHASE 1 COMPLETE - All checks passed!`);
    console.log(`${'='.repeat(70)}\n`);

    console.log(`📋 Next Steps:`);
    console.log(`   1. Run: npx papi add assethub -n polkadot_asset_hub`);
    console.log(`   2. Run: npx papi`);
    console.log(`   3. Uncomment descriptors import in src/blockchain/connection.ts`);
    console.log(`   4. Uncomment query in src/services/balance.ts`);
    console.log(`   5. Test balance queries\n`);
  } catch (error) {
    console.error(`\n✗ Phase 1 failed:`, error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

main();
