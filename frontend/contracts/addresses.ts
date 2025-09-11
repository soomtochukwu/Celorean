// Auto-generated file - Do not edit manually
// Generated on: 2025-09-11 17:17:13 UTC
// Network: alfajores
// Environment: alfajores
// Deployment Type: Initial Deployment

export interface ContractAddresses {
  proxyAddress: string;
  implementationAddress: string;
  network: string;
  environment: string;
  deployedAt: string;
  deployedAtFormatted: string;
  deployer: string;
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
  proxyAddress: "0x27C240C952C8a5D9E4BA4bB3594c75090b94541c",
  implementationAddress: "0x9147b5B39a7bD179749ABc55C43A359106c090FB",
  network: "alfajores",
  environment: "alfajores",
  deployedAt: "2025-09-11T17:17:13.383Z",
  deployedAtFormatted: "2025-09-11 17:17:13 UTC",
  deployer: "0x8a371e00cd51E2BE005B86EF73C5Ee9Ef6d23FeB",
  gasUsed: "380491",
  blockNumber: 56655704
};

// Environment-specific addresses (will be populated as deployments occur)
export const environmentAddresses: EnvironmentAddresses = {
  testnet: contractAddresses
};

// Export individual addresses for convenience
export const CELOREAN_PROXY_ADDRESS = "0x27C240C952C8a5D9E4BA4bB3594c75090b94541c";
export const CELOREAN_IMPLEMENTATION_ADDRESS = "0x9147b5B39a7bD179749ABc55C43A359106c090FB";

// Environment-specific getters
export function getAddressesForEnvironment(env: 'localhost' | 'testnet' | 'mainnet'): ContractAddresses | undefined {
  return environmentAddresses[env];
}

export function getCurrentEnvironmentAddresses(): ContractAddresses {
  return contractAddresses;
}

export default contractAddresses;
