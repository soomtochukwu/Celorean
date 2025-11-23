// Auto-generated file - Do not edit manually
// Generated on: 2025-11-22 19:12:19 UTC
// Network: celoSepolia
// Environment: celoSepolia
// Deployment Type: Upgrade
// Upgraded from: 0xd0347de9B754381394A47c1b0E12084DD73bC794

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
  proxyAddress: "0x7b9F4dffd02aB01453e5A886720Cd30b5c50d122",
  implementationAddress: "0xC04e91c00855E2D6efDA205829B0416943BEb61e",
  network: "celoSepolia",
  environment: "celoSepolia",
  deployedAt: "2025-11-22T17:54:08.505Z",
  deployedAtFormatted: "2025-11-22 17:54:08 UTC",
  deployer: "0x8a371e00cd51E2BE005B86EF73C5Ee9Ef6d23FeB",
  previousImplementation: "0xd0347de9B754381394A47c1b0E12084DD73bC794",
  upgradedAt: "2025-11-22T19:12:19.608Z",
  upgradedAtFormatted: "2025-11-22 19:12:19 UTC",
  gasUsed: "38204",
  blockNumber: 10554750
};

// Environment-specific addresses (will be populated as deployments occur)
export const environmentAddresses: EnvironmentAddresses = {
  mainnet: contractAddresses
};

// Export individual addresses for convenience
export const CELOREAN_PROXY_ADDRESS = "0x7b9F4dffd02aB01453e5A886720Cd30b5c50d122";
export const CELOREAN_IMPLEMENTATION_ADDRESS = "0xC04e91c00855E2D6efDA205829B0416943BEb61e";

// Environment-specific getters
export function getAddressesForEnvironment(env: 'localhost' | 'testnet' | 'mainnet'): ContractAddresses | undefined {
  return environmentAddresses[env];
}

export function getCurrentEnvironmentAddresses(): ContractAddresses {
  return contractAddresses;
}

export default contractAddresses;
