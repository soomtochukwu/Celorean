// Auto-generated file - Do not edit manually
// Generated on: 2025-09-04 11:04:20 UTC
// Network: localhost
// Environment: localhost
// Deployment Type: Upgrade
// Upgraded from: 0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f

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
  proxyAddress: "0x5095d3313C76E8d29163e40a0223A5816a8037D8",
  implementationAddress: "0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f",
  network: "localhost",
  environment: "localhost",
  deployedAt: "2025-09-04T11:03:17.705Z",
  deployedAtFormatted: "2025-09-04 11:03:17 UTC",
  deployer: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
  previousImplementation: "0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f",
  upgradedAt: "2025-09-04T11:04:20.951Z",
  upgradedAtFormatted: "2025-09-04 11:04:20 UTC",
  gasUsed: "N/A",
  blockNumber: 0
};

// Environment-specific addresses (will be populated as deployments occur)
export const environmentAddresses: EnvironmentAddresses = {
  localhost: {
    proxyAddress: "0x5095d3313C76E8d29163e40a0223A5816a8037D8",
    implementationAddress: "0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f",
    network: "localhost",
    environment: "localhost",
    deployedAt: "2025-09-04T11:03:17.705Z",
    deployedAtFormatted: "2025-09-04 11:03:17 UTC",
    deployer: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    previousImplementation: "0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f",
    upgradedAt: "2025-09-04T11:04:20.951Z",
    upgradedAtFormatted: "2025-09-04 11:04:20 UTC",
    gasUsed: "N/A",
    blockNumber: 0
  },
  testnet: {
    proxyAddress: "0x8CB97c5eD4Dae06c9452ebCcef157718804DeA15",
    implementationAddress: "0xEf51b7B34F843348C726C912FeDa16802072090D",
    network: "celo-alfajores",
    environment: "testnet",
    deployedAt: "2025-07-18T18:28:49.311Z",
    deployer: "0x8a371e00cd51E2BE005B86EF73C5Ee9Ef6d23FeB",
    gasUsed: "N/A",
    blockNumber: 0
  }
};

// Export individual addresses for convenience
export const CELOREAN_PROXY_ADDRESS = "0x5095d3313C76E8d29163e40a0223A5816a8037D8";
export const CELOREAN_IMPLEMENTATION_ADDRESS = "0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f";

// Environment-specific getters
export function getAddressesForEnvironment(env: 'localhost' | 'testnet' | 'mainnet'): ContractAddresses | undefined {
  return environmentAddresses[env];
}

export function getCurrentEnvironmentAddresses(): ContractAddresses {
  return contractAddresses;
}

export default contractAddresses;
