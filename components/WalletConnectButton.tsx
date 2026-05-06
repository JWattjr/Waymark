"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

export default function WalletConnectButton() {
  const { connected, connect, disconnect, account, wallets } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

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
    <>
      <button onClick={() => setIsOpen(true)} className="bg-[var(--color-primary)] text-[var(--color-card)] border border-[var(--color-border)]/40 rounded-full px-5 py-2 shadow-lg text-xs font-bold hover:bg-[#2a1c0e] transition-colors flex items-center gap-2">
        Connect Wallet
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div ref={modalRef} className="bg-[var(--color-background)] border border-[var(--color-border)]/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Connect Wallet</h2>
            <div className="flex flex-col gap-3">
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => {
                    connect(wallet.name);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-4 rounded-xl border border-[var(--color-border)]/40 hover:bg-[var(--color-card)] transition-all hover:scale-[1.02] text-left"
                >
                  <Image src={wallet.icon} alt={`${wallet.name} icon`} width={32} height={32} className="rounded-lg" unoptimized />
                  <span className="font-semibold text-[var(--color-text)] flex-1">{wallet.name}</span>
                  {wallet.readyState === "Installed" && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-full">
                      Installed
                    </span>
                  )}
                </button>
              ))}
              {wallets.length === 0 && (
                <p className="text-[var(--color-text-muted)] text-center py-4">
                  No wallets found. Please install an Aptos wallet extension.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
