import { ethers } from "ethers";

export const provider = new ethers.InfuraProvider(
  "mainnet",
  process.env.INFURA_ID
);
