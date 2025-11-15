/**
 * AssetHub USDC Transaction Service - Phase 3 (CORRECTED)
 * Build, sign, and submit USDC transfer transactions
 */

import { getAssetHubApi, getClient } from '../blockchain/connection';
import { USDC } from '../config/constants';
import { Keyring } from '@polkadot/keyring';
import { mnemonicToMiniSecret, cryptoWaitReady } from '@polkadot/util-crypto';

/**
 * Build a USDC transfer transaction
 * Returns unsigned transaction
 */
export async function buildUSDCTransfer(
  destinationAddress: string,
  amountUSDC: string // Human-readable: "5.25"
) {
  try {
    const typedApi = await getAssetHubApi();

    console.log(`✓ Building USDC transfer transaction`);
    console.log(`   To: ${destinationAddress}`);
    console.log(`   Amount: ${amountUSDC} USDC`);

    // Convert amount to smallest units (bigint)
    const amountSmallest = parseAmountToBigInt(amountUSDC);
    console.log(`   Amount (smallest units): ${amountSmallest}`);

    // CORRECT: Use MultiAddress.Id() to wrap the address
    // Assets.transfer expects target to be MultiAddress type
    const { MultiAddress } = await import('@polkadot-api/descriptors');

    // Build transaction using official PAPI pattern
    const tx = typedApi.tx.Assets.transfer({
      id: USDC.assetId as number,
      target: MultiAddress.Id(destinationAddress), // ✅ CORRECT: Wrap in MultiAddress.Id()
      amount: amountSmallest,
    });

    console.log(`✓ Transaction built successfully`);
    return tx;
  } catch (error) {
    console.error(`✗ Failed to build transaction:`, error);
    throw error;
  }
}

/**
 * Estimate transaction fees
 */
export async function estimateTransactionFees(
  transactionData: any,
  senderAddress: string
): Promise<bigint> {
  try {
    const typedApi = await getAssetHubApi();

    console.log(`✓ Estimating transaction fees`);
    console.log(`   From: ${senderAddress}`);

    // Get estimated fees
    const estimatedFees = await transactionData.getEstimatedFees(senderAddress);

    console.log(`   Estimated fees: ${estimatedFees} (smallest units)`);
    console.log(`   Estimated fees: ${formatBalance(estimatedFees)} DOT`);

    return estimatedFees;
  } catch (error) {
    console.error(`✗ Failed to estimate fees:`, error);
    throw error;
  }
}

/**
 * Sign a transaction with a keypair
 */
export async function signTransaction(
  transactionData: any,
  seedPhrase: string,
  txOptions?: any
): Promise<{
  signedExtrinsic: string;
  txHash: string;
}> {
  try {
    console.log(`✓ Signing transaction...`);

    // ✅ CORRECT: Use @polkadot/keyring, not polkadot-api
    await cryptoWaitReady();

    // Create keypair from seed phrase
    const seed = mnemonicToMiniSecret(seedPhrase);
    const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
    
    // Create pair from URI (which can be seed phrase)
    const pair = keyring.createFromUri(seedPhrase);

    // Sign the transaction
    const signedExtrinsic = await transactionData.sign(pair, txOptions || {});

    console.log(`✓ Transaction signed`);
    console.log(`   Signed extrinsic: ${signedExtrinsic.substring(0, 20)}...`);

    return {
      signedExtrinsic,
      txHash: signedExtrinsic,
    };
  } catch (error) {
    console.error(`✗ Failed to sign transaction:`, error);
    throw error;
  }
}

/**
 * Submit a signed transaction to the blockchain
 */
export async function submitTransaction(
  transactionData: any,
  seedPhrase: string,
  txOptions?: any
): Promise<{
  txHash: string;
  status: string;
  block?: {
    number: number;
    hash: string;
    index: number;
  };
  ok: boolean;
}> {
  try {
    console.log(`✓ Submitting transaction to blockchain...`);

    // ✅ CORRECT: Use @polkadot/keyring
    await cryptoWaitReady();

    const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
    const pair = keyring.createFromUri(seedPhrase);

    // Submit and wait for finalization
    const result = await transactionData.signAndSubmit(pair, txOptions || {});

    console.log(`✓ Transaction submitted and finalized`);
    console.log(`   Tx Hash: ${result.txHash}`);
    console.log(`   Status: ${result.ok ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Block: #${result.block.number}`);
    console.log(`   Block Hash: ${result.block.hash}`);

    return {
      txHash: result.txHash,
      status: result.ok ? 'Success' : 'Failed',
      block: result.block,
      ok: result.ok,
    };
  } catch (error) {
    console.error(`✗ Failed to submit transaction:`, error);
    throw error;
  }
}

/**
 * Watch transaction status in real-time
 */
export async function watchTransactionStatus(
  transactionData: any,
  seedPhrase: string,
  callback: (status: any) => void,
  txOptions?: any
): Promise<() => void> {
  try {
    console.log(`✓ Setting up transaction watcher...`);

    // ✅ CORRECT: Use @polkadot/keyring
    await cryptoWaitReady();

    const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
    const pair = keyring.createFromUri(seedPhrase);

    // Watch transaction (Observable-based)
    const observable = transactionData.signSubmitAndWatch(pair, txOptions || {});

    // Subscribe to updates
    const subscription = observable.subscribe({
      next: (event: any) => {
        console.log(`   Transaction event:`, event.type);
        callback(event);
      },
      error: (error: any) => {
        console.error(`   Transaction error:`, error);
      },
    });

    console.log(`✓ Transaction watcher active`);

    // Return unsubscribe function
    return () => subscription.unsubscribe();
  } catch (error) {
    console.error(`✗ Failed to watch transaction:`, error);
    throw error;
  }
}

/**
 * Helper: Format balance from smallest units to DOT
 */
function formatBalance(smallestUnits: bigint): string {
  const DECIMALS = 10; // Polkadot uses 10 decimals
  const str = smallestUnits.toString().padStart(DECIMALS + 1, '0');
  const integer = str.slice(0, -DECIMALS) || '0';
  const decimal = str.slice(-DECIMALS);
  return `${integer}.${decimal.substring(0, 4)}`;
}

/**
 * Helper: Parse amount to smallest units
 */
function parseAmountToBigInt(amount: string): bigint {
  const DECIMALS = 6; // USDC uses 6 decimals
  const [integer = '0', decimal = ''] = amount.split('.');
  const normalized = decimal.padEnd(DECIMALS, '0').slice(0, DECIMALS);
  return BigInt(integer + normalized);
}
