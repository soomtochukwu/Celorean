// @ts-ignore
import { ethers, upgrades, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

// Environment configuration
interface EnvironmentConfig {
  name: string;
  requiresVerification: boolean;
  confirmationBlocks: number;
  gasLimit?: number;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

const ENVIRONMENT_CONFIGS: Record<string, EnvironmentConfig> = {
  localhost: {
    name: "localhost",
    requiresVerification: false,
    confirmationBlocks: 1,
    gasLimit: 8000000
  },
  hardhat: {
    name: "hardhat",
    requiresVerification: false,
    confirmationBlocks: 1,
    gasLimit: 8000000
  },
  testnet: {
    name: "testnet",
    requiresVerification: true,
    confirmationBlocks: 6,
    gasLimit: 5000000
  },
  "celo-alfajores": {
    name: "celo-alfajores",
    requiresVerification: true,
    confirmationBlocks: 6,
    gasLimit: 5000000
  },
  mainnet: {
    name: "mainnet",
    requiresVerification: true,
    confirmationBlocks: 12,
    gasLimit: 3000000
  },
  "celo-mainnet": {
    name: "celo-mainnet",
    requiresVerification: true,
    confirmationBlocks: 12,
    gasLimit: 3000000
  }
};

// Environment validation function
function validateEnvironment(networkName: string): EnvironmentConfig {
  const config = ENVIRONMENT_CONFIGS[networkName];
  if (!config) {
    console.error(`❌ Unsupported network: ${networkName}`);
    console.error(`Supported networks: ${Object.keys(ENVIRONMENT_CONFIGS).join(", ")}`);
    process.exit(1);
  }
  return config;
}

// Network-specific validation
function validateNetworkRequirements(config: EnvironmentConfig, deployer: any) {
  console.log(`🔍 Validating requirements for ${config.name} environment...`);
  
  if (config.name === "mainnet" || config.name === "celo-mainnet") {
    console.log("⚠️  MAINNET UPGRADE DETECTED!");
    console.log("Please ensure you have:");
    console.log("- Thoroughly tested the upgrade on testnet");
    console.log("- Verified the new implementation contract");
    console.log("- Proper security audits for the upgrade");
    console.log("- Backup and rollback procedures in place");
    console.log("- Sufficient funds for upgrade transaction");
  }
  
  if (config.requiresVerification && !process.env.ETHERSCAN_API_KEY && !process.env.CELOSCAN_API_KEY) {
    console.warn("⚠️  No API key found for contract verification");
    console.warn("Set ETHERSCAN_API_KEY or CELOSCAN_API_KEY in your .env file");
  }
}

// Helper function for consistent timestamp formatting
function formatTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
}

// Import existing addresses dynamically based on current network
let contractAddresses: any = null;
try {
  const addressesPath = path.join(
    __dirname,
    `../addresses/${network.name}-addresses.ts`
  );
  if (fs.existsSync(addressesPath)) {
    contractAddresses = require(addressesPath).contractAddresses;
    console.log(`Loaded addresses for network: ${network.name}`);
  } else {
    console.log(`No addresses file found for network: ${network.name}`);
    console.log(`Expected file: ${addressesPath}`);
  }
} catch (error) {
  console.log(
    `Warning: Could not load existing addresses for ${network.name}, will check for deployment`
  );
  contractAddresses = null;
}

// Import verify function with proper typing
const { verify } = require("../utils/verify.js");

async function upgradeContract() {
  const [deployer] = await ethers.getSigners();
  
  // Validate environment and get configuration
  const envConfig = validateEnvironment(network.name);
  
  console.log("=".repeat(60));
  console.log(`🔄 CELOREAN UPGRADE - ${envConfig.name.toUpperCase()} ENVIRONMENT`);
  console.log("=".repeat(60));
  console.log("Upgrading contracts with the account:", deployer.address);
  console.log("Network:", network.name);
  console.log("Environment:", envConfig.name);
  
  // Validate network requirements
  validateNetworkRequirements(envConfig, deployer);
  
  // Check deployer balance
  const balance = await deployer.provider!.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("❌ Deployer account has no funds!");
    process.exit(1);
  }
  
  console.log("");

  // Check if we have existing addresses
  if (!contractAddresses) {
    console.error(
      `❌ No existing contract addresses found for network: ${network.name}!`
    );
    console.error("Please deploy the contract first using the deploy script.");
    console.error(
      `Expected file: ${network.name}-addresses.ts in the addresses directory`
    );
    process.exit(1);
  }

  // Get the existing proxy address
  const proxyAddress = contractAddresses.proxyAddress;
  
  // Enhanced Pre-Upgrade Logging
  console.log("📋 PRE-UPGRADE CONTRACT STATUS");
  console.log("=".repeat(50));
  console.log(`🏠 Existing Proxy Address:        ${proxyAddress}`);
  console.log(`🔧 Current Implementation:        ${contractAddresses.implementationAddress}`);
  console.log(`👤 Upgrading Account:             ${deployer.address}`);
  console.log(`🌐 Network:                       ${network.name}`);
  console.log(`🏷️  Environment:                   ${envConfig.name}`);
  console.log("=".repeat(50));
  console.log("");

  // Get the new contract factory
  const CeloreanV2 = await ethers.getContractFactory("Celorean");

  console.log("Upgrading Celorean proxy to new implementation...");

  // Upgrade the proxy to the new implementation
  const upgraded = await upgrades.upgradeProxy(proxyAddress, CeloreanV2);
  await upgraded.waitForDeployment();

  console.log("✅ Celorean Proxy upgraded successfully!");
  console.log("");

  // Get the new implementation address
  const newImplementationAddress =
    await upgrades.erc1967.getImplementationAddress(proxyAddress);
  
  // Enhanced Post-Upgrade Logging
  console.log("📋 POST-UPGRADE CONTRACT STATUS");
  console.log("=".repeat(50));
  console.log(`🏠 Proxy Address (unchanged):     ${proxyAddress}`);
  console.log(`🔧 Previous Implementation:       ${contractAddresses.implementationAddress}`);
  console.log(`🆕 New Implementation:            ${newImplementationAddress}`);
  console.log(`👤 Upgrader Account:              ${deployer.address}`);
  console.log("=".repeat(50));
  console.log("");

  // Update contract addresses with environment support
  const upgradeTime = new Date();
  const updatedContractAddresses = {
    proxyAddress: proxyAddress,
    implementationAddress: newImplementationAddress,
    network: network.name,
    environment: envConfig.name,
    deployedAt: contractAddresses.deployedAt,
    deployedAtFormatted: contractAddresses.deployedAtFormatted || formatTimestamp(new Date(contractAddresses.deployedAt)),
    deployer: deployer.address,
    previousImplementation: contractAddresses.implementationAddress,
    upgradedAt: upgradeTime.toISOString(),
    upgradedAtFormatted: formatTimestamp(upgradeTime),
    gasUsed: upgraded.deploymentTransaction()?.gasLimit?.toString() || "N/A",
    blockNumber: upgraded.deploymentTransaction()?.blockNumber || 0,
  };

  // Create the addresses directory if it doesn't exist
  const addressesDir = path.join(__dirname, "../addresses");
  if (!fs.existsSync(addressesDir)) {
    fs.mkdirSync(addressesDir, { recursive: true });
  }

  // Generate updated TypeScript file content with environment support
  const tsContent = `// Auto-generated file - Do not edit manually
// Generated on: ${formatTimestamp(new Date())}
// Network: ${network.name}
// Environment: ${envConfig.name}
// Deployment Type: Upgrade
// Upgraded from: ${contractAddresses.implementationAddress}

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
  proxyAddress: "${proxyAddress}",
  implementationAddress: "${newImplementationAddress}",
  network: "${network.name}",
  environment: "${envConfig.name}",
  deployedAt: "${contractAddresses.deployedAt}",
  deployedAtFormatted: "${updatedContractAddresses.deployedAtFormatted}",
  deployer: "${deployer.address}",
  previousImplementation: "${contractAddresses.implementationAddress}",
  upgradedAt: "${updatedContractAddresses.upgradedAt}",
  upgradedAtFormatted: "${updatedContractAddresses.upgradedAtFormatted}",
  gasUsed: "${updatedContractAddresses.gasUsed}",
  blockNumber: ${updatedContractAddresses.blockNumber}
};

// Environment-specific addresses (will be populated as deployments occur)
export const environmentAddresses: EnvironmentAddresses = {
  ${envConfig.name === 'localhost' || envConfig.name === 'hardhat' ? 'localhost' : envConfig.name === 'testnet' || envConfig.name === 'celo-alfajores' ? 'testnet' : 'mainnet'}: contractAddresses
};

// Export individual addresses for convenience
export const CELOREAN_PROXY_ADDRESS = "${proxyAddress}";
export const CELOREAN_IMPLEMENTATION_ADDRESS = "${newImplementationAddress}";

// Environment-specific getters
export function getAddressesForEnvironment(env: 'localhost' | 'testnet' | 'mainnet'): ContractAddresses | undefined {
  return environmentAddresses[env];
}

export function getCurrentEnvironmentAddresses(): ContractAddresses {
  return contractAddresses;
}

export default contractAddresses;
`;

  // Write to TypeScript file
  const tsFilePath = path.join(addressesDir, `${network.name}-addresses.ts`);
  fs.writeFileSync(tsFilePath, tsContent);

  // Also save as JSON for backup
  const jsonFilePath = path.join(
    addressesDir,
    `${network.name}-addresses.json`
  );
  fs.writeFileSync(
    jsonFilePath,
    JSON.stringify(updatedContractAddresses, null, 2)
  );

  // Copy the TypeScript file to frontend contracts directory if it exists
  const frontendContractsDir = path.join(__dirname, "../../frontend/contracts");
  let frontendTsPath = "";
  if (fs.existsSync(frontendContractsDir)) {
    frontendTsPath = path.join(frontendContractsDir, "addresses.ts");
    fs.copyFileSync(tsFilePath, frontendTsPath);
  }

  // Enhanced File Saving Logging
  console.log("💾 UPDATED CONTRACT ADDRESSES SAVED");
  console.log("=".repeat(50));
  console.log(`📄 TypeScript File:               ${tsFilePath}`);
  console.log(`📄 JSON Backup File:              ${jsonFilePath}`);
  if (frontendTsPath) {
    console.log(`📄 Frontend Copy:                 ${frontendTsPath}`);
  }
  console.log("=".repeat(50));
  console.log("");

  console.log("");

  // Verify the new implementation contract based on environment configuration
  if (envConfig.requiresVerification) {
    console.log(`Waiting for ${envConfig.confirmationBlocks} block confirmations...`);
    await upgraded.deploymentTransaction()?.wait(envConfig.confirmationBlocks);

    console.log("Verifying new implementation contract...");
    try {
      await verify(
        newImplementationAddress,
        [],
        "contracts/Celorean.sol:Celorean"
      );
      console.log("✅ Contract verification successful!");
    } catch (error) {
      if (error instanceof Error) {
        console.log("⚠️  Verification failed:", error.message);
      } else {
        console.log("⚠️  Verification failed:", String(error));
      }
      console.log("You can verify manually later using:");
      console.log(`npx hardhat verify --network ${network.name} ${newImplementationAddress}`);
    }
  } else {
    console.log(`Skipping verification on ${envConfig.name} environment`);
  }

  console.log("");
  console.log("=".repeat(70));
  console.log("🎉 CELOREAN UPGRADE COMPLETED SUCCESSFULLY! 🎉");
  console.log("=".repeat(70));
  console.log("");
  console.log("📋 FINAL UPGRADE SUMMARY:");
  console.log("─".repeat(50));
  console.log(`🏷️  Environment:                   ${envConfig.name}`);
  console.log(`🌐 Network:                       ${network.name}`);
  console.log(`📅 Upgraded At:                   ${formatTimestamp(new Date())}`);
  console.log("");
  console.log("📍 CONTRACT ADDRESSES:");
  console.log(`🏠 Proxy Contract (unchanged):    ${proxyAddress}`);
  console.log(`🔧 Previous Implementation:       ${contractAddresses.implementationAddress}`);
  console.log(`🆕 New Implementation:            ${newImplementationAddress}`);
  console.log(`👤 Upgrading Account:             ${deployer.address}`);
  console.log("");
  console.log("⛽ TRANSACTION DETAILS:");
  console.log(`💨 Gas Used:                      ${updatedContractAddresses.gasUsed}`);
  console.log(`🧱 Block Number:                  ${updatedContractAddresses.blockNumber}`);
  console.log(`⏰ Upgrade Timestamp:             ${formatTimestamp(new Date(updatedContractAddresses.upgradedAt))}`);
  console.log("");
  console.log("📝 IMPORTANT NOTES:");
  console.log("   • The proxy contract now uses the new implementation");
  console.log("   • Proxy address remains unchanged for frontend integration");
  console.log("   • Previous implementation is preserved for reference");
  console.log("   • All existing contract state is preserved");
  console.log("=".repeat(70));
}

upgradeContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
