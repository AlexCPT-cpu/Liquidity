import isValidPrivateKey from "../../hooks/isValidPrivateKey.js";
import { readUserData, writeUserData } from "../../index.js";

export const deployerScene = (scene) => {
  scene.enter((ctx) => {
    ctx
      .reply("Please enter the deployer wallet private key.", {
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
    console.log(input);
    if (String(input) === "/start") {
      ctx.scene.enter("start");
    } else {
      // Replace this with your input validation logic
      const isPrivateKey = isValidPrivateKey(input.toString());
      const userId = ctx.from.id;

      if (isPrivateKey) {
        const userData = readUserData();
        if (!userData.users[userId]) {
          userData.users[userId] = { tokens: [] };
        }

        if (userData.users[userId].tokens.length > 0) {
          userData.users[userId].tokens[0].deployerKey = String(input);
        } else {
          userData.users[userId].tokens.push({ deployerKey: String(input) });
        }

        // const tokenIndex = userData.users[userId].tokens.findIndex(
        //   (token) => token.deployerKey === newToken.address
        // );

        // if (tokenIndex !== -1) {
        //   // Update existing token
        //   userData.users[userId].tokens[tokenIndex] = newToken;
        // } else {
        //   // Add new token
        //   userData.users[userId].tokens.push(newToken);
        // }

        writeUserData(userData);

        ctx.reply("Correct private key!", {
          reply_to_message_id: ctx.session.lastMessageId,
        });
        // Add any further processes here
        ctx.scene.leave();
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
