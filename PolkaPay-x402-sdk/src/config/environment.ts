/**
 * Environment Configuration Loader
 */

import fs from 'fs';
import dotenv from 'dotenv';

export function loadEnvironment() {
  // Load from .env.local
  if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
  }

  const config = {
    rpcEndpointWss: process.env.RPC_ENDPOINT_WSS || 'wss://statemint.api.onfinality.io/public-ws',
    network: (process.env.NETWORK || 'mainnet') as 'mainnet' | 'testnet',
    usdcAssetId: parseInt(process.env.USDC_ASSET_ID || '1337'),
    usdcDecimals: parseInt(process.env.USDC_DECIMALS || '6'),
    logLevel: process.env.LOG_LEVEL || 'info',
  };

  console.log(`✓ Environment loaded: ${config.network}`);
  console.log(`✓ RPC: ${config.rpcEndpointWss}`);

  return config;
}

export const config = loadEnvironment();
