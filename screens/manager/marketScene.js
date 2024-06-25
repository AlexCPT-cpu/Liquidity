import isValidEthAddress from "../../hooks/isValidEthAddress.js";
import { readUserData, writeUserData } from "../../index.js";

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

  scene.on("text", (ctx) => {
    const input = ctx.message.text;
    if (String(input) === "/start") {
      ctx.scene.enter("start");
    } else {
      // Replace this with your input validation logic
      const isPrivateKey = isValidEthAddress(input.toString());
      console.log(isPrivateKey);
      if (isPrivateKey) {
        const userId = ctx.from.id;
        const userData = readUserData();
        if (!userData.users[userId]) {
          userData.users[userId] = { tokens: [] };
        }

        if (userData.users[userId].tokens.length > 0) {
          userData.users[userId].tokens[0].market = String(input);
        } else {
          userData.users[userId].tokens.push({ market: String(input) });
        }
        writeUserData(userData);
        ctx.reply("Correct market ID", {
          reply_to_message_id: ctx.session.lastMessageId,
        });
        // Add any further processes here
        ctx.scene.leave();
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
