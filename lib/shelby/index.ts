/**
 * Shelby Storage Protocol Integration
 * Shelby is a decentralized storage protocol for archiving travel journals.
 * Supports both wallet-connected uploads (user signs & owns) and ephemeral key fallback.
 */
import { ShelbyClient, ShelbyBlobClient, generateCommitments, createDefaultErasureCodingProvider } from '@shelby-protocol/sdk/browser';
import { Ed25519Account, Ed25519PrivateKey, Network, AccountAddress } from '@aptos-labs/ts-sdk';
import type { AptosSignAndSubmitTransactionOutput, InputTransactionData } from '@aptos-labs/wallet-adapter-react';

const SHELBY_KEY = 'waymark_shelby_ephemeral_key';



/**
 * Wallet signer interface — mirrors what the Aptos wallet adapter provides.
 * When provided, the user's own wallet signs and owns the transaction.
 */
export interface WalletSigner {
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<AptosSignAndSubmitTransactionOutput>;
  accountAddress: string;
}

type ShelbyUploadResult = {
  hash?: string;
  transaction_hash?: string;
  tx_hash?: string;
};

async function getEphemeralAccount(client: ShelbyClient): Promise<Ed25519Account> {
  // Check for a custom private key provided via environment variable
  const envKey = process.env.NEXT_PUBLIC_SHELBY_PRIVATE_KEY;
  if (envKey) {
    let key = envKey;
    if (key.startsWith('0x')) key = key.slice(2);
    return new Ed25519Account({ privateKey: new Ed25519PrivateKey(key) });
  }

  if (typeof window !== 'undefined') {
    // Check for a custom private key provided by the user in the UI
    const customKey = localStorage.getItem('waymark_custom_private_key');
    if (customKey) {
      let key = customKey;
      if (key.startsWith('0x')) key = key.slice(2);
      return new Ed25519Account({ privateKey: new Ed25519PrivateKey(key) });
    }

    const saved = localStorage.getItem(SHELBY_KEY);
    if (saved) {
      return new Ed25519Account({ privateKey: new Ed25519PrivateKey(saved) });
    }
  }

  const account = Ed25519Account.generate();
  
  // Fund the new account (this hits the 10/day faucet limit per IP)
  for (let i = 0; i < 2; i++) {
    await client.fundAccountWithAPT({ address: account.accountAddress, amount: 500_000_000 });
    await client.fundAccountWithShelbyUSD({ address: account.accountAddress, amount: 500_000_000 });
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(SHELBY_KEY, account.privateKey.toString());
  }
  
  return account;
}

/**
 * Upload a file to Shelby using the connected wallet's signer.
 * The user signs the on-chain registration tx from their own wallet,
 * making them the owner of the blob on-chain.
 */
async function uploadWithWallet(
  client: ShelbyClient,
  wallet: WalletSigner,
  blobData: Uint8Array,
  blobName: string
): Promise<{ cid: string; txHash?: string }> {
  const accountAddress = AccountAddress.from(wallet.accountAddress);

  console.log(`[Shelby] Generating commitments for "${blobName}" (${blobData.byteLength} bytes)...`);

  // 1. Generate commitments (erasure-code the blob & compute merkle root)
  const provider = await createDefaultErasureCodingProvider();
  const commitments = await generateCommitments(provider, blobData);
  const numChunksets = commitments.chunkset_commitments.length;

  console.log(`[Shelby] Commitments generated: merkle_root=${commitments.blob_merkle_root}, chunksets=${numChunksets}`);

  // 2. Build the on-chain registration payload
  const payload = ShelbyBlobClient.createRegisterBlobPayload({
    account: accountAddress,
    blobName,
    blobSize: blobData.byteLength,
    blobMerkleRoot: commitments.blob_merkle_root,
    expirationMicros: Date.now() * 1000 + 31536000000000, // ~1 year
    numChunksets,
    encoding: 0,
  });

  console.log(`[Shelby] Requesting wallet signature for blob registration...`);

  // 3. Sign & submit the registration tx via the user's wallet
  const txResult = await wallet.signAndSubmitTransaction({ data: payload });
  const txHash = txResult.hash;

  console.log(`[Shelby] ✅ Registration tx submitted: ${txHash || 'unknown'}`);

  // 4. Upload blob data to the Shelby RPC storage layer
  console.log(`[Shelby] Uploading blob data to RPC storage...`);
  await client.rpc.putBlob({
    account: accountAddress,
    blobName,
    blobData,
  });

  const shelbyUri = `shelby://${accountAddress.toString()}/${blobName}`;
  console.log(`[Shelby] ✅ Upload complete: ${shelbyUri}`);

  return { cid: shelbyUri, txHash };
}

