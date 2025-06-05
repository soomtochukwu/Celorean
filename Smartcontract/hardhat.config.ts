import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();

const config = {
  solidity: "0.8.28",
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 100000000000,
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: [process.env.WALLET_KEY as string],
      chainId: 42220,
      gasPrice: 100000000000,
    },
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [process.env.localPK as string],
      blockConfirmations: 5,
    },
  },
  etherscan: {
    apiKey: {
      alfajores: process.env.ALFAJORESCAN_API_KEY || "",
      celo: process.env.CELOSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://celo-alfajores.blockscout.com/api",
          browserURL: "https://celo-alfajores.blockscout.com",
        },
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io"
        },
      },
    ],
  },

  sourcify: {
    enabled: true,
  },
};

export default config;
