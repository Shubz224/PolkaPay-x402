/**
 * AssetHub Balance Query Service - Phase 2 (CORRECT PAPI API)
 * Real balance queries from blockchain
 */

import { getAssetHubApi } from '../blockchain/connection';
import { USDC } from '../config/constants';

/**
 * Query USDC balance for a single address
 * Returns balance in smallest units (bigint)
 */
export async function getUSDCBalance(address: string): Promise<bigint> {
  try {
    const typedApi = await getAssetHubApi();

    console.log(`✓ Querying USDC balance for: ${address}`);

    // CORRECT PAPI API: getValue takes keys as separate arguments, not array
    // Pattern: getValue(key1, key2, ..., options?)
    const balanceData = await typedApi.query.Assets.Account.getValue(
      USDC.assetId as number,
      address as string,
      { at: 'best' }
    );

    // If account doesn't exist, balanceData will be null/undefined
    const balance = balanceData?.balance ?? 0n;

    console.log(`   Balance: ${balance} (smallest units)`);
    console.log(`   Formatted: ${formatBalance(balance)} USDC`);

    return balance;
  } catch (error) {
    console.error(`✗ Failed to query balance:`, error);
    throw error;
  }
}

/**
 * Query USDC balances for multiple addresses (batch)
 * More efficient than querying one-by-one
 */
export async function getBatchBalances(
  addresses: string[]
): Promise<Map<string, bigint>> {
  try {
    const typedApi = await getAssetHubApi();

    console.log(`✓ Batch querying ${addresses.length} addresses...`);

    // CORRECT PAPI API: getValues takes array of argument tuples
    const results = await typedApi.query.Assets.Account.getValues(
      addresses.map(addr => [USDC.assetId as number, addr as string]),
      { at: 'best' }
    );

    // Map results back to addresses
    const balances = new Map<string, bigint>();

    for (let i = 0; i < addresses.length; i++) {
      const balance = results[i]?.balance ?? 0n;
      balances.set(addresses[i], balance);
      console.log(`   ${addresses[i]}: ${formatBalance(balance)} USDC`);
    }

    return balances;
  } catch (error) {
    console.error(`✗ Failed to batch query balances:`, error);
    throw error;
  }
}

/**
 * Check if account exists on-chain
 * Important before sending transfers
 */
export async function accountExists(address: string): Promise<boolean> {
  try {
    const typedApi = await getAssetHubApi();

    console.log(`✓ Checking if account exists: ${address}`);

    // CORRECT PAPI API: getValue with separate arguments
    const balanceData = await typedApi.query.Assets.Account.getValue(
      USDC.assetId as number,
      address as string,
      { at: 'best' }
    );

    const exists = balanceData !== null && balanceData !== undefined;
    console.log(`   Account exists: ${exists}`);

    return exists;
  } catch (error) {
    console.error(`✗ Failed to check account existence:`, error);
    throw error;
  }
}

/**
 * Subscribe to real-time balance updates
 * Using watchValue() which returns Observable
 */
export async function subscribeToBalance(
  address: string,
  callback: (balance: bigint) => void
): Promise<() => void> {
  try {
    const typedApi = await getAssetHubApi();

    console.log(`✓ Subscribing to balance changes: ${address}`);

    // CORRECT PAPI API: watchValue for subscriptions
    // Returns Observable, subscribe returns unsubscribe function
    const observable = typedApi.query.Assets.Account.watchValue(
      USDC.assetId as number,
      address as string,
      'best'
    );

    // Subscribe to the observable
    const subscription = observable.subscribe((balanceData: any) => {
      const balance = balanceData?.balance ?? 0n;
      console.log(`   New balance: ${formatBalance(balance)} USDC`);
      callback(balance);
    });

    console.log(`✓ Subscription active`);

    // Return unsubscribe function
    return () => subscription.unsubscribe();
  } catch (error) {
    console.error(`✗ Failed to subscribe to balance:`, error);
    throw error;
  }
}

/**
 * Format balance from smallest units to human-readable USDC
 * Example: 5000000n → "5.000000"
 */
export function formatBalance(smallestUnits: bigint): string {
  try {
    const str = smallestUnits.toString().padStart(USDC.decimals + 1, '0');
    const integer = str.slice(0, -USDC.decimals) || '0';
    const decimal = str.slice(-USDC.decimals);
    return `${integer}.${decimal}`;
  } catch (error) {
    console.error(`✗ Failed to format balance:`, error);
    throw error;
  }
}

/**
 * Parse human-readable amount to smallest units
 * Example: "5.5" → 5500000n
 */
export function parseAmount(amount: string): bigint {
  try {
    const [integer = '0', decimal = ''] = amount.split('.');
    const normalized = decimal.padEnd(USDC.decimals, '0').slice(0, USDC.decimals);
    return BigInt(integer + normalized);
  } catch (error) {
    console.error(`✗ Failed to parse amount:`, error);
    throw error;
  }
}

/**
 * Get account details (balance + metadata)
 */
export async function getAccountDetails(address: string) {
  try {
    const typedApi = await getAssetHubApi();

    console.log(`✓ Getting full account details for: ${address}`);

    // CORRECT PAPI API: getValue with separate arguments
    const accountData = await typedApi.query.Assets.Account.getValue(
      USDC.assetId as number,
      address as string,
      { at: 'best' }
    );

    if (!accountData) {
      return {
        exists: false,
        address,
        balance: 0n,
        formatted: '0.000000',
      };
    }

    return {
      exists: true,
      address,
      balance: accountData.balance ?? 0n,
      formatted: formatBalance(accountData.balance ?? 0n),
      status: accountData.status ?? 'Liquid', // Frozen/Liquid
      reason: accountData.reason ?? null, // Why frozen (if applicable)
    };
  } catch (error) {
    console.error(`✗ Failed to get account details:`, error);
    throw error;
  }
}
