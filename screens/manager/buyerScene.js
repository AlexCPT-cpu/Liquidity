import isValidPrivateKey from "../../hooks/isValidPrivateKey.js";
import { readUserData, writeUserData } from "../../index.js";

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
    console.log(ctx.message);
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
        const userId = ctx.from.id;
        const userData = readUserData();
        if (!userData.users[userId]) {
          userData.users[userId] = { tokens: [] };
        }

        if (userData.users[userId].tokens.length > 0) {
          userData.users[userId].tokens[0].buyerKey = String(input);
        } else {
          userData.users[userId].tokens.push({ buyerKey: String(input) });
        }
        writeUserData(userData);
        ctx.reply("Correct private key!", {
          reply_to_message_id: ctx.session.lastMessageId,
        });
        // Add any further processes here
        //setTimeout(() => ctx.scene.enter("start"), 1500);
      } else {
        ctx
          .reply("Invalid private key", {
            reply_to_message_id: ctx.session.lastMessageId,
          })
          .then((sentMessage) => {
            ctx.session.lastMessageId = sentMessage.message_id;
          });
      }
    }
  });
};
