// Frontend per-network addresses index
// Auto-synced from Smartcontract/addresses

import localhost from './localhost-addresses.json';
import alfajores from './alfajores-addresses.json';

export interface ContractAddresses {
  proxyAddress: string;
  implementationAddress: string;
  network: string;
  environment?: 'localhost' | 'testnet' | 'mainnet' | string;
  deployedAt?: string;
  deployedAtFormatted?: string;
  deployer?: string;
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
  testnet: (alfajores as ContractAddresses) && { ...(alfajores as ContractAddresses), environment: 'testnet' },
  mainnet: undefined
};

export function getAddressesForEnvironment(env: EnvironmentKey): ContractAddresses | undefined {
  return environmentAddresses[env];
}

export function getCurrentEnvironmentAddresses(env: EnvironmentKey = 'localhost'): ContractAddresses | undefined {
  return getAddressesForEnvironment(env);
}

export const CELOREAN_PROXY_ADDRESS = (localhost as ContractAddresses).proxyAddress;
export const CELOREAN_IMPLEMENTATION_ADDRESS = (localhost as ContractAddresses).implementationAddress;

export default {
  environmentAddresses,
  getAddressesForEnvironment,
  getCurrentEnvironmentAddresses,
  CELOREAN_PROXY_ADDRESS,
  CELOREAN_IMPLEMENTATION_ADDRESS
};