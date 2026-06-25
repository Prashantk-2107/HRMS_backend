import redisConnection from "../../config/redisConfig.js";

const SETUP_TOKEN_TTL = 24 * 60 * 60; // 24 hours in seconds

const getSetupTokenKey = (email) => `setup_token:${email}`;

export async function saveSetupToken(email, token) {
  const key = getSetupTokenKey(email);
  await redisConnection.set(key, token, "EX", SETUP_TOKEN_TTL);
}

export async function getSetupToken(email) {
  const key = getSetupTokenKey(email);
  return await redisConnection.get(key);
}

export async function deleteSetupToken(email) {
  const key = getSetupTokenKey(email);
  await redisConnection.del(key);
}
