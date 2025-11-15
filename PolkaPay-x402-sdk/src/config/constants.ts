/**
 * PolkaPay Constants - Using ONLY polkadot-api
 */

export const USDC = {
  assetId: 1337,
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
  minBalance: 1000n, // 0.001 USDC
} as const;

export const ASSETHUB = {
  name: 'Polkadot AssetHub',
  ss58Prefix: 0, // Polkadot format
} as const;

export const RPC_CONFIG = {
  timeout: 30000,
  maxRetries: 3,
  retryDelayMs: 1000,
} as const;
