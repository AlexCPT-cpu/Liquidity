import { ethers } from "ethers";
import isContract from "../../helpers/isContract.js";
import { readUserData, writeUserData } from "../../index.js";
import { UniV2PairAbi, WETH9 } from "../../json/UniswapV2Json.js";
import { provider } from "../../helpers/providers.js";

export const marketScene = (scene) => {
  scene.enter((ctx) => {
    ctx
      .reply("Please enter the market ID.", {
        reply_markup: {
          force_reply: true,
        },
      })
      .then((sentMessage) => {
        ctx.session.lastMessageId = sentMessage.message_id;
      });
  });

  scene.on("text", async (ctx) => {
    const input = ctx.message.text;
    if (String(input) === "/start") {
      ctx.scene.enter("start");
    } else {
      // Replace this with your input validation logic
      const isContracts = await isContract(input.toString());
      if (isContracts) {
        const userId = ctx.from.id;
        const userData = readUserData();
        if (!userData.users[userId]) {
          userData.users[userId] = { tokens: [] };
        }

        const contract = new ethers.Contract(
          "0x3356c9A8f40F8E9C1d192A4347A76D18243fABC5",
          UniV2PairAbi,
          provider
        );
        const token0 = await contract.token0();
        const token1 = await contract.token1();
        if (String(token0).toLowerCase() === String(WETH9).toLowerCase()) {
          if (userData.users[userId].tokens.length > 0) {
            userData.users[userId].tokens[0].market = String(input);
            userData.users[userId].tokens[0].baseToken = String(token1);
            userData.users[userId].tokens[0].quoteToken = String(token0);
          } else {
            userData.users[userId].tokens.push({
              market: String(input),
              baseToken: String(token1),
              quoteToken: String(token0),
            });
          }
        } else {
          if (userData.users[userId].tokens.length > 0) {
            userData.users[userId].tokens[0].market = String(input);
            userData.users[userId].tokens[0].baseToken = String(token0);
            userData.users[userId].tokens[0].quoteToken = String(token1);
          } else {
            userData.users[userId].tokens.push({
              market: String(input),
              baseToken: String(token0),
              quoteToken: String(token1),
            });
          }
        }

        writeUserData(userData);
        ctx.reply("Correct market ID", {
          reply_to_message_id: ctx.session.lastMessageId,
        });
        // Add any further processes here
        // setTimeout(() => ctx.scene.enter("start"), 1500);
      } else {
        ctx
          .reply("Invalid market ID", {
            reply_to_message_id: ctx.session.lastMessageId,
          })
          .then((sentMessage) => {
            ctx.session.lastMessageId = sentMessage.message_id;
          });
      }
    }
  });
};
