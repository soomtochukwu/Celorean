// Frontend per-network addresses index
// Auto-synced from Smartcontract/addresses

import localhost from './localhost-addresses.json';
import celoSepolia from './celoSepolia-addresses.json';
import mainnet from './mainnet-addresses.json';

export interface ContractAddresses {
  proxyAddress: string | null;
  implementationAddress: string | null;
  network: string;
  environment?: 'localhost' | 'testnet' | 'mainnet' | string;
  deployedAt?: string | null;
  deployedAtFormatted?: string | null;
  deployer?: string | null;
  gasUsed?: string;
  blockNumber?: number;
  // Optional extended contracts (populated by deploy script when available)
  certificateNFT?: string;
  eventManager?: string;
  verifierRegistry?: string;
}

export type EnvironmentKey = 'localhost' | 'testnet' | 'mainnet';

export const environmentAddresses: Record<EnvironmentKey, ContractAddresses | undefined> = {
  localhost: localhost as ContractAddresses,
  testnet: (celoSepolia as ContractAddresses) && { ...(celoSepolia as ContractAddresses), environment: 'testnet' },
  mainnet: (mainnet as ContractAddresses) && { ...(mainnet as ContractAddresses), environment: 'mainnet' }
};

export function getAddressesForEnvironment(env: EnvironmentKey): ContractAddresses | undefined {
  return environmentAddresses[env];
}

export function getCurrentEnvironmentAddresses(env: EnvironmentKey = 'localhost'): ContractAddresses | undefined {
  return getAddressesForEnvironment(env);
}

/** @deprecated Use useNetworkAddresses() hook for dynamic address resolution */
export const CELOREAN_PROXY_ADDRESS = (localhost as ContractAddresses).proxyAddress;
/** @deprecated Use useNetworkAddresses() hook for dynamic address resolution */
export const CELOREAN_IMPLEMENTATION_ADDRESS = (localhost as ContractAddresses).implementationAddress;

export default {
  environmentAddresses,
  getAddressesForEnvironment,
  getCurrentEnvironmentAddresses,
  CELOREAN_PROXY_ADDRESS,
  CELOREAN_IMPLEMENTATION_ADDRESS
};