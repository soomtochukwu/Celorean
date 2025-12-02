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
    confirmationBlocks: 2,
    gasLimit: 5000000,
  },
  celoSepolia: {
    name: "celoSepolia",
    requiresVerification: true,
    confirmationBlocks: 2,
    gasLimit: 5000000,
  },
  mainnet: {
    name: "mainnet",
    requiresVerification: true,
    confirmationBlocks: 5,
    gasLimit: 3000000,
  },
  celo: {
    name: "celo",
    requiresVerification: true,
    confirmationBlocks: 5,
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
    .substring(0, 19)
    .replace(/ /g, "_");
}

// Helper function to wait for transactions with timeout and retry
async function waitForTransactionWithRetry(
  tx: any,
  confirmations: number = 1,
  timeoutMs: number = 120000, // 2 minutes default
  retries: number = 3
): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`⏳ Waiting for transaction confirmation (attempt ${attempt}/${retries})...`);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction confirmation timeout')), timeoutMs);
      });
      
      // Race between transaction wait and timeout
      const receipt = await Promise.race([
        tx.wait(confirmations),
        timeoutPromise
      ]);
      
      console.log(`✅ Transaction confirmed!`);
      return receipt;
    } catch (error: any) {
      if (attempt === retries) {
        console.warn(`⚠️  Transaction wait failed after ${retries} attempts:`, error.message);
        console.warn(`Transaction may still be pending. Check explorer for status.`);
        throw error;
      }
      console.warn(`⚠️  Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before retry
    }
  }
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

  // Deploy CertificateNFT
  const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
  console.log("Deploying CertificateNFT...");
  const certificateNft = await CertificateNFT.deploy("Celorean Certificates", "CLRN-CERT");
  await certificateNft.waitForDeployment();
  const certificateNftAddress = await certificateNft.getAddress();
  console.log(`✅ CertificateNFT Deployed: ${certificateNftAddress}`);

  // Deploy EventManager
  const EventManager = await hre.ethers.getContractFactory("EventManager");
  console.log("Deploying EventManager...");
  const eventManager = await EventManager.deploy();
  await eventManager.waitForDeployment();
  const eventManagerAddress = await eventManager.getAddress();
  console.log(`✅ EventManager Deployed: ${eventManagerAddress}`);

  // Deploy VerifierRegistry
  const VerifierRegistry = await hre.ethers.getContractFactory("VerifierRegistry");
  console.log("Deploying VerifierRegistry...");
  const verifierRegistry = await VerifierRegistry.deploy();
  await verifierRegistry.waitForDeployment();
  const verifierRegistryAddress = await verifierRegistry.getAddress();
  console.log(`✅ VerifierRegistry Deployed: ${verifierRegistryAddress}`);

  // Wire relationships with retry logic
  console.log("Configuring contract relationships...");
  
  try {
    const txSetCertInCelorean = await celorean.setCertificateNFT(certificateNftAddress);
    await waitForTransactionWithRetry(txSetCertInCelorean, envConfig.confirmationBlocks);
  } catch (error: any) {
    console.warn("⚠️  Failed to set CertificateNFT in Celorean:", error.message);
    console.warn("You may need to call setCertificateNFT manually");
  }
  
  try {
    const txSetCertInEventMgr = await eventManager.setCertificateNFT(certificateNftAddress);
    await waitForTransactionWithRetry(txSetCertInEventMgr, envConfig.confirmationBlocks);
  } catch (error: any) {
    console.warn("⚠️  Failed to set CertificateNFT in EventManager:", error.message);
    console.warn("You may need to call setCertificateNFT manually");
  }

  // Grant minter roles for certificate NFT to Celorean and EventManager
  try {
    const txMinterCelorean = await certificateNft.setMinter(await celorean.getAddress(), true);
    await waitForTransactionWithRetry(txMinterCelorean, envConfig.confirmationBlocks);
  } catch (error: any) {
    console.warn("⚠️  Failed to grant minter role to Celorean:", error.message);
    console.warn("You may need to call setMinter manually");
  }
  
  try {
    const txMinterEventMgr = await certificateNft.setMinter(eventManagerAddress, true);
    await waitForTransactionWithRetry(txMinterEventMgr, envConfig.confirmationBlocks);
    console.log("✅ CertificateNFT minter roles granted");
  } catch (error: any) {
    console.warn("⚠️  Failed to grant minter role to EventManager:", error.message);
    console.warn("You may need to call setMinter manually");
  }

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
      const txLecturer = await celorean.employLecturer(deployer.address);
      await txLecturer.wait();
      console.log(`\u2705 Deployer employed as lecturer: ${deployer.address}`);

      // Dummy images for local testing
      const REAL_IPFS_URIS = [
        "https://placehold.co/600x400/png",
        "https://placehold.co/600x400/orange/white/png",
        "https://placehold.co/600x400/blue/white/png",
        "https://placehold.co/600x400/green/white/png",
        "https://placehold.co/600x400/purple/white/png",
      ];

      // Helper to get random item
      const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
      // Helper to get random price between 0.001 and 0.01
      const getRandomPrice = () => (Math.random() * (0.01 - 0.001) + 0.001).toFixed(4);

      const mockCourses: Array<{
        title: string;
        duration: number;
        description: string;
        priceEth: string;
        tags: string[];
        level: string;
        metadataUri: string;
        capacity: number;
        courseType: number; // 0=Bootcamp, 1=Workshop, 2=Seminar
      }> = [
        {
          title: "Solidity Basics",
          duration: 4,
          description:
            "Learn the fundamentals of Solidity and smart contracts.",
          priceEth: getRandomPrice(),
          tags: ["solidity", "ethereum", "smart-contracts"],
          level: "Beginner",
          metadataUri: getRandomItem(REAL_IPFS_URIS),
          capacity: 50,
          courseType: 0, // Bootcamp
        },
        {
          title: "Advanced DApp Development",
          duration: 6,
          description: "Build production-ready decentralized applications.",
          priceEth: getRandomPrice(),
          tags: ["dapp", "frontend", "hardhat"],
          level: "Intermediate",
          metadataUri: getRandomItem(REAL_IPFS_URIS),
          capacity: 30,
          courseType: 1, // Workshop
        },
        {
          title: "DeFi Protocol Design",
          duration: 8,
          description: "Design and reason about core DeFi mechanisms.",
          priceEth: getRandomPrice(),
          tags: ["defi", "tokenomics", "security"],
          level: "Advanced",
          metadataUri: getRandomItem(REAL_IPFS_URIS),
          capacity: 20,
          courseType: 2, // Seminar
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
          // price removed
          c.tags,
          c.level,
          c.metadataUri,
          c.capacity,
          c.courseType
        );
        const receipt = await tx.wait();
        // Attempt to derive courseId from event or by reading latest count
        const afterCount = await celorean.courseCount();
        createdIds.push(afterCount.toString());
        console.log(
          `\u2705 Seeded course: ${c.title} (ID: ${afterCount}) - Price: ${c.priceEth} ETH - URI: ${c.metadataUri}`
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

    // Extended addresses
    certificateNFT: certificateNftAddress,
    eventManager: eventManagerAddress,
    verifierRegistry: verifierRegistryAddress,
  };

  // Create the addresses directory if it doesn't exist
  const addressesDir = path.join(__dirname, "../addresses");
  if (!fs.existsSync(addressesDir)) {
    fs.mkdirSync(addressesDir, { recursive: true });
  }

  // Update central addresses.json
  const centralAddressesPath = path.join(addressesDir, "addresses.json");
  let centralAddresses: any = { environments: {} };
  
  if (fs.existsSync(centralAddressesPath)) {
    try {
      centralAddresses = JSON.parse(fs.readFileSync(centralAddressesPath, "utf8"));
      if (!centralAddresses.environments) centralAddresses.environments = {};
    } catch (e) {
      console.warn("Could not parse existing addresses.json, creating new one");
    }
  }

  // Update the specific environment
  centralAddresses.environments[envConfig.name] = contractAddresses;
  
  // Update metadata
  centralAddresses._metadata = {
    description: "Unified contract addresses for all deployment environments",
    lastUpdated: deploymentTime.toISOString(),
    version: "1.0.0",
    note: "This file is auto-generated by deployment scripts"
  };

  // Write back to addresses.json
  fs.writeFileSync(centralAddressesPath, JSON.stringify(centralAddresses, null, 2));
  console.log(`Updated central addresses file: ${centralAddressesPath}`);

  // Also save as individual JSON for backup/reference
  const jsonFilePath = path.join(
    addressesDir,
    `${hre.network.name}-addresses.json`
  );
  fs.writeFileSync(jsonFilePath, JSON.stringify(contractAddresses, null, 2));

  // Run sync-addresses script logic to update frontend
  // We can spawn the script or just log instruction
  console.log("Running sync-addresses script...");
  try {
    const syncScript = path.join(__dirname, "sync-addresses.ts");
    // We use ts-node or hardhat run to execute it if possible, but for now let's just rely on the user or CI
    // Actually, let's try to run it via child_process if we can, or just copy the logic.
    // Since we are in hardhat environment, we can just require it if it exports a main function, 
    // but it's a script. Let's just use child_process.execSync
    const { execSync } = require("child_process");
    execSync(`npx ts-node ${syncScript}`, { stdio: 'inherit' });
  } catch (e) {
    console.warn("Failed to auto-run sync-addresses script. Please run 'npm run sync-addresses' manually.");
  }

  // Write individual JSONs for new contracts (for reference)
  const extraJsons = [
    { name: "certificate-nft", address: certificateNftAddress },
    { name: "event-manager", address: eventManagerAddress },
    { name: "verifier-registry", address: verifierRegistryAddress },
  ];
  for (const extra of extraJsons) {
    const p = path.join(addressesDir, `${hre.network.name}-${extra.name}.json`);
    fs.writeFileSync(p, JSON.stringify({ address: extra.address, network: hre.network.name, environment: envConfig.name }, null, 2));
  }


  // Enhanced File Saving Logging
  console.log("💾 CONTRACT ADDRESSES SAVED");
  console.log("=".repeat(50));
  console.log(`📄 Central Addresses File:        ${centralAddressesPath}`);
  console.log(`📄 JSON Backup File:              ${jsonFilePath}`);
  console.log("=".repeat(50));
  console.log("");

  console.log("");

  // Verify contracts based on environment configuration
  if (envConfig.requiresVerification) {
    console.log(
      `Waiting for ${envConfig.confirmationBlocks} block confirmations...`
    );
    await celorean.deploymentTransaction()?.wait(envConfig.confirmationBlocks);

    // Verify CertificateNFT, EventManager, VerifierRegistry
    try {
      await verify(certificateNftAddress, ["Celorean Certificates", "CLRN-CERT"], "contracts/CertificateNFT.sol:CertificateNFT");
      console.log("✅ CertificateNFT verification successful!");
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.log("⚠️ CertificateNFT verification skipped/failed:", errMsg);
    }
    try {
      await verify(eventManagerAddress, [], "contracts/EventManager.sol:EventManager");
      console.log("✅ EventManager verification successful!");
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.log("⚠️ EventManager verification skipped/failed:", errMsg);
    }
    try {
      await verify(verifierRegistryAddress, [], "contracts/VerifierRegistry.sol:VerifierRegistry");
      console.log("✅ VerifierRegistry verification successful!");
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.log("⚠️ VerifierRegistry verification skipped/failed:", errMsg);
    }

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
    console.log(`🏅 CertificateNFT:                ${certificateNftAddress}`);
    console.log(`📅 EventManager:                  ${eventManagerAddress}`);
    console.log(`✅ VerifierRegistry:              ${verifierRegistryAddress}`);
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
