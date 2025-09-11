// @ts-ignore
const hre = require("hardhat");
// @ts-ignore
const { verify } = require("../utils/verify.js");
// @ts-ignore
const fs = require("fs");
// @ts-ignore
const path = require("path");
require("dotenv").config();

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
    gasLimit: 8000000,
  },
  hardhat: {
    name: "hardhat",
    requiresVerification: false,
    confirmationBlocks: 1,
    gasLimit: 8000000,
  },
  testnet: {
    name: "testnet",
    requiresVerification: true,
    confirmationBlocks: 6,
    gasLimit: 5000000,
  },
  "celo-alfajores": {
    name: "celo-alfajores",
    requiresVerification: true,
    confirmationBlocks: 6,
    gasLimit: 5000000,
  },
  mainnet: {
    name: "mainnet",
    requiresVerification: true,
    confirmationBlocks: 12,
    gasLimit: 3000000,
  },
  "celo-mainnet": {
    name: "celo-mainnet",
    requiresVerification: true,
    confirmationBlocks: 12,
    gasLimit: 3000000,
  },
};

// Environment validation function
function validateEnvironment(networkName: string): EnvironmentConfig {
  const config = ENVIRONMENT_CONFIGS[networkName];
  if (!config) {
    console.error(`❌ Unsupported network: ${networkName}`);
    console.error(
      `Supported networks: ${Object.keys(ENVIRONMENT_CONFIGS).join(", ")}`
    );
    process.exit(1);
  }
  return config;
}

// Network-specific validation
function validateNetworkRequirements(config: EnvironmentConfig, deployer: any) {
  console.log(`🔍 Validating requirements for ${config.name} environment...`);

  if (config.name === "mainnet" || config.name === "celo-mainnet") {
    console.log("⚠️  MAINNET DEPLOYMENT DETECTED!");
    console.log("Please ensure you have:");
    console.log("- Sufficient funds for deployment");
    console.log("- Verified contract code");
    console.log("- Proper security audits completed");
    console.log("- Backup and recovery procedures in place");
  }

  if (
    config.requiresVerification &&
    !process.env.ETHERSCAN_API_KEY &&
    !process.env.CELOSCAN_API_KEY
  ) {
    console.warn("⚠️  No API key found for contract verification");
    console.warn("Set ETHERSCAN_API_KEY or CELOSCAN_API_KEY in your .env file");
  }
}

// Helper function for consistent timestamp formatting
function formatTimestamp(date: Date): string {
  return date
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d{3}Z$/, " UTC");
}

