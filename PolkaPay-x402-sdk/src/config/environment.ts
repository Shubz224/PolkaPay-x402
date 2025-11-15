import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadEnvironment() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  const config = {
    // ✅ CHANGE TO WESTEND ENDPOINT
    rpcEndpointWss: process.env.RPC_ENDPOINT_WSS || 'wss://westend-asset-hub-rpc.polkadot.io',
    network: (process.env.NETWORK || 'westend') as 'mainnet' | 'testnet' | 'westend',
    usdcAssetId: parseInt(process.env.USDC_ASSET_ID || '1337'),
    usdcDecimals: parseInt(process.env.USDC_DECIMALS || '6'),
    logLevel: process.env.LOG_LEVEL || 'info',
  };

  console.log(`✓ Environment loaded: ${config.network}`);
  console.log(`✓ RPC: ${config.rpcEndpointWss}`);

  return config;
}

export const config = loadEnvironment();
