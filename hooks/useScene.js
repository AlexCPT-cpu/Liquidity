import { buyerScene } from "../screens/manager/buyerScene.js";
import { deployerScene } from "../screens/manager/deployerScene.js";
import { marketScene } from "../screens/manager/marketScene.js";
import { baseTokenScene } from "../screens/manager/baseTokenScene.js";
import { quoteTokenScene } from "../screens/manager/quoteTokenScene.js";
import { buySnipe } from "../screens/manager/buySnipe.js";
import { buy } from "../screens/manager/buy.js";
import { reset } from "../screens/manager/reset.js";
import { next } from "../screens/manager/next.js";

function useScene() {
  const sceneHandlers = {
    buyer: buyerScene,
    deployer: deployerScene,
    market: marketScene,
    basetoken: baseTokenScene,
    quotetoken: quoteTokenScene,
    buysnipe: buySnipe,
    buy: buy,
    reset: reset,
    next: next,
  };

  return sceneHandlers;
}

export default useScene;
