"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function WalletConnectButton() {
  const { connected, connect, disconnect, account, wallets } = useWallet();

  if (connected && account) {
    const addressString = account.address.toString();
    return (
      <button onClick={disconnect} className="bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)]/40 rounded-full px-5 py-2 shadow-lg text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-card)] transition-colors flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        {addressString.slice(0, 6)}...{addressString.slice(-4)}
      </button>
    );
  }

  return (
    <button onClick={() => connect(wallets[0]?.name)} className="bg-[var(--color-primary)] text-[var(--color-card)] border border-[var(--color-border)]/40 rounded-full px-5 py-2 shadow-lg text-xs font-bold hover:bg-[#2a1c0e] transition-colors flex items-center gap-2">
      Connect Petra
    </button>
  );
}
