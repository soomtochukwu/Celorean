import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

require("dotenv").config();

const config = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,  // Minimize size for deployment
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.22",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
          viaIR: true,
        },
      },
    ],
  },
  networks: {
    celoSepolia: {
      url: "https://rpc.ankr.com/celo_sepolia",
      accounts: [process.env.WALLET_KEY as string],
      chainId: 11142220,
    },
    celo: {
      url: "https://celo.drpc.org",
      accounts: [process.env.WALLET_KEY as string],
      chainId: 42220,
    },
    lisk: {
      url: "https://rpc.api.lisk.com",
      accounts: [process.env.WALLET_KEY as string],
      chainId: 1135,
      gasPrice: 1000000000,
    },
    liskSepolia: {
      url: "https://rpc.sepolia-api.lisk.com",
      accounts: [process.env.WALLET_KEY as string],
      chainId: 4202,
      gasPrice: 1000000000,
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
      celoSepolia: process.env.CELOSCAN_API_KEY || "",
      celo: process.env.CELOSCAN_API_KEY || "",
      lisk: process.env.LISK_API_KEY || "",
      liskSepolia: process.env.LISK_API_KEY || "",
    },
    customChains: [
      {
        network: "celoSepolia",
        chainId: 11142220,
        urls: {
          apiURL: "https://api-sepolia.celoscan.io/api",
          browserURL: "https://sepolia.celoscan.io",
        },
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
      {
        network: "lisk",
        chainId: 1135,
        urls: {
          apiURL: "https://blockscout.lisk.com/api",
          browserURL: "https://blockscout.lisk.com",
        },
      },
      {
        network: "liskSepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com",
        },
      },
    ],
  },

  sourcify: {
    enabled: true,
  },
};

export default config;
