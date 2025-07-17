// @ts-ignore
const hre = require("hardhat");
// @ts-ignore
const { verify } = require("../utils/verify.js");
// @ts-ignore
const fs = require("fs");
// @ts-ignore
const path = require("path");
require("dotenv").config();

// Helper function to get implementation address with retry logic
async function getImplementationAddressWithRetry(
  proxyAddress: string, 
  maxRetries: number = 5, 
  delay: number = 2000
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempting to get implementation address (attempt ${i + 1}/${maxRetries})...`);
      const implementationAddress = await hre.upgrades.erc1967.getImplementationAddress(proxyAddress);
      console.log("Implementation address:", implementationAddress);
      return implementationAddress;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`Attempt ${i + 1} failed:`, errorMessage);
      if (i === maxRetries - 1) {
        console.log("All attempts failed. Trying alternative method...");
        // Alternative method: try to get it from the proxy admin
        try {
          const proxyContract = await hre.ethers.getContractAt("ERC1967Proxy", proxyAddress);
          // This might not work for all cases, but worth trying
          console.log("Using proxy contract directly...");
          return "IMPLEMENTATION_ADDRESS_NOT_AVAILABLE";
        } catch (altError: unknown) {
          const altErrorMessage = altError instanceof Error ? altError.message : String(altError);
          console.log("Alternative method also failed:", altErrorMessage);
          return "IMPLEMENTATION_ADDRESS_NOT_AVAILABLE";
        }
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return "IMPLEMENTATION_ADDRESS_NOT_AVAILABLE";
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

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

  console.log("Celorean Proxy Contract Deployed at:", proxyAddress);
  console.log("");

  console.log(">>>DEPLOYER:", deployer.address);
  console.log("");

  // Wait a bit for the proxy to be fully initialized
  console.log("Waiting for proxy initialization...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Get implementation address with retry logic
  const implementationAddress = await getImplementationAddressWithRetry(proxyAddress);

  // Save contract addresses to TypeScript file
  const contractAddresses = {
    proxyAddress: proxyAddress,
    implementationAddress: implementationAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  // Create the addresses directory if it doesn't exist
  const addressesDir = path.join(__dirname, "../addresses");
  if (!fs.existsSync(addressesDir)) {
    fs.mkdirSync(addressesDir, { recursive: true });
  }

  // Generate TypeScript file content
  const tsContent = `// Auto-generated file - Do not edit manually
// Generated on: ${new Date().toISOString()}
// Network: ${hre.network.name}

export interface ContractAddresses {
  proxyAddress: string;
  implementationAddress: string;
  network: string;
  deployedAt: string;
  deployer: string;
}

export const contractAddresses: ContractAddresses = {
  proxyAddress: "${proxyAddress}",
  implementationAddress: "${implementationAddress}",
  network: "${hre.network.name}",
  deployedAt: "${new Date().toISOString()}",
  deployer: "${deployer.address}"
};

// Export individual addresses for convenience
export const CELOREAN_PROXY_ADDRESS = "${proxyAddress}";
export const CELOREAN_IMPLEMENTATION_ADDRESS = "${implementationAddress}";

export default contractAddresses;
`;

  // Write to TypeScript file
  const tsFilePath = path.join(
    addressesDir,
    `${hre.network.name}-addresses.ts`
  );
  fs.writeFileSync(tsFilePath, tsContent);
  console.log(`Contract addresses saved to: ${tsFilePath}`);

  // Also save as JSON for backup
  const jsonFilePath = path.join(
    addressesDir,
    `${hre.network.name}-addresses.json`
  );
  fs.writeFileSync(jsonFilePath, JSON.stringify(contractAddresses, null, 2));
  console.log(`Contract addresses also saved as JSON to: ${jsonFilePath}`);

  // Copy the TypeScript file to frontend contracts directory if it exists
  const frontendContractsDir = path.join(__dirname, "../../frontend/contracts");
  if (fs.existsSync(frontendContractsDir)) {
    const frontendTsPath = path.join(frontendContractsDir, "addresses.ts");
    fs.copyFileSync(tsFilePath, frontendTsPath);
    console.log(`Contract addresses copied to frontend: ${frontendTsPath}`);
  }

  console.log("");

  // Verify contracts (optional, only if you have an etherscan key and on testnet/mainnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await celorean.deploymentTransaction().wait(6);

    if (implementationAddress !== "IMPLEMENTATION_ADDRESS_NOT_AVAILABLE") {
      console.log("Verifying implementation contract...");
      try {
        await verify(
          implementationAddress,
          [],
          "contracts/Celorean.sol:Celorean"
        );
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log("Verification failed:", errorMessage);
      }
    } else {
      console.log("Skipping verification - implementation address not available");
    }
  } else {
    console.log("Skipping verification on local network");
  }
  console.log("");

  // Test the deployed contract
  console.log("Testing deployed contract...");
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
    
    console.log("✅ Contract deployment and testing successful!");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("⚠️  Contract testing failed:", errorMessage);
    console.log("But deployment was successful. Proxy address:", proxyAddress);
  }
}

main().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(errorMessage);
  process.exitCode = 1;
});
