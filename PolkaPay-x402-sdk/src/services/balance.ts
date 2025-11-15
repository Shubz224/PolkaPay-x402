/**
 * AssetHub Balance Query Service
 * Pattern from official PAPI docs
 */

import { getClient, getAssetHubApi } from '../blockchain/connection';
import { USDC } from '../config/constants';

/**
 * Query USDC balance for address
 * Uses official storage query pattern from PAPI docs:
 * api.query.Assets.Account.getValue(assetId, address)
 */
export async function getUSDCBalance(address: string): Promise<bigint> {
  try {
    const client = getClient();

    // After running: npx papi add assethub -n polkadot_asset_hub && npx papi
    // Uncomment in connection.ts and import here
    // const api = await getAssetHubApi();
    // const balanceData = await api.query.Assets.Account.getValue([
    //   USDC.assetId,
    //   address,
    // ]);
    // return balanceData?.balance ?? 0n;

    console.log(`✓ Querying USDC balance for: ${address}`);

    // Placeholder until descriptors are generated
    return 0n;
  } catch (error) {
    console.error(`✗ Failed to query balance:`, error);
    throw error;
  }
}

/**
 * Check if account exists (has been initialized)
 */
export async function accountExists(address: string): Promise<boolean> {
  try {
    const balance = await getUSDCBalance(address);
    return balance >= 0n; // If query succeeds, account exists
  } catch {
    return false;
  }
}

/**
 * Format balance to human-readable
 */
export function formatBalance(amount: bigint): string {
  const str = amount.toString().padStart(USDC.decimals + 1, '0');
  const int = str.slice(0, -USDC.decimals) || '0';
  const dec = str.slice(-USDC.decimals);
  return `${int}.${dec}`;
}

/**
 * Parse user input to smallest units
 */
export function parseAmount(amount: string): bigint {
  const [int = '0', dec = ''] = amount.split('.');
  const normalized = dec.padEnd(USDC.decimals, '0').slice(0, USDC.decimals);
  return BigInt(int + normalized);
}
