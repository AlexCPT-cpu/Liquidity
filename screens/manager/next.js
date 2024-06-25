import isValidPrivateKey from "../../hooks/isValidPrivateKey.js";

export const next = (scene) => {
  scene.enter((ctx) => {
    ctx
      .reply("Please select an option ..", {
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
      })
      .then((sentMessage) => {
        ctx.session.lastMessageId = sentMessage.message_id;
      });
  });

  scene.action("back", (ctx) => {
    ctx.scene.enter("start");
  });
  scene.action("proceed", (ctx) => {
    ctx.scene.enter("deployerScene");
  });
};
