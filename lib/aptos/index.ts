/**
 * Mock Aptos Blockchain Integration
 * Used for verifying ownership and archive proofs.
 */

export async function verifyArchiveProof(): Promise<{
  isValid: boolean;
  timestamp: number;
  owner: string;
}> {
  // Mock verification delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return {
    isValid: true,
    timestamp: Date.now(),
    owner: '0x1234...abcd'
  };
}

export async function signArchiveTransaction(): Promise<string> {
  // Mock transaction signing
  await new Promise((resolve) => setTimeout(resolve, 800));
  return `0x${Math.random().toString(16).substring(2, 64)}`;
}
