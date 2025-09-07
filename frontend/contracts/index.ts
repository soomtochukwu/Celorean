// Frontend contracts index - Environment-specific contract artifacts
// Auto-generated file - Do not edit manually
// This file provides easy access to all contract artifacts and addresses

import CeloreanArtifact from './Celorean.json';
import {
  environmentAddresses,
  getAddressesForEnvironment,
  getCurrentEnvironmentAddresses,
  contractAddresses,
  CELOREAN_PROXY_ADDRESS,
  CELOREAN_IMPLEMENTATION_ADDRESS,
  type ContractAddresses,
  type EnvironmentAddresses
} from './addresses';

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
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: 'http://localhost:8545',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  'celo-alfajores': {
    name: 'Celo Alfajores Testnet',
    chainId: 44787,
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    blockExplorer: 'https://alfajores-blockscout.celo-testnet.org',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18
    }
  },
  'celo-mainnet': {
    name: 'Celo Mainnet',
    chainId: 42220,
    rpcUrl: 'https://forno.celo.org',
    blockExplorer: 'https://explorer.celo.org',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18
    }
  }
};

// Extract contract artifacts from the JSON
const celoreanArtifacts: ContractArtifacts = {
  abi: CeloreanArtifact.abi,
  bytecode: CeloreanArtifact.bytecode,
  contractName: CeloreanArtifact.contractName,
  sourceName: CeloreanArtifact.sourceName
};

// Environment utility functions
export function getCurrentEnvironment(): 'localhost' | 'testnet' | 'mainnet' {
  return contractAddresses.environment as 'localhost' | 'testnet' | 'mainnet';
}

export function getNetworkConfig(env: 'localhost' | 'testnet' | 'mainnet'): NetworkConfig {
  const configMap = {
    localhost: networkConfigs.localhost,
    testnet: networkConfigs['celo-alfajores'],
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

// Current environment data
export const currentEnvironment = getCurrentEnvironment();
export const currentAddresses = getCurrentEnvironmentAddresses();
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
      networkConfig: networkConfigs['celo-alfajores']
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

// Current active contracts
export const currentContracts = getCurrentContracts();

// Convenience exports for direct access
export const celoreanABI = celoreanArtifacts.abi;
export const celoreanBytecode = celoreanArtifacts.bytecode;
export { celoreanArtifacts };

// Re-export address utilities from addresses.ts
export {
  environmentAddresses,
  getAddressesForEnvironment,
  contractAddresses,
  CELOREAN_PROXY_ADDRESS,
  CELOREAN_IMPLEMENTATION_ADDRESS,
  getCurrentEnvironmentAddresses,
  type ContractAddresses,
  type EnvironmentAddresses
};

// Default export with all contract information
export default {
  // Environment-specific data
  environmentContracts,
  environmentAddresses,
  networkConfigs,
  
  // Current environment data
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
  contractAddresses,
  CELOREAN_PROXY_ADDRESS,
  CELOREAN_IMPLEMENTATION_ADDRESS
};