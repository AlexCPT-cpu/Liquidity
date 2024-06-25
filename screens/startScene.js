function startScene(scene) {
  scene.enter((ctx) => {
    ctx.reply(
      "Please provide all the required information.\n\n❔ <b>Deployer wallet:</b> \n❔ <b>Buyer wallet:</b> \n\n❔ <b>Market ID:</b> \n❔ <b>Base token:</b>  \n❔ <b>Quote token:</b>  \n❔ <b>Initial base token liquidity:</b> \n❔ <b>Initial quote token liquidity:</b> \n❔ <b>Token to buy/snipe:</b>  \n❔ <b>Buy amount:</b>",
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "➕ Deployer wallet", callback_data: "deployer" },
              {
                text: "➕ Buyer Wallet",
                callback_data: "buyer",
              },
            ],
            [
              {
                text: "➕ Market ID",
                callback_data: "market",
              },
            ],
            [
              {
                text: "➕ Initial base token liquidity",
                callback_data: "basetoken",
              },
              {
                text: "➕ Initial quote token liquidity",
                callback_data: "quotetoken",
              },
            ],
            [
              {
                text: "➕ Token to buy/snipe",
                callback_data: "buysnipe",
              },
            ],
            [
              {
                text: "➕ Buy amount",
                callback_data: "buyamt",
              },
            ],
            [
              { text: "🔄 Reset", callback_data: "reset" },
              { text: "➡️ Next", callback_data: "next" },
            ],
          ],
        },
        parse_mode: "HTML",
      }
    );
  });
  scene.action("buyer", (ctx) => {
    ctx.scene.enter("buyerScene");
  });
  scene.action("deployer", (ctx) => {
    ctx.scene.enter("deployerScene");
  });
  scene.action("market", (ctx) => {
    ctx.scene.enter("marketScene");
  });
  scene.action("basetoken", (ctx) => {
    ctx.scene.enter("baseTokenScene");
  });
  scene.action("quotetoken", (ctx) => {
    ctx.scene.enter("quoteTokenScene");
  });
  scene.action("buysnipe", (ctx) => {
    ctx.scene.enter("buysnipeScene");
  });
  scene.action("buyamt", (ctx) => {
    ctx.scene.enter("buyScene");
  });
  scene.action("reset", (ctx) => {
    ctx.scene.enter("resetScene");
  });
  scene.action("next", (ctx) => {
    ctx.scene.enter("nextScene");
  });
}

export default startScene;
