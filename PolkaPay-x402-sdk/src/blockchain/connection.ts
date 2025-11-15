/**
 * Polkadot-API Connection Manager
 * Uses ONLY polkadot-api - NO @polkadot/* packages
 */

import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { config } from '../config/environment';

// Import descriptors after running: npx papi add assethub -n polkadot_asset_hub && npx papi
// import { polkadot_asset_hub } from 'papi-descriptors/polkadot_asset_hub';

let client: ReturnType<typeof createClient> | null = null;

/**
 * Initialize PAPI client for AssetHub
 * Uses WSS provider with official SDK compatibility wrapper
 */
export async function initializeClient() {
  try {
    console.log(`🔗 Initializing Polkadot-API client...`);
    console.log(`   Endpoint: ${config.rpcEndpointWss}`);

    // Create WSS provider with SDK compatibility
    const provider = withPolkadotSdkCompat(
      getWsProvider(config.rpcEndpointWss)
    );

    // Create PAPI client
    client = createClient(provider);

    console.log(`✓ PAPI client initialized`);
    return client;
  } catch (error) {
    console.error(`✗ Failed to initialize client:`, error);
    throw error;
  }
}

/**
 * Get current client
 */
export function getClient() {
  if (!client) {
    throw new Error('Client not initialized. Call initializeClient() first.');
  }
  return client;
}

/**
 * Verify connection is working
 */
export async function verifyConnection() {
  try {
    const currentClient = getClient();

    // Get finalized block using official pattern
    const finalizedBlock = await currentClient.getFinalizedBlock();

    console.log(`✓ Connection verified`);
    console.log(`   Block: #${finalizedBlock.number}`);
    console.log(`   Hash: ${finalizedBlock.hash}`);

    return finalizedBlock;
  } catch (error) {
    console.error(`✗ Connection verification failed:`, error);
    throw error;
  }
}

/**
 * Get TypedApi for AssetHub (after descriptors are generated)
 * Call after running: npx papi && npx papi generate
 */
export async function getAssetHubApi() {
  try {
    const currentClient = getClient();
    
    // ✅ CORRECT: Use 'assethub'
    const { assethub } = await import('@polkadot-api/descriptors');
    
    const typedApi = currentClient.getTypedApi(assethub);
    console.log(`✓ TypedApi initialized for AssetHub`);
    return typedApi;
  } catch (error) {
    console.error(`✗ Failed to get AssetHub API:`, error);
    throw error;
  }
}



/**
 * Disconnect and cleanup
 */
export async function disconnect() {
  if (client) {
    client.destroy();
    client = null;
    console.log(`✓ Client disconnected`);
  }
}

/**
 * Initialize with retry logic
 */
export async function initializeWithRetry(
  maxRetries: number = 3,
  delayMs: number = 1000
) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Connection attempt ${attempt}/${maxRetries}...`);
      await initializeClient();
      await verifyConnection();
      return client;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed: ${lastError.message}`);

      if (attempt < maxRetries) {
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `Failed to initialize after ${maxRetries} attempts: ${lastError?.message}`
  );
}