/**
 * Upload a file to Shelby using an ephemeral key (legacy fallback).
 */
async function uploadWithEphemeralKey(
  client: ShelbyClient,
  blobData: Uint8Array,
  blobName: string
): Promise<{ cid: string; txHash?: string }> {
  const account = await getEphemeralAccount(client);
  const addr = account.accountAddress.toString();
  console.log(`[Shelby] Uploading "${blobName}" (${blobData.byteLength} bytes) with ephemeral account ${addr}`);

  const txResult = await client.upload({
    blobData,
    signer: account,
    blobName,
    expirationMicros: Date.now() * 1000 + 31536000000000 // ~1 year
  }) as unknown as ShelbyUploadResult | undefined;

  const txHash = txResult?.hash || txResult?.transaction_hash || txResult?.tx_hash;
  const shelbyUri = `shelby://${addr}/${blobName}`;
  console.log(`[Shelby] ✅ Upload successful: ${shelbyUri}`);
  if (txHash) console.log(`[Shelby] Transaction Hash: ${txHash}`);

  return { cid: shelbyUri, txHash };
}

/**
 * Upload a file to Shelby.
 * If a wallet signer is provided, the user's wallet signs the tx (user owns the blob).
 * Otherwise falls back to ephemeral key signing.
 */
export async function uploadToShelby(
  file: File,
  wallet?: WalletSigner
): Promise<{ cid: string; txHash?: string }> {
  const client = new ShelbyClient({ network: Network.SHELBYNET });
  
  const buffer = await file.arrayBuffer();
  const blobData = new Uint8Array(buffer);
  const blobName = `waymark/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  try {
    if (wallet) {
      return await uploadWithWallet(client, wallet, blobData, blobName);
    } else {
      return await uploadWithEphemeralKey(client, blobData, blobName);
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Shelby] ❌ Upload failed: ${errMsg}`, err);
    
    // Fallback: save as base64 in localStorage for the demo
    if (typeof window !== 'undefined') {
      console.warn('[Shelby] Falling back to localStorage mock storage');
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const mockCid = `shelby://mock/${blobName}`;
      const mocks = JSON.parse(localStorage.getItem('waymark_mock_cids') || '{}');
      mocks[mockCid] = base64;
      try {
        localStorage.setItem('waymark_mock_cids', JSON.stringify(mocks));
      } catch {
        console.error('[Shelby] localStorage full, cannot save mock image.');
      }
      return { cid: mockCid };
    }
    throw err;
  }
}

export async function getShelbyUrl(cid: string): Promise<string> {
  if (cid.startsWith('shelby://mock/')) {
    if (typeof window !== 'undefined') {
      const mocks = JSON.parse(localStorage.getItem('waymark_mock_cids') || '{}');
      if (mocks[cid]) return mocks[cid];
    }
    return `https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&q=80&w=1200`;
  }
  
  if (cid.startsWith('shelby://')) {
    // Format: shelby://0xACCOUNT_ADDRESS/blobName
    const path = cid.replace('shelby://', '');
    if (path.includes('/')) {
      const [account, ...rest] = path.split('/');
      const blobName = rest.join('/');
      return `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${account}/${blobName}`;
    }
    return `https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&q=80&w=1200`;
  }
  
  return cid.startsWith('http') ? cid : `https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&q=80&w=1200`;
}

export async function sealCapsule(): Promise<string> {
  // Mock sealing process for now
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Return a mock archive hash
  return `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
}