// Helper function to get implementation address with retry logic
async function getImplementationAddressWithRetry(
  proxyAddress: string,
  maxRetries: number = 5,
  delay: number = 2000
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(
        `Attempting to get implementation address (attempt ${i + 1}/${maxRetries})...`
      );
      const implementationAddress =
        await hre.upgrades.erc1967.getImplementationAddress(proxyAddress);
      console.log("Implementation address:", implementationAddress);
      return implementationAddress;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log(`Attempt ${i + 1} failed:`, errorMessage);
      if (i === maxRetries - 1) {
        console.log("All attempts failed. Trying alternative method...");
        // Alternative method: try to get it from the proxy admin
        try {
          const proxyContract = await hre.ethers.getContractAt(
            "ERC1967Proxy",
            proxyAddress
          );
          // This might not work for all cases, but worth trying
          console.log("Using proxy contract directly...");
          return "IMPLEMENTATION_ADDRESS_NOT_AVAILABLE";
        } catch (altError: unknown) {
          const altErrorMessage =
            altError instanceof Error ? altError.message : String(altError);
          console.log("Alternative method also failed:", altErrorMessage);
          return "IMPLEMENTATION_ADDRESS_NOT_AVAILABLE";
        }
      }
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return "IMPLEMENTATION_ADDRESS_NOT_AVAILABLE";
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Validate environment and get configuration
  const envConfig = validateEnvironment(hre.network.name);

  console.log("=".repeat(60));
  console.log(
    `🚀 CELOREAN DEPLOYMENT - ${envConfig.name.toUpperCase()} ENVIRONMENT`
  );
  console.log("=".repeat(60));
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("Environment:", envConfig.name);

  // Validate network requirements
  validateNetworkRequirements(envConfig, deployer);

  // Check deployer balance
  const balance = await deployer.provider!.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("❌ Deployer account has no funds!");
    process.exit(1);
  }

  console.log("");

  // Deploy Celorean as upgradeable proxy
  const Celorean = await hre.ethers.getContractFactory("Celorean");

  console.log("Deploying Celorean proxy...");
  const celorean = await hre.upgrades.deployProxy(
    Celorean,
    ["Celorean", "CEN", deployer.address],
    {
      initializer: "initialize",
    }
  );

  await celorean.waitForDeployment();
  const proxyAddress = await celorean.getAddress();

  console.log("✅ Celorean Proxy Contract Deployed Successfully!");
  console.log("");

  // Enhanced Contract Address Logging
  console.log("📋 CONTRACT DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log(`🏠 Proxy Contract Address:        ${proxyAddress}`);
  console.log(`👤 Deploying Account Address:     ${deployer.address}`);
  console.log(`🌐 Network:                       ${hre.network.name}`);
  console.log(`🏷️  Environment:                   ${envConfig.name}`);
  console.log("=".repeat(50));
  console.log("");

  // Wait a bit for the proxy to be fully initialized
  console.log("Waiting for proxy initialization...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Get implementation address with retry logic
  console.log("🔍 Retrieving implementation contract address...");
  const implementationAddress =
    await getImplementationAddressWithRetry(proxyAddress);

  // Enhanced Implementation Address Logging
  console.log("\uD83D\uDCCB IMPLEMENTATION CONTRACT DETAILS");
  console.log("=".repeat(50));
  console.log(
    `\uD83D\uDD27 Implementation Address:        ${implementationAddress}`
  );
  console.log(`\uD83D\uDD17 Proxy Address:                 ${proxyAddress}`);
  console.log(
    `\uD83D\uDC64 Deployer Address:              ${deployer.address}`
  );
  console.log("=".repeat(50));
  console.log("");

  // =============================
  // DEV-ONLY SEEDING (localhost/hardhat)
  // =============================
  const isDevEnv =
    envConfig.name === "localhost" || envConfig.name === "hardhat";
  if (isDevEnv) {
    console.log("\uD83D\uDEE0\uFE0F Seeding mock data (DEV mode)...");
    try {
      // Ensure deployer is a lecturer
      const txLecturer = await celorean.employLecturer(deployer.address, 100);
      await txLecturer.wait();
      console.log(`\u2705 Deployer employed as lecturer: ${deployer.address}`);

      // Prepare mock courses
      const mockCourses: Array<{
        title: string;
        duration: number;
        description: string;
        priceEth: string;
        tags: string[];
        level: string;
        metadataUri: string;
      }> = [
        {
          title: "Solidity Basics",
          duration: 4,
          description:
            "Learn the fundamentals of Solidity and smart contracts.",
          priceEth: "0.001",
          tags: ["solidity", "ethereum", "smart-contracts"],
          level: "Beginner",
          metadataUri:
            "https://files.risein.com/courses/blockchain-basics/jL3T-Blockchain%20Basics.png",
        },
        {
          title: "Advanced DApp Development",
          duration: 6,
          description: "Build production-ready decentralized applications.",
          priceEth: "0.002",
          tags: ["dapp", "frontend", "hardhat"],
          level: "Intermediate",
          metadataUri:
            "https://static.alchemyapi.io/images/assets/w3u-banner-3.png",
        },
        {
          title: "DeFi Protocol Design",
          duration: 8,
          description: "Design and reason about core DeFi mechanisms.",
          priceEth: "0.003",
          tags: ["defi", "tokenomics", "security"],
          level: "Advanced",
          metadataUri:
            "https://d3f1iyfxxz8i1e.cloudfront.net/courses/course_image/62207c99c700.jpg",
        },
      ];

      const beforeCount = await celorean.courseCount();
      console.log(
        `\u2139\uFE0F Course count before seeding: ${beforeCount.toString()}`
      );

      const createdIds: string[] = [];
      for (const c of mockCourses) {
        const tx = await celorean.createCourse(
          c.title,
          c.duration,
          c.description,
          hre.ethers.parseEther(c.priceEth),
          c.tags,
          c.level,
          c.metadataUri
        );
        const receipt = await tx.wait();
        // Attempt to derive courseId from event or by reading latest count
        const afterCount = await celorean.courseCount();
        createdIds.push(afterCount.toString());
        console.log(
          `\u2705 Seeded course: ${c.title} (courseId ~ ${afterCount.toString()})`
        );
      }

      const finalCount = await celorean.courseCount();
      console.log(
        `\u2139\uFE0F Course count after seeding:  ${finalCount.toString()}`
      );
      console.log(`\uD83D\uDCDA Seeded course IDs: [${createdIds.join(", ")}]`);
    } catch (seedErr) {
      console.warn("\u26A0\uFE0F Seeding failed (non-fatal in dev):", seedErr);
    }
    console.log("");
  } else {
    console.log("\u23ED\uFE0F Skipping seeding: not a dev environment.");
  }

  // Save contract addresses to TypeScript file with environment support
  const deploymentTime = new Date();
  const contractAddresses = {
    proxyAddress: proxyAddress,
    implementationAddress: implementationAddress,
    network: hre.network.name,
    environment: envConfig.name,
    deployedAt: deploymentTime.toISOString(),
    deployedAtFormatted: formatTimestamp(deploymentTime),
    deployer: deployer.address,
    gasUsed: celorean.deploymentTransaction()?.gasLimit?.toString() || "N/A",
    blockNumber: celorean.deploymentTransaction()?.blockNumber || 0,
  };

  // Create the addresses directory if it doesn't exist
  const addressesDir = path.join(__dirname, "../addresses");
  if (!fs.existsSync(addressesDir)) {
    fs.mkdirSync(addressesDir, { recursive: true });
  }

  // Generate TypeScript file content with environment support
  const tsContent = `// Auto-generated file - Do not edit manually
// Generated on: ${formatTimestamp(new Date())}
// Network: ${hre.network.name}
// Environment: ${envConfig.name}
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
  proxyAddress: "${proxyAddress}",
  implementationAddress: "${implementationAddress}",
  network: "${hre.network.name}",
  environment: "${envConfig.name}",
  deployedAt: "${contractAddresses.deployedAt}",
  deployedAtFormatted: "${contractAddresses.deployedAtFormatted}",
  deployer: "${deployer.address}",
  gasUsed: "${contractAddresses.gasUsed}",
  blockNumber: ${contractAddresses.blockNumber}
};

// Environment-specific addresses (will be populated as deployments occur)
export const environmentAddresses: EnvironmentAddresses = {
  ${envConfig.name === "localhost" || envConfig.name === "hardhat" ? "localhost" : envConfig.name === "testnet" || envConfig.name === "celo-alfajores" ? "testnet" : "mainnet"}: contractAddresses
};

// Export individual addresses for convenience
export const CELOREAN_PROXY_ADDRESS = "${proxyAddress}";
export const CELOREAN_IMPLEMENTATION_ADDRESS = "${implementationAddress}";

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
  const tsFilePath = path.join(
    addressesDir,
    `${hre.network.name}-addresses.ts`
  );
  fs.writeFileSync(tsFilePath, tsContent);

  // Also save as JSON for backup
  const jsonFilePath = path.join(
    addressesDir,
    `${hre.network.name}-addresses.json`
  );
  fs.writeFileSync(jsonFilePath, JSON.stringify(contractAddresses, null, 2));

  // Copy the TypeScript file to frontend contracts directory if it exists
  const frontendContractsDir = path.join(__dirname, "../../frontend/contracts");
  let frontendTsPath = "";
  if (fs.existsSync(frontendContractsDir)) {
    frontendTsPath = path.join(frontendContractsDir, "addresses.ts");
    fs.copyFileSync(tsFilePath, frontendTsPath);
  }

  // Enhanced File Saving Logging
  console.log("💾 CONTRACT ADDRESSES SAVED");
  console.log("=".repeat(50));
  console.log(`📄 TypeScript File:               ${tsFilePath}`);
  console.log(`📄 JSON Backup File:              ${jsonFilePath}`);
  if (frontendTsPath) {
    console.log(`📄 Frontend Copy:                 ${frontendTsPath}`);
  }
  console.log("=".repeat(50));
  console.log("");

  console.log("");

  // Verify contracts based on environment configuration
  if (envConfig.requiresVerification) {
    console.log(
      `Waiting for ${envConfig.confirmationBlocks} block confirmations...`
    );
    await celorean.deploymentTransaction()?.wait(envConfig.confirmationBlocks);

    if (implementationAddress !== "IMPLEMENTATION_ADDRESS_NOT_AVAILABLE") {
      console.log("Verifying implementation contract...");
      try {
        await verify(
          implementationAddress,
          [],
          "contracts/Celorean.sol:Celorean"
        );
        console.log("✅ Contract verification successful!");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log("⚠️  Verification failed:", errorMessage);
        console.log("You can verify manually later using:");
        console.log(
          `npx hardhat verify --network ${hre.network.name} ${implementationAddress}`
        );
      }
    } else {
      console.log(
        "Skipping verification - implementation address not available"
      );
    }
  } else {
    console.log(`Skipping verification on ${envConfig.name} environment`);
  }
  console.log("");

  // Test the deployed contract
  console.log("🧪 Testing deployed contract...");
  try {
    const celoreanInstance = await hre.ethers.getContractAt(
      "Celorean",
      proxyAddress,
      deployer
    );

    const version = await celoreanInstance.version();
    console.log("Contract version:", version);

    const owner = await celoreanInstance.owner();
    console.log("Contract owner:", owner);

    console.log("");
    console.log("=".repeat(70));
    console.log("🎉 CELOREAN DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉");
    console.log("=".repeat(70));
    console.log("");
    console.log("📋 FINAL DEPLOYMENT SUMMARY:");
    console.log("─".repeat(50));
    console.log(`🏷️  Environment:                   ${envConfig.name}`);
    console.log(`🌐 Network:                       ${hre.network.name}`);
    console.log(
      `📅 Deployed At:                   ${formatTimestamp(new Date())}`
    );
    console.log("");
    console.log("📍 CONTRACT ADDRESSES:");
    console.log(`🏠 Proxy Contract:                ${proxyAddress}`);
    console.log(`🔧 Implementation Contract:       ${implementationAddress}`);
    console.log(`👤 Deploying Account:             ${deployer.address}`);
    console.log("");
    console.log("⛽ TRANSACTION DETAILS:");
    console.log(
      `💨 Gas Used:                      ${contractAddresses.gasUsed}`
    );
    console.log(
      `🧱 Block Number:                  ${contractAddresses.blockNumber}`
    );
    console.log("");
    console.log("📝 IMPORTANT NOTES:");
    console.log("   • Save these addresses for frontend integration");
    console.log("   • Use the proxy address for all contract interactions");
    console.log("   • Implementation address is for verification purposes");
    console.log("=".repeat(70));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("⚠️  Contract testing failed:", errorMessage);
    console.log("But deployment was successful!");
    console.log("");
    console.log("=".repeat(70));
    console.log("🎉 CELOREAN DEPLOYMENT COMPLETED (with testing issues) 🎉");
    console.log("=".repeat(70));
    console.log("");
    console.log("📋 FINAL DEPLOYMENT SUMMARY:");
    console.log("─".repeat(50));
    console.log(`🏷️  Environment:                   ${envConfig.name}`);
    console.log(`🌐 Network:                       ${hre.network.name}`);
    console.log(
      `📅 Deployed At:                   ${formatTimestamp(new Date())}`
    );
    console.log("");
    console.log("📍 CONTRACT ADDRESSES:");
    console.log(`🏠 Proxy Contract:                ${proxyAddress}`);
    console.log(`🔧 Implementation Contract:       ${implementationAddress}`);
    console.log(`👤 Deploying Account:             ${deployer.address}`);
    console.log("");
    console.log("⚠️  NOTE: Contract testing failed but deployment succeeded");
    console.log("📝 IMPORTANT NOTES:");
    console.log("   • Save these addresses for frontend integration");
    console.log("   • Use the proxy address for all contract interactions");
    console.log("   • Implementation address is for verification purposes");
    console.log("=".repeat(70));
  }
}

main().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(errorMessage);
  process.exitCode = 1;
});
