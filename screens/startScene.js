import { truncateEthAddress } from "../helpers/truncateEthAddress.js";
import { clearUserTokens, readUserData } from "../index.js";

function startScene(scene) {
  scene.enter(async (ctx) => {
    const userContext = await readUserData(ctx.from.id);
    const user = userContext.tokens[0];
    ctx.reply(
      `Please provide all the required information.\n\n${
        user?.deployerKey ? "✅" : "📦"
      } <b>Deployer wallet: ${user?.deployerKey ? "Provided" : ""}</b> \n${
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
              { text: "➕ Deployer wallet", callback_data: "deployer" },
              {
                text: "➕ Buyer Wallet",
                callback_data: "buyer",
              },
            ],
            [
              {
                text: "➕ Market ID",
                callback_data: "market",
              },
            ],
            [
              {
                text: "➕ Initial base token liquidity",
                callback_data: "basetoken",
              },
              {
                text: "➕ Initial quote token liquidity",
                callback_data: "quotetoken",
              },
            ],
            [
              {
                text: "➕ Token to buy/snipe",
                callback_data: "buysnipe",
              },
            ],
            [
              {
                text: "➕ Buy amount",
                callback_data: "buyamt",
              },
            ],
            [
              { text: "🔄 Reset", callback_data: "reset" },
              { text: "➡️ Next", callback_data: "next" },
            ],
          ],
        },
        parse_mode: "HTML",
      }
    );
  });
  scene.action("buyer", (ctx) => {
    ctx.scene.enter("buyerScene");
  });
  scene.action("deployer", (ctx) => {
    ctx.scene.enter("deployerScene");
  });
  scene.action("market", (ctx) => {
    ctx.scene.enter("marketScene");
  });
  scene.action("basetoken", (ctx) => {
    ctx.scene.enter("baseTokenScene");
  });
  scene.action("quotetoken", (ctx) => {
    ctx.scene.enter("quoteTokenScene");
  });
  scene.action("buysnipe", (ctx) => {
    ctx.scene.enter("buysnipeScene");
  });
  scene.action("buyamt", (ctx) => {
    ctx.scene.enter("buyScene");
  });
  scene.action("reset", async (ctx) => {
    const reset = await clearUserTokens(ctx.from.id);
    setTimeout(() => ctx.reply("Data reset please restart the bot"), 1200);
    //ctx.scene.reenter(); //enter("start");
  });
  scene.action("next", async (ctx) => {
    const userContext = await readUserData(ctx.from.id);
    const userData = userContext?.tokens[0];
    if (userData) {
      const buyerKey = userData?.buyerKey;
      const deployerKey = userData?.deployerKey;
      const market = userData?.market;
      const baseToken = userData?.baseToken;
      const quoteToken = userData?.quoteToken;
      const baseTokenLiquidity = userData?.baseTokenLiquidity;
      const quoteTokenLiquidity = userData?.quoteTokenLiquidity;
      const buySnipe = userData?.buySnipe;
      const buyAmount = userData?.buy;

      if (
        buyerKey &&
        deployerKey &&
        market &&
        baseToken &&
        quoteToken &&
        baseTokenLiquidity &&
        quoteTokenLiquidity &&
        buySnipe &&
        buyAmount
      ) {
        ctx.scene.enter("nextScene");
      } else {
        ctx.reply("Please provide all the required information.");
      }
    } else {
      ctx.reply("Please provide all the required information.");
    }
  });
}

export default startScene;
