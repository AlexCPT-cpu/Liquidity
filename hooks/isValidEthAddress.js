import Web3 from "web3";

export default function isValidEthAddress(address) {
  const web3 = new Web3();
  // Check if the address starts with '0x' and has the correct length
  if (!address.startsWith("0x") || address.length !== 42) {
    return false;
  }

  // Check if the address is a valid hexadecimal string
  const hexRegex = /^0x[0-9a-fA-F]{40}$/;
  if (!hexRegex.test(address)) {
    return false;
  }

  // Validate checksum
  if (!web3.isAddress(address)) {
    return false;
  }

  // All checks passed
  return true;
}
