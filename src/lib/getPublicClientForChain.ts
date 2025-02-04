import { http, createPublicClient, isAddress } from 'viem';
import {
  base,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
  zksync,
} from 'viem/chains';

export const getChainForChainId = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return mainnet;
    case sepolia.id:
      return sepolia;
    case optimism.id:
      return optimism;
    case optimismSepolia.id:
      return optimismSepolia;
    case zksync.id:
      return zksync;
    case base.id:
      return base;
    default:
      throw new Error(`Unsupported chain: ${chainId}`);
  }
};

const getRpcUrlForChain = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return 'https://eth.drpc.org';
    case sepolia.id:
      return 'https://ethereum-sepolia-rpc.publicnode.com';
    case optimism.id:
      return 'https://mainnet.optimism.io';
    case optimismSepolia.id:
      return 'https://sepolia.optimism.io';
    case zksync.id:
      return 'https://mainnet.era.zksync.io';
    case base.id:
      return 'https://mainnet.base.org';
    default:
      throw new Error(`Unsupported chain: ${chainId}`);
  }
};

export const getChainIdByNetworkName = (networkName: string | null) => {
  switch (networkName) {
    case 'mainnet':
      return mainnet.id;
    case 'sepolia':
      return sepolia.id;
    case 'optimism':
      return optimism.id;
    case 'optimismSepolia':
      return optimismSepolia.id;
    case 'zksync-era':
      return zksync.id;
    case 'base':
      return base.id;
    default:
      throw new Error(`Unsupported network name: ${networkName}`);
  }
};

export const generateBlockExplorerUrl = (
  chainId: number,
  hashOrAddress: string,
) => {
  const chain = getChainForChainId(chainId);

  if (isAddress(hashOrAddress)) {
    return `${chain.blockExplorers.default.url}/address/${hashOrAddress}`;
  }
  return `${chain.blockExplorers.default.url}/tx/${hashOrAddress}`;
};

export const getPublicClientForChain = (chainId: number) => {
  const chain = getChainForChainId(chainId);
  const rpcUrl = getRpcUrlForChain(chainId);

  return createPublicClient({
    transport: http(rpcUrl),
    chain,
  });
};
