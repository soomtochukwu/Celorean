// Auto-generated file - Do not edit manually
// Generated on: 2025-09-11 14:27:59 UTC
// Network: localhost
// Environment: localhost
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
  proxyAddress: "0xB581C9264f59BF0289fA76D61B2D0746dCE3C30D",
  implementationAddress: "0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f",
  network: "localhost",
  environment: "localhost",
  deployedAt: "2025-09-11T14:27:59.943Z",
  deployedAtFormatted: "2025-09-11 14:27:59 UTC",
  deployer: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
  gasUsed: "30000000",
  blockNumber: 2
};

// Environment-specific addresses (will be populated as deployments occur)
export const environmentAddresses: EnvironmentAddresses = {
  localhost: contractAddresses
};

// Export individual addresses for convenience
export const CELOREAN_PROXY_ADDRESS = "0xB581C9264f59BF0289fA76D61B2D0746dCE3C30D";
export const CELOREAN_IMPLEMENTATION_ADDRESS = "0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f";

// Environment-specific getters
export function getAddressesForEnvironment(env: 'localhost' | 'testnet' | 'mainnet'): ContractAddresses | undefined {
  return environmentAddresses[env];
}

export function getCurrentEnvironmentAddresses(): ContractAddresses {
  return contractAddresses;
}

export default contractAddresses;
