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
        const user = await readUserData(userId);

        const contract = new ethers.Contract(
          String(input),
          UniV2PairAbi,
          provider
        );
        const token0 = await contract.token0();
        const token1 = await contract.token1();
        try {
          if (String(token0).toLowerCase() === String(WETH9).toLowerCase()) {
            user.tokens[0].market = String(input);
            user.tokens[0].baseToken = String(token1);
            user.tokens[0].quoteToken = String(token0);
            await user.save();
          } else {
            user.tokens[0].market = String(input);
            user.tokens[0].baseToken = String(token0);
            user.tokens[0].quoteToken = String(token1);
            await user.save();
          }
          ctx.reply("Input saved", {
            reply_to_message_id: ctx.session.lastMessageId,
          });
        } catch (error) {
          console.error("Error updating market:", error);
          ctx
            .reply("Invalid market ID!.", {
              reply_to_message_id: ctx.session.lastMessageId,
            })
            .then((sentMessage) => {
              ctx.session.lastMessageId = sentMessage.message_id;
            });
        }
      } else {
        ctx
          .reply("Invalid market ID!.", {
            reply_to_message_id: ctx.session.lastMessageId,
          })
          .then((sentMessage) => {
            ctx.session.lastMessageId = sentMessage.message_id;
          });
      }
    }
  });
};
