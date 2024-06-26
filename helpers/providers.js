import { ethers } from "ethers";

export const provider = new ethers.AlchemyProvider(
  "mainnet",
  process.env.ALCHEMY_ID
);
