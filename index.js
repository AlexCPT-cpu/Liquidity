import { Telegraf, Scenes, session } from "telegraf";
import fs from "fs";
import express from "express";
import path from "path";
import startScreen from "./screens/startScene.js";
import { config } from "dotenv";
import useScene from "./hooks/useScene.js";

// Read user data from JSON file
export const readUserData = () => {
  try {
    const data = fs.readFileSync("data.json", "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading userData.json:", err);
    return { users: {} };
  }
};

// Write user data to JSON file
export const writeUserData = (data) => {
  try {
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing to userData.json:", err);
  }
};

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("static"));
app.use(express.json());

// Load the environment variables from the '.env' file
config();

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
bot.command("start", (ctx) => {
  console.log(ctx.chat.id);
  ctx.scene.enter("start");
});

bot.launch();

app.listen(port, () => console.log(`Listening on ${port}`));
// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
