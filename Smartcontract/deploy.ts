import { ethers } from "hardhat";

async function main() {
  const Celorean = await ethers.deployContract("Celorean", ["Celorean", "CEN"]);

  await Celorean.waitForDeployment();

  console.log("Celorean Contract Deployed at " + Celorean.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
