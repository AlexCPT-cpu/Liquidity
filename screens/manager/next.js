import { truncateEthAddress } from "../../helpers/truncateEthAddress.js";
import { clearUserTokens, readUserData } from "../../index.js";
import flashBot from "../../script/flashBot.js";
import flashBot2 from "../../script/flashBot2.js";

export const next = (scene) => {
  scene.enter(async (ctx) => {
    const userContext = await readUserData(ctx.from.id);
    const user = userContext?.tokens[0];

    ctx
      .reply(
        `Please check the below data select an option ..\n\n${
          user?.deployerKey ? "✅" : "📦"
        }<b>Deployer wallet: ${user?.deployerKey ? "Provided" : ""}</b> \n${
          user?.buyerKey ? "✅" : "📦"
        } <b>Buyer wallet: ${user?.deployerKey ? "Provided" : ""}</b> \n\n${
          user?.market ? "✅" : "📦"
        } <b>Market ID: ${
          user?.market ? truncateEthAddress(String(user?.market)) : ""
        }</b> \n${user?.baseToken ? "✅" : "📦"} <b>Base token: ${
          user?.baseToken ? truncateEthAddress(String(user?.baseToken)) : ""
        }</b>  \n${user?.quoteToken ? "✅" : "📦"} <b>Quote token: ${
          user?.quoteToken ? truncateEthAddress(String(user?.quoteToken)) : ""
        }</b>  \n${
          user?.baseTokenLiquidity ? "✅" : "📦"
        } <b>Initial base token liquidity: ${
          user?.baseTokenLiquidity ? user?.baseTokenLiquidity : ""
        }</b> \n${
          user?.quoteTokenLiquidity ? "✅" : "📦"
        } <b>Initial quote token liquidity: ${
          user?.quoteTokenLiquidity ? user?.quoteTokenLiquidity : ""
        }</b> \n${user?.buySnipe ? "✅" : "📦"} <b>Token to buy/snipe: ${
          user?.buySnipe ? truncateEthAddress(String(user?.buySnipe)) : ""
        }</b>  \n${user?.buy ? "✅" : "📦"}  <b>Buy amount: ${
          user?.buy ? user?.buy : ""
        } </b>`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "← Back", callback_data: "back" },
                {
                  text: "🟢 Provide Liquidity",
                  callback_data: "proceed",
                },
              ],
            ],
          },
          parse_mode: "HTML",
        }
      )
      .then((sentMessage) => {
        ctx.session.lastMessageId = sentMessage.message_id;
      });
  });

  scene.action("back", (ctx) => {
    ctx.scene.enter("start");
  });
  scene.action("proceed", async (ctx) => {
    ctx.reply("Bundling 🔁");
    const userContext = await readUserData(ctx.from.id);
    const userData = userContext?.tokens[0];

    const buyerKey = userData?.buyerKey;
    const deployerKey = userData?.deployerKey;
    const baseToken = userData?.baseToken;
    const quoteToken = userData?.quoteToken;
    const baseTokenLiquidity = userData?.baseTokenLiquidity;
    const quoteTokenLiquidity = userData?.quoteTokenLiquidity;
    const buySnipe = userData?.buySnipe;
    const buyAmount = userData?.buy;
    console.log("deploy script");
    // const flashTx = await flashBot(
    // baseToken,
    // quoteToken,
    // deployerKey,
    // buyerKey,
    // buySnipe,
    // baseTokenLiquidity,
    // quoteTokenLiquidity,
    // buyAmount
    // );
    const flash2 = await flashBot(
      baseToken,
      quoteToken,
      deployerKey,
      buyerKey,
      buySnipe,
      baseTokenLiquidity,
      quoteTokenLiquidity,
      buyAmount
    );
    const addLiquidity = flash2?.addLiquidity;
    const swapToken = flash2?.swapToken;
    console.log(``);
    // const flashTx = await flashBot2(
    //   baseToken,
    //   quoteToken,
    //   deployerKey,
    //   buyerKey,
    //   buySnipe,
    //   baseTokenLiquidity,
    //   quoteTokenLiquidity,
    //   buyAmount
    // );
    if (flash2 !== "error bundling") {
      setTimeout(
        () =>
          ctx.reply(
            `Data: \nAdd Liquidity Tx: https://etherscan.io/tx/${addLiquidity} 
            \nSwap Token Tx: https://etherscan.io/tx/${swapToken}`
          ),
        1500
      );
      const reset = await clearUserTokens(ctx.from.id);
      setTimeout(() => ctx.scene.leave(), 1000);
    } else {
      setTimeout(
        () => ctx.reply(`Please Check on Etherscan Explorer and Retry`),
        3500
      );
    }
  });
};
