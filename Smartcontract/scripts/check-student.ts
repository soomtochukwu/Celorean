import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Checking student status for:", signer.address);

  const addressesPath = path.join(__dirname, "../../frontend/contracts/addresses/localhost-addresses.json");
  if (!fs.existsSync(addressesPath)) {
    console.error("Addresses file not found!");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  const celoreanAddress = addresses.proxyAddress;

  if (!celoreanAddress) {
    console.error("Celorean proxy address not found!");
    process.exit(1);
  }

  console.log("Celorean Contract:", celoreanAddress);

  const Celorean = await ethers.getContractAt("Celorean", celoreanAddress);

  const isStudent = await Celorean.isStudent(signer.address);
  console.log(`Is ${signer.address} a student? ${isStudent}`);

  const isLecturer = await Celorean.isLecturer(signer.address);
  console.log(`Is ${signer.address} a lecturer? ${isLecturer}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
