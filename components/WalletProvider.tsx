"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider optInWallets={["Petra"]} autoConnect={true}>
      {children}
    </AptosWalletAdapterProvider>
  );
}
