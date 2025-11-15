import {
  cryptoWaitReady,
  mnemonicGenerate,
  mnemonicToMiniSecret,
} from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
export interface KeypairInfo {
  address: string;
  publicKeyHex: string;
  publicKeyBytes: Uint8Array;
  seedPhrase?: string;
  name?: string;
}

export async function initializeCrypto() {
  try {
    await cryptoWaitReady();
    console.log(`✓ Crypto subsystem initialized`);
  } catch (error) {
    console.error(`✗ Crypto initialization failed:`, error);
    throw error;
  }
}

export async function generateNewKeypair(
  name: string = 'PolkaPay Account'
): Promise<KeypairInfo> {
  try {
    await cryptoWaitReady();

    const mnemonic = mnemonicGenerate(24);
    const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
    const pair = keyring.createFromUri(mnemonic, { name });

    const info: KeypairInfo = {
      address: pair.address,
     publicKeyHex: u8aToHex(pair.publicKey),
      publicKeyBytes: pair.publicKey,
      seedPhrase: mnemonic,
      name,
    };

    console.log(`✓ New keypair generated`);
    console.log(`   Name: ${info.name}`);
    console.log(`   Address: ${info.address}`);

    return info;
  } catch (error) {
    console.error(`✗ Failed to generate keypair:`, error);
    throw error;
  }
}

export async function importFromSeedPhrase(
  seedPhrase: string,
  name: string = 'Imported Account'
): Promise<KeypairInfo> {
  try {
    await cryptoWaitReady();

    const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
    const pair = keyring.createFromUri(seedPhrase, { name });

    return {
      address: pair.address,
      publicKeyHex: u8aToHex(pair.publicKey),
      publicKeyBytes: pair.publicKey,
      name,
    };
  } catch (error) {
    console.error(`✗ Failed to import from seed phrase:`, error);
    throw error;
  }
}

export async function signData(
  data: Uint8Array,
  seedPhrase: string
): Promise<Uint8Array> {
  try {
    await cryptoWaitReady();

    const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
    const pair = keyring.createFromUri(seedPhrase);

    return pair.sign(data);
  } catch (error) {
    console.error(`✗ Failed to sign data:`, error);
    throw error;
  }
}

export function formatBalance(smallestUnits: bigint, decimals: number = 6): string {
  const str = smallestUnits.toString().padStart(decimals + 1, '0');
  const integer = str.slice(0, -decimals) || '0';
  const decimal = str.slice(-decimals);
  return `${integer}.${decimal}`;
}

export function parseAmount(amount: string, decimals: number = 6): bigint {
  const [integer = '0', decimal = ''] = amount.split('.');
  const normalized = decimal.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(integer + normalized);
}
