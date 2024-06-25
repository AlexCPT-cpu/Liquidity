import { provider } from "./providers.js";

const isContract = async (address) => {
  try {
    const code = await provider.getCode(address);
    return code !== "0x";
  } catch (error) {
    console.error("Error checking contract address:", error);
    return false;
  }
};

export default isContract;
