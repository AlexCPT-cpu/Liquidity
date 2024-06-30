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
// import { provider } from "../helpers/providers.js";
import { decrypt } from "../index.js";

const flashBot2 = async (
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
    const provider = new ethers.InfuraProvider(
      "sepolia",
      process.env.INFURA_ID
    );

    const flashBotRelay = ethers.Wallet.createRandom().connect(provider);
    const deployerWallet = new ethers.Wallet(providerKey, provider);
    const buyerWallet = new ethers.Wallet(buyerKey, provider);

    // Initialize Flashbots provider
    const flashbotsProvider = await FlashbotsBundleProvider.create(
      provider,
      flashBotRelay,
      "https://relay-sepolia.flashbots.net",
      "sepolia"
    );

    // Initialize Uniswap Router contract
    const uniswapRouter = new ethers.Contract(
      "0xeaBcE3E74EF41FB40024a21Cc2ee2F5dDc615791",
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
    const amountBuyWei = ethers.utils.parseEther(
      String(amountToBuy),
      parseInt(18)
    );

    const baseAmtWei = ethers.utils.parseEther(
      String(baseAmount),
      parseInt(baseDecimals)
    ); // Amount of WETH to add as liquidity and use for token purchase
    const quoteAmtWei = ethers.utils.parseUnits(
      String(quoteAmount),
      parseInt(quoteDecimals)
    ); // Amount of tokens to provide as liquidity

    const baseAmtApproval = ethers.utils.parseEther(
      (parseFloat(baseAmount) + 2).toString(),
      parseInt(baseDecimals)
    ); // Amount of WETH to add as liquidity and use for token purchase
    const quoteAmtApproval = ethers.utils.parseUnits(
      (parseFloat(quoteAmount) + 2).toString(),
      parseInt(quoteDecimals)
    ); // Amount of tokens to provide as liquidity

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
    const addLiquidityTx =
      await uniswapRouter.populateTransaction.addLiquidityETH(
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
        ["0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", tokenToBuy],
        wallet.address,
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
    if ("error" in simulation) {
      console.log(`Simulation Error: ${simulation.error.message}`);
      console.log(simulation);
    } else {
      console.log(
        `Simulation Success: ${blockNumber} ${JSON.stringify(
          simulation,
          null,
          2
        )}`
      );
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
      return `${JSON.stringify(simulation, null, 2)}`;
    } else if (
      bundleResolution === FlashbotsBundleResolution.BlockPassedWithoutInclusion
    ) {
      console.log(`Not included in ${blockNumber + 1}`);
      return `Not included in ${blockNumber + 1}`;
    } else if (
      bundleResolution === FlashbotsBundleResolution.AccountNonceTooHigh
    ) {
      console.log(`Nonce too high, bailing`);
      return `Nonce too high, bailing`;
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
// const flash = flashBot2(
//   "0x10A20bE71a7161cf81d2511e987fa91225865a32",
//   "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
//   "6990666684e70cc9a66ac6972ba538f34c301acbf9fff623a849def95a479715",
//   "6990666684e70cc9a66ac6972ba538f34c301acbf9fff623a849def95a479715",
//   "0x10A20bE71a7161cf81d2511e987fa91225865a32",
//   "1",
//   "0.01",
//   "0.05"
// );
// console.log(`Data: ${flash}`);
export default flashBot2;
