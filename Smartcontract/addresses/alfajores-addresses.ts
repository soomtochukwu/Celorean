// Auto-generated file - Do not edit manually
// Generated on: 2025-09-11 16:21:09 UTC
// Network: alfajores
// Environment: alfajores
// Deployment Type: Upgrade
// Upgraded from: 0xEf51b7B34F843348C726C912FeDa16802072090D

export interface ContractAddresses {
  proxyAddress: string;
  implementationAddress: string;
  network: string;
  environment: string;
  deployedAt: string;
  deployedAtFormatted?: string;
  deployer: string;
  previousImplementation?: string;
  upgradedAt?: string;
  upgradedAtFormatted?: string;
  gasUsed: string;
  blockNumber: number;
}

export interface EnvironmentAddresses {
  localhost?: ContractAddresses;
  testnet?: ContractAddresses;
  mainnet?: ContractAddresses;
}

// Current deployment addresses
export const contractAddresses: ContractAddresses = {
  proxyAddress: "0x8CB97c5eD4Dae06c9452ebCcef157718804DeA15",
  implementationAddress: "0x9147b5B39a7bD179749ABc55C43A359106c090FB",
  network: "alfajores",
  environment: "alfajores",
  deployedAt: "2025-07-18T18:28:49.311Z",
  deployedAtFormatted: "2025-07-18 18:28:49 UTC",
  deployer: "0x8a371e00cd51E2BE005B86EF73C5Ee9Ef6d23FeB",
  previousImplementation: "0xEf51b7B34F843348C726C912FeDa16802072090D",
  upgradedAt: "2025-09-11T16:21:09.420Z",
  upgradedAtFormatted: "2025-09-11 16:21:09 UTC",
  gasUsed: "38087",
  blockNumber: 56652342
};

// Environment-specific addresses (will be populated as deployments occur)
export const environmentAddresses: EnvironmentAddresses = {
  testnet: contractAddresses
};

// Export individual addresses for convenience
export const CELOREAN_PROXY_ADDRESS = "0x8CB97c5eD4Dae06c9452ebCcef157718804DeA15";
export const CELOREAN_IMPLEMENTATION_ADDRESS = "0x9147b5B39a7bD179749ABc55C43A359106c090FB";

// Environment-specific getters
export function getAddressesForEnvironment(env: 'localhost' | 'testnet' | 'mainnet'): ContractAddresses | undefined {
  return environmentAddresses[env];
}

export function getCurrentEnvironmentAddresses(): ContractAddresses {
  return contractAddresses;
}

export default contractAddresses;
