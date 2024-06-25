import bn from "bn.js";

const isValidPrivateKey = (privateKey) => {
  // Check if the input is a string
  if (typeof privateKey !== "string") {
    return false;
  }

  // Remove the '0x' prefix if present
  if (privateKey.startsWith("0x")) {
    privateKey = privateKey.slice(2);
  }

  // Check if the length is exactly 64 characters
  if (privateKey.length !== 64) {
    return false;
  }

  // Check if the string is a valid hexadecimal
  const hexRegex = /^[0-9a-fA-F]+$/;
  if (!hexRegex.test(privateKey)) {
    return false;
  }

  // Optionally, check if the private key is within the valid range for secp256k1

  const maxPrivateKey = new bn(
    "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
    16
  );
  const keyBn = new bn(privateKey, 16);

  if (keyBn.isZero() || keyBn.gte(maxPrivateKey)) {
    return false;
  }

  // All checks passed
  return true;
};

export default isValidPrivateKey;
