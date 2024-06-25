import { ethers } from "ethers";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import UNISWAP_ROUTER_ABI from "./UniswapRouterABI.json";
import ERC20_ABI from "./ERC20ABI.json";

// Configurations
const INFURA_PROJECT_ID = "YOUR_INFURA_PROJECT_ID";
const PRIVATE_KEY = "YOUR_PRIVATE_KEY";
const FLASHBOTS_RELAY_SIGNING_KEY = "YOUR_FLASHBOTS_RELAY_SIGNING_KEY";
const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const WETH_ADDRESS = "0xC02aaa39b223FE8D0a0e5C4F27eAD9083C756Cc2";
const TOKEN_ADDRESS = "TOKEN_ADDRESS_HERE"; // Replace with the token address you want to interact with

// Initialize ethers provider
const provider = new ethers.providers.InfuraProvider(
  "mainnet",
  INFURA_PROJECT_ID
);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Initialize Flashbots provider
const flashbotsProvider = await FlashbotsBundleProvider.create(
  provider,
  new ethers.Wallet(FLASHBOTS_RELAY_SIGNING_KEY),
  "https://relay.flashbots.net",
  "mainnet"
);

// Initialize Uniswap Router contract
const uniswapRouter = new ethers.Contract(
  UNISWAP_ROUTER_ADDRESS,
  UNISWAP_ROUTER_ABI,
  wallet
);

// Initialize token contract
const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);

async function main() {
  // Define transaction details
  const WETHAmount = ethers.utils.parseEther("1"); // Amount of WETH to add as liquidity and use for token purchase
  const tokenAmount = ethers.utils.parseUnits("1000", 18); // Amount of tokens to provide as liquidity

  // Approve the Uniswap Router to spend WETH and the token
  const approveWETH = await tokenContract.approve(
    UNISWAP_ROUTER_ADDRESS,
    WETHAmount
  );
  const approveToken = await tokenContract.approve(
    UNISWAP_ROUTER_ADDRESS,
    tokenAmount
  );
  await Promise.all([approveWETH.wait(), approveToken.wait()]);

  // Add liquidity to Uniswap
  const addLiquidityTx = await uniswapRouter.addLiquidity(
    WETH_ADDRESS,
    TOKEN_ADDRESS,
    WETHAmount,
    tokenAmount,
    0,
    0,
    wallet.address,
    Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
  );

  // Buy tokens
  const buyTokensTx = await uniswapRouter.swapExactETHForTokens(
    0,
    [WETH_ADDRESS, TOKEN_ADDRESS],
    wallet.address,
    Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    { value: WETHAmount }
  );

  // Create Flashbots bundle
  const signedTransactions = await flashbotsProvider.signBundle([
    {
      signer: wallet,
      transaction: addLiquidityTx,
    },
    {
      signer: wallet,
      transaction: buyTokensTx,
    },
  ]);

  // Send Flashbots bundle
  const bundleResponse = await flashbotsProvider.sendBundle(
    signedTransactions,
    Math.floor(Date.now() / 1000) + 60 // Valid for the next 60 seconds
  );

  if ("error" in bundleResponse) {
    console.error(bundleResponse.error.message);
    return;
  }

  // Wait for the bundle to be mined
  const bundleReceipt = await bundleResponse.wait();
  if (bundleReceipt === 0) {
    console.log("Bundle included in a block");
  } else {
    console.log("Bundle not included in a block");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
