import { readUserData, writeUserData } from "..";

const updateData = (userId, data) => {
  const userData = readUserData();
  if (!userData.users[userId]) {
    userData.users[userId] = { tokens: [] };
  }

  const tokenIndex = userData.users[userId].tokens.findIndex(
    (token) => token.address === newToken.address
  );

  if (tokenIndex !== -1) {
    // Update existing token
    userData.users[userId].tokens[tokenIndex] = newToken;
  } else {
    // Add new token
    userData.users[userId].tokens.push(newToken);
  }

  writeUserData(userData);
};

export default updateData;
