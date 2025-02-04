import {
  base,
  mainnet,
  optimism,
  sepolia,
  zksync,
  zksyncSepoliaTestnet,
} from 'wagmi/chains';

export const hedgeyContractAddresses = {
  [optimism.id]: '0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6',
  [mainnet.id]: '0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6',
  [sepolia.id]: '0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6',
  [base.id]: '0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6',
  // TODO: Add correct contract addresses for zkSync once they have been deployed
  [zksync.id]: '0x83FD45623D1627258D5e336e8BaeE3796F47a1C5',
  [zksyncSepoliaTestnet.id]: '0xUnknown',
} as Record<number, `0x${string}`>;
