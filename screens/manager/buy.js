import { isInteger } from "../../helpers/isInteger.js";
import { readUserData } from "../../index.js";

export const buy = (scene) => {
  scene.enter((ctx) => {
    ctx
      .reply("Please enter amount of ETH you want to snipe.", {
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
      const isNum = isInteger(input.toString());

      if (isNum) {
        const userId = ctx.from.id;
        const user = await readUserData(userId);

        try {
          user.tokens[0].buy = String(input);
          await user.save();
          ctx.reply("Input saved", {
            reply_to_message_id: ctx.session.lastMessageId,
          });
        } catch (error) {
          console.error("Error updating Buy Amount:", error);
          ctx
            .reply("Only integers are allowed as buy amount!.", {
              reply_to_message_id: ctx.session.lastMessageId,
            })
            .then((sentMessage) => {
              ctx.session.lastMessageId = sentMessage.message_id;
            });
        }
      } else {
        ctx
          .reply("Only integers are allowed as buy amount!.", {
            reply_to_message_id: ctx.session.lastMessageId,
          })
          .then((sentMessage) => {
            ctx.session.lastMessageId = sentMessage.message_id;
          });
      }
    }
  });
};
