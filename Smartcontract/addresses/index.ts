// Auto-generated unified addresses file - Do not edit manually
// This file consolidates all environment-specific contract addresses
// Generated on: 2025-01-15T00:00:00.000Z

export interface ContractAddresses {
  proxyAddress: string;
  implementationAddress: string;
  network: string;
  environment: string;
  deployedAt: string;
  deployer: string;
  gasUsed?: string;
  blockNumber?: number;
  upgradedAt?: string;
  previousImplementation?: string;
}

export interface EnvironmentAddresses {
  localhost?: ContractAddresses;
  testnet?: ContractAddresses;
  mainnet?: ContractAddresses;
}

// Environment-specific contract addresses
export const environmentAddresses: EnvironmentAddresses = {
  // Localhost/Development addresses
  localhost: {
    proxyAddress: "0xB581C9264f59BF0289fA76D61B2D0746dCE3C30D",
    implementationAddress: "0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f",
    network: "localhost",
    environment: "localhost",
    deployedAt: "2025-07-19T15:50:11.128Z",
    deployer: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
  },
  
  // Testnet (Celo Alfajores) addresses
  testnet: {
    proxyAddress: "0x8CB97c5eD4Dae06c9452ebCcef157718804DeA15",
    implementationAddress: "0xEf51b7B34F843348C726C912FeDa16802072090D",
    network: "celo-alfajores",
    environment: "testnet",
    deployedAt: "2025-07-18T18:28:49.311Z",
    deployer: "0x8a371e00cd51E2BE005B86EF73C5Ee9Ef6d23FeB"
  }
  
  // Mainnet addresses will be populated when deployed
  // mainnet: {
  //   proxyAddress: "",
  //   implementationAddress: "",
  //   network: "celo-mainnet",
  //   environment: "mainnet",
  //   deployedAt: "",
  //   deployer: ""
  // }
};

// Environment-specific getters
export function getAddressesForEnvironment(env: 'localhost' | 'testnet' | 'mainnet'): ContractAddresses | undefined {
  return environmentAddresses[env];
}

export function getLocalhostAddresses(): ContractAddresses | undefined {
  return environmentAddresses.localhost;
}

export function getTestnetAddresses(): ContractAddresses | undefined {
  return environmentAddresses.testnet;
}

export function getMainnetAddresses(): ContractAddresses | undefined {
  return environmentAddresses.mainnet;
}

// Convenience exports for current active environment
// These will be updated by deployment scripts
export const CURRENT_ENVIRONMENT = 'localhost'; // This will be dynamically set
export const currentAddresses = getAddressesForEnvironment(CURRENT_ENVIRONMENT as any);

// Individual address exports for backward compatibility
export const CELOREAN_PROXY_ADDRESS = currentAddresses?.proxyAddress || "";
export const CELOREAN_IMPLEMENTATION_ADDRESS = currentAddresses?.implementationAddress || "";

// Legacy exports for backward compatibility
export const contractAddresses = currentAddresses;

export default {
  environmentAddresses,
  getAddressesForEnvironment,
  getLocalhostAddresses,
  getTestnetAddresses,
  getMainnetAddresses,
  CELOREAN_PROXY_ADDRESS,
  CELOREAN_IMPLEMENTATION_ADDRESS,
  contractAddresses
};