// @ts-ignore
const hre = require("hardhat");
// @ts-ignore
const { verify } = require("../utils/verify.js");
// @ts-ignore
const fs = require("fs");
// @ts-ignore
const path = require("path");
require("dotenv").config();

// Import existing addresses
const { contractAddresses } = require("../addresses/localhost-addresses.ts");

async function upgradeContract() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Upgrading contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );
  console.log("");

  // Get the existing proxy address
  const proxyAddress = contractAddresses.proxyAddress;
  console.log("Existing Proxy Address:", proxyAddress);
  console.log(
    "Previous Implementation:",
    contractAddresses.implementationAddress
  );
  console.log("");

  // Get the new contract factory
  const CeloreanV2 = await hre.ethers.getContractFactory("Celorean");

  console.log("Upgrading Celorean proxy to new implementation...");

  // Upgrade the proxy to the new implementation
  const upgraded = await hre.upgrades.upgradeProxy(proxyAddress, CeloreanV2);
  await upgraded.waitForDeployment();

  console.log("Celorean Proxy upgraded successfully!");
  console.log("Proxy Address (unchanged):", proxyAddress);
  console.log("");

  // Get the new implementation address
  const newImplementationAddress =
    await hre.upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("New Implementation Address:", newImplementationAddress);
  console.log("");

  // Update contract addresses
  const updatedContractAddresses = {
    proxyAddress: proxyAddress,
    implementationAddress: newImplementationAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    previousImplementation: contractAddresses.implementationAddress,
    upgradedAt: new Date().toISOString(),
  };

  // Create the addresses directory if it doesn't exist
  const addressesDir = path.join(__dirname, "../addresses");
  if (!fs.existsSync(addressesDir)) {
    fs.mkdirSync(addressesDir, { recursive: true });
  }

  // Generate updated TypeScript file content
  const tsContent = `// Auto-generated file - Do not edit manually
// Generated on: ${new Date().toISOString()}
// Network: ${hre.network.name}
// Upgraded from: ${contractAddresses.implementationAddress}

export interface ContractAddresses {
  proxyAddress: string;
  implementationAddress: string;
  network: string;
  deployedAt: string;
  deployer: string;
  previousImplementation?: string;
  upgradedAt?: string;
}

export const contractAddresses: ContractAddresses = {
  proxyAddress: "${proxyAddress}",
  implementationAddress: "${newImplementationAddress}",
  network: "${hre.network.name}",
  deployedAt: "${contractAddresses.deployedAt}",
  deployer: "${deployer.address}",
  previousImplementation: "${contractAddresses.implementationAddress}",
  upgradedAt: "${new Date().toISOString()}"
};

// Export individual addresses for convenience
export const CELOREAN_PROXY_ADDRESS = "${proxyAddress}";
export const CELOREAN_IMPLEMENTATION_ADDRESS = "${newImplementationAddress}";

export default contractAddresses;
`;

  // Write to TypeScript file
  const tsFilePath = path.join(
    addressesDir,
    `${hre.network.name}-addresses.ts`
  );
  fs.writeFileSync(tsFilePath, tsContent);
  console.log(`Updated contract addresses saved to: ${tsFilePath}`);

  // Also save as JSON for backup
  const jsonFilePath = path.join(
    addressesDir,
    `${hre.network.name}-addresses.json`
  );
  fs.writeFileSync(
    jsonFilePath,
    JSON.stringify(updatedContractAddresses, null, 2)
  );
  console.log(
    `Updated contract addresses also saved as JSON to: ${jsonFilePath}`
  );

  // Copy the TypeScript file to frontend contracts directory if it exists
  const frontendContractsDir = path.join(__dirname, "../../frontend/contracts");
  if (fs.existsSync(frontendContractsDir)) {
    const frontendTsPath = path.join(frontendContractsDir, "addresses.ts");
    fs.copyFileSync(tsFilePath, frontendTsPath);
    console.log(
      `Updated contract addresses copied to frontend: ${frontendTsPath}`
    );
  }

  console.log("");

  // Verify the new implementation contract (optional)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await upgraded.deploymentTransaction().wait(6);

    console.log("Verifying new implementation contract...");
    try {
      await verify(
        newImplementationAddress,
        [],
        "contracts/Celorean.sol:Celorean"
      );
    } catch (error) {
      if (error instanceof Error) {
        console.log("Verification failed:", error.message);
      } else {
        console.log("Verification failed:", String(error));
      }
    }
  } else {
    console.log("Skipping verification on local network");
  }

  console.log("");
  console.log("✅ Upgrade completed successfully!");
  console.log(
    "📝 The proxy contract now uses the new implementation with metadataUri support"
  );
  console.log("🔗 Proxy Address (unchanged):", proxyAddress);
  console.log("🆕 New Implementation:", newImplementationAddress);
}

upgradeContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
