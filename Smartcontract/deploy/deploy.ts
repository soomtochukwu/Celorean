const { network } = require("hardhat"),
  { verify } = require("./verify");

require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  console.log("");
  const ETHERSCAN_KEY = process.env.WALLET_KEY,
    { deployer } = await getNamedAccounts(),
    { deploy } = await deployments,
    { chainId } = network.config.chainId,
    /* 
        deploy Celorean 
        */
    Celorean = await deploy("Celorean", {
      from: deployer,
      args: ["Celorean", "CEN"],
      log: true,
      waitConfirmations: network.config.blockConfirmations,
    });
  // verify Celorean
  if (ETHERSCAN_KEY) {
    await verify(
      Celorean.address,
      ["Celorean", "CEN"],
      "contracts/governance_token.sol:BUNN_UTILITY_TOKEN"
    );
    console.log("");
  }
};

module.exports.tags = ["all", "CEN"];
