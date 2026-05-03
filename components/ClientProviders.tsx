"use client";

import dynamic from "next/dynamic";
import { PropsWithChildren } from "react";

const WalletProvider = dynamic(
  () => import("./WalletProvider").then((mod) => mod.WalletProvider),
  { ssr: false }
);

export default function ClientProviders({ children }: PropsWithChildren) {
  return <WalletProvider>{children}</WalletProvider>;
}
