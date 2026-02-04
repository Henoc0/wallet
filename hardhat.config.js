import "@nomicfoundation/hardhat-toolbox";
import { config } from "dotenv";

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: "0.8.28",
  paths: {
    artifacts: "./src/artifacts",
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

export default config;
