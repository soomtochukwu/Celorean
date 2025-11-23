// Frontend contracts index - Environment-specific contract artifacts
// Auto-generated file - Do not edit manually
// This file provides easy access to all contract artifacts and addresses

import CeloreanArtifact from './Celorean.json';
import {
  environmentAddresses,
  getAddressesForEnvironment,
  getCurrentEnvironmentAddresses,
  CELOREAN_PROXY_ADDRESS,
  CELOREAN_IMPLEMENTATION_ADDRESS,
  type ContractAddresses,
} from './addresses/index';

// Network configuration interface
export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Contract artifacts interface
export interface ContractArtifacts {
  abi: any[];
  bytecode: string;
  contractName: string;
  sourceName: string;
}

// Environment-specific contracts interface
export interface EnvironmentContracts {
  localhost?: {
    addresses: ContractAddresses;
    artifacts: ContractArtifacts;
    networkConfig: NetworkConfig;
  };
  testnet?: {
    addresses: ContractAddresses;
    artifacts: ContractArtifacts;
    networkConfig: NetworkConfig;
  };
  mainnet?: {
    addresses: ContractAddresses;
    artifacts: ContractArtifacts;
    networkConfig: NetworkConfig;
  };
}

// Network configurations for different environments
export const networkConfigs = {
  localhost: {
    name: 'Localhost',
    chainId: 1337,
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: 'http://localhost:8545',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18
    }
  },
  'celo-sepolia': {
    name: 'Celo Sepolia Testnet',
    chainId: 11142220,
    rpcUrl: 'https://rpc.ankr.com/celo_sepolia',
    blockExplorer: 'https://sepolia.celoscan.io',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18,
    },
  },
  'celo-mainnet': {
    name: 'Celo Mainnet',
    chainId: 42220,
    rpcUrl: 'https://celo.drpc.org',
    blockExplorer: 'https://celoscan.io',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18,
    },
  },
} as const;

// Extract contract artifacts from the JSON
const celoreanArtifacts: ContractArtifacts = {
  abi: CeloreanArtifact.abi,
  bytecode: CeloreanArtifact.bytecode,
  contractName: CeloreanArtifact.contractName,
  sourceName: CeloreanArtifact.sourceName
};

// Environment utility functions
export function getCurrentEnvironment(): 'localhost' | 'testnet' | 'mainnet' {
  // Fallback to environment variable or default to localhost
  const env = (process.env.NEXT_PUBLIC_ENVIRONMENT as 'localhost' | 'testnet' | 'mainnet' | undefined) || 'localhost';
  return env;
}

export function getNetworkConfig(env: 'localhost' | 'testnet' | 'mainnet'): NetworkConfig {
  const configMap = {
    localhost: networkConfigs.localhost,
    testnet: networkConfigs['celo-sepolia'],
    mainnet: networkConfigs['celo-mainnet']
  };
  return configMap[env];
}

export function getContractsForEnvironment(env: 'localhost' | 'testnet' | 'mainnet') {
  return environmentContracts[env];
}

export function getCurrentContracts() {
  return getContractsForEnvironment(currentEnvironment);
}

// Current environment data - DEPRECATED: Use useNetwork() hook instead
// These static values are initialized once and do not react to network changes
export const currentEnvironment = getCurrentEnvironment();
/** @deprecated Use useNetworkAddresses() hook for dynamic address resolution */
export const currentAddresses = getCurrentEnvironmentAddresses(currentEnvironment);
/** @deprecated Use useNetworkConfig() hook for dynamic network config */
export const currentNetworkConfig = getNetworkConfig(currentEnvironment);

// Environment-specific contract configurations
export const environmentContracts: EnvironmentContracts = {
  ...(environmentAddresses.localhost && {
    localhost: {
      addresses: environmentAddresses.localhost,
      artifacts: celoreanArtifacts,
      networkConfig: networkConfigs.localhost
    }
  }),
  ...(environmentAddresses.testnet && {
    testnet: {
      addresses: environmentAddresses.testnet,
      artifacts: celoreanArtifacts,
      networkConfig: networkConfigs['celo-sepolia']
    }
  }),
  ...(environmentAddresses.mainnet && {
    mainnet: {
      addresses: environmentAddresses.mainnet,
      artifacts: celoreanArtifacts,
      networkConfig: networkConfigs['celo-mainnet']
    }
  })
};

// Current active contracts - DEPRECATED
/** @deprecated Use dynamic contract loading via useNetwork() or useNetworkAddresses() */
export const currentContracts = getCurrentContracts();

// Convenience exports for direct access
export const celoreanABI = celoreanArtifacts.abi;
export const celoreanBytecode = celoreanArtifacts.bytecode;
export { celoreanArtifacts };

// Re-export address utilities from addresses module
export {
  environmentAddresses,
  getAddressesForEnvironment,
  CELOREAN_PROXY_ADDRESS,
  CELOREAN_IMPLEMENTATION_ADDRESS,
  getCurrentEnvironmentAddresses,
  type ContractAddresses,
};

// Default export with all contract information
export default {
  // Environment-specific data
  environmentContracts,
  environmentAddresses,
  networkConfigs,
  
  // Current environment data (Static/Initial)
  currentEnvironment,
  currentContracts,
  currentAddresses,
  currentNetworkConfig,
  
  // Contract artifacts
  celoreanArtifacts,
  celoreanABI,
  celoreanBytecode,
  
  // Utility functions
  getContractsForEnvironment,
  getCurrentContracts,
  getCurrentEnvironment,
  getAddressesForEnvironment,
  getCurrentEnvironmentAddresses,
  getNetworkConfig,
  
  // Backward compatibility
  CELOREAN_PROXY_ADDRESS,
  CELOREAN_IMPLEMENTATION_ADDRESS
};