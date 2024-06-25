import { truncateEthAddress } from "../helpers/truncateEthAddress.js";
import { readUserData, writeUserData } from "../index.js";

function startScene(scene) {
  const userData = readUserData();

  scene.enter(async (ctx) => {
    const user = userData.users[ctx.from.id];

    ctx.reply(
      `Please provide all the required information.\n\n${
        user.tokens[0].deployerKey ? "✅" : "📦"
      } <b>Deployer wallet: ${
        user.tokens[0].deployerKey ? "Provided" : ""
      }</b> \n${user.tokens[0].buyerKey ? "✅" : "📦"} <b>Buyer wallet: ${
        user.tokens[0].deployerKey ? "Provided" : ""
      }</b> \n\n${user.tokens[0].market ? "✅" : "📦"} <b>Market ID: ${
        user.tokens[0].market
          ? truncateEthAddress(String(user.tokens[0].market))
          : ""
      }</b> \n${user.tokens[0].baseToken ? "✅" : "📦"} <b>Base token: ${
        user.tokens[0].baseToken
          ? truncateEthAddress(String(user.tokens[0].baseToken))
          : ""
      }</b>  \n${user.tokens[0].quoteToken ? "✅" : "📦"} <b>Quote token: ${
        user.tokens[0].quoteToken
          ? truncateEthAddress(String(user.tokens[0].quoteToken))
          : ""
      }</b>  \n${
        user.tokens[0].baseTokenLiquidity ? "✅" : "📦"
      } <b>Initial base token liquidity: ${
        user.tokens[0].baseTokenLiquidity
          ? user.tokens[0].baseTokenLiquidity
          : ""
      }</b> \n${
        user.tokens[0].quoteTokenLiquidity ? "✅" : "📦"
      } <b>Initial quote token liquidity: ${
        user.tokens[0].quoteTokenLiquidity
          ? user.tokens[0].quoteTokenLiquidity
          : ""
      }</b> \n${user.tokens[0].buySnipe ? "✅" : "📦"} <b>Token to buy/snipe: ${
        user.tokens[0].buySnipe
          ? truncateEthAddress(String(user.tokens[0].buySnipe))
          : ""
      }</b>  \n${user.tokens[0].buy ? "✅" : "📦"}  <b>Buy amount: ${
        user.tokens[0].buy ? user.tokens[0].buy : ""
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
  scene.action("reset", (ctx) => {
    userData.users[userContext].tokens = [{}];
    writeUserData(userData);
    //ctx.scene.reenter(); //enter("start");
  });
  scene.action("next", (ctx) => {
    const userContext = ctx.from.id;
    if (userContext) {
      const buyerKey = userData.users[userContext].tokens[0].buyerKey;
      const deployerKey = userData.users[userContext].tokens[0].deployerKey;
      const market = userData.users[userContext].tokens[0].market;
      const baseToken = userData.users[userContext].tokens[0].baseToken;
      const quoteToken = userData.users[userContext].tokens[0].quoteToken;
      const baseTokenLiquidity =
        userData.users[userContext].tokens[0].baseTokenLiquidity;
      const quoteTokenLiquidity =
        userData.users[userContext].tokens[0].quoteTokenLiquidity;
      const buySnipe = userData.users[userContext].tokens[0].buySnipe;
      const buyAmount = userData.users[userContext].tokens[0].buy;

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
      }
    } else {
      ctx.reply("Please provide all the required information.");
    }
    //ctx.scene.enter("nextScene");
  });
}

export default startScene;
