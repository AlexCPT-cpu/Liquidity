import isContract from "../../helpers/isContract.js";
import { readUserData } from "../../index.js";

export const buySnipe = (scene) => {
  scene.enter((ctx) => {
    ctx
      .reply("Please enter the address of the token you want to snipe.", {
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
      const isContracts = isContract(input.toString());

      if (isContracts) {
        const userId = ctx.from.id;
        const user = await readUserData(userId);

        try {
          user.tokens[0].buySnipe = String(input);
          await user.save();
          ctx.reply("Input saved", {
            reply_to_message_id: ctx.session.lastMessageId,
          });
        } catch (error) {
          console.error("Error updating contract:", error);
          ctx
            .reply("Please enter a valid ETH address!.", {
              reply_to_message_id: ctx.session.lastMessageId,
            })
            .then((sentMessage) => {
              ctx.session.lastMessageId = sentMessage.message_id;
            });
        }
      } else {
        ctx
          .reply("Please enter a valid ETH address!", {
            reply_to_message_id: ctx.session.lastMessageId,
          })
          .then((sentMessage) => {
            ctx.session.lastMessageId = sentMessage.message_id;
          });
      }
    }
  });
};
