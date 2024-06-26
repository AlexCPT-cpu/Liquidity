import { isInteger } from "../../helpers/isInteger.js";
import { readUserData } from "../../index.js";

export const baseTokenScene = (scene) => {
  scene.enter((ctx) => {
    ctx
      .reply("Please enter the initial base token liquidity.", {
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
      const isNum = isInteger(Number(input));
      if (isNum) {
        const userId = ctx.from.id;
        const user = await readUserData(userId);

        try {
          user.tokens[0].baseTokenLiquidity = String(input);
          await user.save();
          ctx.reply("Input saved", {
            reply_to_message_id: ctx.session.lastMessageId,
          });
        } catch (error) {
          console.error("Error updating Base Liquidity:", error);
          ctx
            .reply(
              "Only integers are allowed as initial base token liquidity!.",
              {
                reply_to_message_id: ctx.session.lastMessageId,
              }
            )
            .then((sentMessage) => {
              ctx.session.lastMessageId = sentMessage.message_id;
            });
        }
      } else {
        ctx
          .reply(
            "Only integers are allowed as initial base token liquidity!.",
            {
              reply_to_message_id: ctx.session.lastMessageId,
            }
          )
          .then((sentMessage) => {
            ctx.session.lastMessageId = sentMessage.message_id;
          });
      }
    }
  });
};
