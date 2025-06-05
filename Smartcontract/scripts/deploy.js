const hre = require("hardhat");
const { verify } = require("../utils/verify.js");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Deploy Celorean
  const Celorean = await hre.ethers.deployContract("Celorean", [
    "Celorean",
    "CEN",
  ]);
  await Celorean.waitForDeployment();
  console.log("Celorean Contract Deployed at " + Celorean.target);
  console.log("");

  // Verify contracts (optional, only if you have an etherscan key and on testnet/mainnet)

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Verifying contracts...");
    await verify(
      Celorean.target,
      ["Celorean", "CEN"],
      "contracts/Celorean.sol:Celorean"
    );
  } else {
    console.log("Skipping verification on local network");
  }
  console.log("");

  // Get Celorean contract instance connected with deployer signer
  // const celorean = await hre.ethers.getContractAt(
  //   "Celorean",
  //   Celorean.target,
  //   deployer
  // );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
