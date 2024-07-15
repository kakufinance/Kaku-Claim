import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { WagmiProvider } from 'wagmi'
import { mainnet,sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 0. Setup queryClient


import { cookieStorage, createStorage, http } from "wagmi";
import { createWeb3Modal } from '@web3modal/wagmi';

// Get projectId at https://cloud.walletconnect.com
export const projectId = "f88935044273778d2633fbcaf48e3b96" || "";
const queryClient = new QueryClient()

if (!projectId) throw new Error("Project ID is not defined");

const metadata = {
  name: "KAKU Web3Modal",
  description: "KAKU finance",
  url: "https://kaku.finance", // origin must match your domain & subdomain
  icons: ["https://kaku.finance/wp-content/uploads/2024/06/kaku-icon.png"],
};

// Create wagmiConfig
export const config = defaultWagmiConfig({
  chains: [mainnet, sepolia], // required
  projectId, // required
  metadata, // required
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});


// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export function Web3ModalProvider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}