import { truncateEthAddress } from "../../helpers/truncateEthAddress.js";
import { readUserData } from "../../index.js";
import flashBot from "../../script/flashBot.js";

export const next = (scene) => {
  const userData = readUserData();
  scene.enter((ctx) => {
    const user = userData.users[ctx.from.id];

    ctx
      .reply(
        `Please check the below data select an option ..\n\n${
          user.tokens[0].deployerKey ? "✅" : "📦"
        }<b>Deployer wallet: ${
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
        }</b> \n${
          user.tokens[0].buySnipe ? "✅" : "📦"
        } <b>Token to buy/snipe: ${
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
    const userContext = ctx.from.id;

    const buyerKey = userData.users[userContext].tokens[0].buyerKey;
    const deployerKey = userData.users[userContext].tokens[0].deployerKey;
    const baseToken = userData.users[userContext].tokens[0].baseToken;
    const quoteToken = userData.users[userContext].tokens[0].quoteToken;
    const baseTokenLiquidity =
      userData.users[userContext].tokens[0].baseTokenLiquidity;
    const quoteTokenLiquidity =
      userData.users[userContext].tokens[0].quoteTokenLiquidity;
    const buySnipe = userData.users[userContext].tokens[0].buySnipe;
    const buyAmount = userData.users[userContext].tokens[0].buy;
    console.log("deploy script");
    const flashTx = await flashBot(
      baseToken,
      quoteToken,
      deployerKey,
      buyerKey,
      buySnipe,
      baseTokenLiquidity,
      quoteTokenLiquidity,
      buyAmount
    );
    if (flashTx !== "error bundling") {
      setTimeout(
        () =>
          ctx.reply(`Transaction successfull visit at: \n\n 
          ${/*flashTx*/ ""}
          `),
        1500
      );
      ctx.scene.leave();
    }
  });
};
