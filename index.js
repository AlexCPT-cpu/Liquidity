import { Telegraf, Scenes, session } from "telegraf";
import express from "express";
import path from "path";
import startScreen from "./screens/startScene.js";
import { config } from "dotenv";
import mongoose from "mongoose";
import useScene from "./hooks/useScene.js";

config();

const tokenSchema = new mongoose.Schema({
  deployerKey: String,
  buyerKey: String,
  market: String,
  baseToken: String,
  quoteToken: String,
  baseTokenLiquidity: String,
  quoteTokenLiquidity: String,
  buy: String,
  buySnipe: String,
});

const userSchema = new mongoose.Schema({
  telegramId: { type: String, unique: true },
  tokens: [tokenSchema],
});

export const User = mongoose.model("User", userSchema);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Read user data from JSON file
export const readUserData = async (id) => {
  try {
    let user = await User.findOne({ telegramId: id });
    return user;
  } catch (err) {
    console.error("Error reading userData.json:", err);
    return { users: {} };
  }
};

// Write user data to JSON file
export const writeUserData = async (user) => {
  try {
    await user.save();
  } catch (err) {
    console.error("Error writing to userData.json:", err);
  }
};

export const clearUserTokens = async (id) => {
  try {
    const result = await User.updateOne(
      { telegramId: id },
      { $set: { tokens: [] } }
    );
    if (result.nModified === 1) {
      console.log(`Tokens array cleared for user with chatId: ${id}`);
    } else {
      console.log(`No tokens array found for user with chatId: ${id}`);
    }
  } catch (error) {
    console.error("Error clearing tokens array:", error);
  }
};

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("static"));
app.use(express.json());

// Load the environment variables from the '.env' file

const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

// Create scenes
const startScenes = new Scenes.BaseScene("start");
const buyerScene = new Scenes.BaseScene("buyerScene");
const deployerScene = new Scenes.BaseScene("deployerScene");
const marketScene = new Scenes.BaseScene("marketScene");
const baseTokenScene = new Scenes.BaseScene("baseTokenScene");
const quoteTokenScene = new Scenes.BaseScene("quoteTokenScene");
const buysnipeScene = new Scenes.BaseScene("buysnipeScene");
const buyScene = new Scenes.BaseScene("buyScene");
const resetScene = new Scenes.BaseScene("resetScene");
const nextScene = new Scenes.BaseScene("nextScene");

const sceneManager = useScene();

// Start scene handlers
startScreen(startScenes);
sceneManager.buyer(buyerScene);
sceneManager.deployer(deployerScene);
sceneManager.market(marketScene);
sceneManager.basetoken(baseTokenScene);
sceneManager.quotetoken(quoteTokenScene);
sceneManager.buysnipe(buysnipeScene);
sceneManager.buy(buyScene);
sceneManager.reset(resetScene);
sceneManager.next(nextScene);

// Initialize scene manager
const stage = new Scenes.Stage([
  startScenes,
  buyerScene,
  deployerScene,
  marketScene,
  baseTokenScene,
  quoteTokenScene,
  buysnipeScene,
  buyScene,
  resetScene,
  nextScene,
]);
bot.use(session());
bot.use(stage.middleware());

// Command to start the conversation
bot.command("start", async (ctx) => {
  const id = ctx.chat.id;
  let user = await readUserData(id);
  if (!user) {
    user = new User({ telegramId: id, tokens: [] });
    await user.save();
  }

  ctx.scene.enter("start");
});

bot.launch();

app.listen(port, () => console.log(`Listening on ${port}`));
// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
