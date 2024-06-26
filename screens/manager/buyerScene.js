import isValidPrivateKey from "../../hooks/isValidPrivateKey.js";
import { encrypt, readUserData } from "../../index.js";

export const buyerScene = (scene) => {
  scene.enter((ctx) => {
    ctx
      .reply("Please enter the buyer wallet private key.", {
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
    try {
      await ctx.deleteMessage(ctx.message.message_id);
    } catch (err) {
      console.error("Failed to delete message:", err);
      // If deletion fails, you can handle it here or just log the error.
    }
    if (String(input) === "/start") {
      ctx.scene.enter("start");
    } else {
      // Replace this with your input validation logic
      const isPrivateKey = isValidPrivateKey(input.toString());
      if (isPrivateKey) {
        const encrypte = encrypt(String(input));
        const userId = ctx.from.id;
        const user = await readUserData(userId);

        try {
          user.tokens[0].buyerKey = String(encrypte);
          await user.save();
          ctx.reply("Input saved", {
            reply_to_message_id: ctx.session.lastMessageId,
          });
        } catch (error) {
          console.error("Error updating buyerKey:", error);
          ctx
            .reply("Invalid private key!.", {
              reply_to_message_id: ctx.session.lastMessageId,
            })
            .then((sentMessage) => {
              ctx.session.lastMessageId = sentMessage.message_id;
            });
        }
      } else {
        ctx
          .reply("Invalid private key!.", {
            reply_to_message_id: ctx.session.lastMessageId,
          })
          .then((sentMessage) => {
            ctx.session.lastMessageId = sentMessage.message_id;
          });
      }
    }
  });
};
