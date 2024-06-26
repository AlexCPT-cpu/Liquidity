import { ethers } from "ethers";

const isValidPrivateKey = (privateKey) => {
  /**
   * Validates an Ethereum private key.
   * @param {string} privateKey - The private key to validate.
   * @returns {boolean} - True if the private key is valid, false otherwise.
   */

  // Add '0x' prefix if it is not present
  if (!privateKey.startsWith("0x")) {
    privateKey = "0x" + privateKey;
  }

  // Check if the private key has the correct length (66 characters with '0x' prefix)
  if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
    return false;
  }

  try {
    // Attempt to create a wallet with the private key
    const wallet = new ethers.Wallet(privateKey);
    // If no error is thrown, the private key is valid
    return true;
  } catch (error) {
    // If an error is thrown, the private key is invalid
    return false;
  }
};

export default isValidPrivateKey;
