import { ethers } from "ethers";
import {
  FlashbotsBundleProvider,
  FlashbotsBundleResolution,
} from "@flashbots/ethers-provider-bundle";
import {
  Erc20Abi,
  UniswapRouterAbi,
  UniswapV2Router,
  WETH9,
} from "../json/UniswapV2Json.js";
import { provider } from "../helpers/providers.js";
import { decrypt } from "../index.js";

const flashBot = async (
  baseToken,
  quoteToken,
  providerKey,
  buyerKey,
  tokenToBuy,
  baseAmount,
  quoteAmount,
  amountToBuy
) => {
  try {
    const decriptDeploy = decrypt(providerKey);
    const decriptBuy = decrypt(buyerKey);

    let flashBotRelay = ethers.Wallet.createRandom();
    const deployerWallet = new ethers.Wallet(decriptDeploy, provider);
    const buyerWallet = new ethers.Wallet(decriptBuy, provider);

    // Initialize Flashbots provider
    const flashbotsProvider = await FlashbotsBundleProvider.create(
      provider,
      flashBotRelay,
      "https://relay.flashbots.net",
      "mainnet"
    );

    // Initialize Uniswap Router contract
    const uniswapRouter = new ethers.Contract(
      UniswapV2Router,
      UniswapRouterAbi,
      deployerWallet
    );

    // Initialize token contract
    const baseContract = new ethers.Contract(
      baseToken,
      Erc20Abi,
      deployerWallet
    );
    const quoteContract = new ethers.Contract(
      quoteToken,
      Erc20Abi,
      deployerWallet
    );

    const baseDecimals = await baseContract.decimals();
    const quoteDecimals = await quoteContract.decimals();
    const amountBuyWei = BigInt(amountToBuy * 10 ** 18);

    const baseAmtWei = BigInt(baseAmount * 10 ** parseInt(baseDecimals));
    const quoteAmtWei = BigInt(quoteAmount * 10 ** parseInt(quoteDecimals));
    const baseAmtApproval = BigInt(
      (baseAmount + 2) * 10 ** parseInt(baseDecimals)
    );
    const quoteAmtApproval = BigInt(
      (quoteAmount + 2) * 10 ** parseInt(quoteDecimals)
    );

    // Approve the Uniswap Router to spend WETH and the token
    const approveBase = await baseContract.approve(
      UniswapV2Router,
      baseAmtApproval
    );
    const approveQuote = await quoteContract.approve(
      UniswapV2Router,
      quoteAmtApproval
    );
    await Promise.all([approveBase.wait(), approveQuote.wait()]);

    // Add liquidity to Uniswap
    const addLiquidityTx = await uniswapRouter.addLiquidityETH(
      baseToken,
      baseAmtWei,
      String(0),
      String(0),
      deployerWallet.address,
      Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
      { value: amountBuyWei }
    );

    // Buy tokens
    const buyTokensTx =
      await uniswapRouter.populateTransaction.swapExactETHForTokens(
        String(0),
        [WETH9, tokenToBuy],
        buyerWallet.address,
        Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
        { value: amountBuyWei }
      );
    // Create Flashbots bundle
    const signedTransactions = await flashbotsProvider.signBundle([
      {
        signer: deployerWallet,
        transaction: addLiquidityTx,
      },
      {
        signer: buyerWallet,
        transaction: buyTokensTx,
      },
    ]);
    const blockNumber = await provider.getBlockNumber();

    console.log(new Date());
    const simulation = await flashbotsProvider.simulate(
      signedTransactions,
      blockNumber + 1
    );
    console.log(new Date());

    // Using TypeScript discrimination

    console.log(new Date());
    if ("error" in simulation) {
      console.log(`Simulation Error: ${simulation.error.message}`);
    } else {
      console.log(`Simulation Success: ${blockNumber} ${simulation}`);
    }

    const bundleSubmission = await flashbotsProvider.sendRawBundle(
      signedTransactions,
      blockNumber + 1
    );
    console.log("bundles submitted");
    if ("error" in bundleSubmission) {
      throw new Error(bundleSubmission.error.message);
    }
    const bundleResolution = await bundleSubmission.wait();
    if (bundleResolution === FlashbotsBundleResolution.BundleIncluded) {
      console.log(`Congrats, included in ${blockNumber + 1}`);
      console.log(`${JSON.stringify(simulation, null, 2)}`);
    } else if (
      bundleResolution === FlashbotsBundleResolution.BlockPassedWithoutInclusion
    ) {
      console.log(`Not included in ${blockNumber + 1}`);
    } else if (
      bundleResolution === FlashbotsBundleResolution.AccountNonceTooHigh
    ) {
      console.log(`Nonce too high, bailing`);
    }
    if ("error" in simulation) {
      return {
        addLiquidity: bundleSubmission?.bundleTransactions[0]?.hash,
        swapToken: bundleSubmission?.bundleTransactions[1]?.hash,
      };
    } else {
      return {
        addLiquidity: simulation?.results[0]?.hash,
        swapToken: simulation?.results[1]?.hash,
      };
    }
    // // Send Flashbots bundle
    // const bundleResponse = await flashbotsProvider.sendBundle(
    //   signedTransactions,
    //   Math.floor(Date.now() / 1000) + 60 // Valid for the next 60 seconds
    // );

    // if ("error" in bundleResponse) {
    //   console.error(bundleResponse.error.message);
    //   return;
    // }

    // // Wait for the bundle to be mined
    // const bundleReceipt = await bundleResponse.wait();
    // const reciept = bundleReceipt.result.bundleHash
    // if (bundleReceipt === 0) {
    //   console.log("Bundle included in a block");
    //   return `https://etherscan.io/tx/${bundleReceipt?.transactionHash}/`;
    // } else {
    //   console.log("Bundle not included in a block");
    //   return "error bundling";
    // }
  } catch (error) {
    console.log(error);
    return "error bundling";
  }
};

export default flashBot;
