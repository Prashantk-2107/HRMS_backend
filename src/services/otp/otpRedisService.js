import redisConnection from "../../config/redisConfig.js";
import { randomUUID } from "crypto";

const OTP_TTL = 30 * 60; // 30 minutes in seconds
const COOLDOWN_TTL = 2 * 60; // 2 minutes in seconds

const getOtpKey = (empId, purpose, tempToken) =>
  `otp:${empId}:${purpose}:${tempToken}`;

const getCooldownKey = (empId, purpose) => `otp_cooldown:${empId}:${purpose}`;

const getActiveTokenKey = (empId, purpose) =>
  `active_otp_token:${empId}:${purpose}`;

/**
 * Stores a hashed OTP in Redis with a 30-minute expiration.
 * @param {string} empId - The employee's unique identifier.
 * @param {string} purpose - The purpose of the OTP (e.g., forget_password, reset_password, create_password).
 * @param {string} hashedOtp - The bcrypt hashed OTP code.
 */
export async function setOtp(empId, purpose, hashedOtp) {
  const tempToken = randomUUID();

  // Clean up any existing active OTP for this employee and purpose
  const activeTokenKey = getActiveTokenKey(empId, purpose);
  const oldToken = await redisConnection.get(activeTokenKey);
  if (oldToken) {
    const oldOtpKey = getOtpKey(empId, purpose, oldToken);
    await redisConnection.del(oldOtpKey);
  }

  const key = getOtpKey(empId, purpose, tempToken);
  const data = JSON.stringify({
    otp_code: hashedOtp,
    is_verified: false,
    attempts: 0,
  });
  await redisConnection.set(key, data, "EX", OTP_TTL);

  // Save the new active token
  await redisConnection.set(activeTokenKey, tempToken, "EX", OTP_TTL);

  return tempToken;
}

/**
 * Retrieves the OTP record from Redis.
 * @param {string} empId - The employee's unique identifier.
 * @param {string} purpose - The purpose of the OTP.
 * @returns {Promise<{otp_code: string, is_verified: boolean} | null>}
 */
export async function getOtp(empId, purpose, tempToken) {
  const key = getOtpKey(empId, purpose, tempToken);
  const data = await redisConnection.get(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse OTP JSON from Redis:", error);
    return null;
  }
}

/**
 * Marks the OTP as verified in Redis, preserving its remaining TTL.
 * @param {string} empId - The employee's unique identifier.
 * @param {string} purpose - The purpose of the OTP.
 * @param {string} hashedOtp - The bcrypt hashed OTP code.
 * @returns {Promise<boolean>} - True if successfully marked as verified, false otherwise.
 */
export async function markOtpVerified(empId, purpose, hashedOtp, tempToken) {
  const key = getOtpKey(empId, purpose, tempToken);
  const ttl = await redisConnection.ttl(key);

  if (ttl <= 0) {
    return false;
  }

  const data = JSON.stringify({
    otp_code: hashedOtp,
    is_verified: true,
  });

  await redisConnection.set(key, data, "EX", ttl);
  return true;
}

/**
 * Deletes the OTP record from Redis.
 * @param {string} empId - The employee's unique identifier.
 * @param {string} purpose - The purpose of the OTP.
 */
export async function deleteOtp(empId, purpose, tempToken) {
  const key = getOtpKey(empId, purpose, tempToken);
  const cooldownKey = getCooldownKey(empId, purpose);
  const activeTokenKey = getActiveTokenKey(empId, purpose);

  await redisConnection.del(key);
  await redisConnection.del(cooldownKey);
  await redisConnection.del(activeTokenKey);
}

/**
 * Sets a 2-minute cooldown for requesting a new OTP.
 * @param {string} empId
 * @param {string} purpose
 */
export async function setOtpCooldown(empId, purpose) {
  const key = getCooldownKey(empId, purpose);
  await redisConnection.set(key, "active", "EX", COOLDOWN_TTL);
}

/**
 * Gets the remaining cooldown time in seconds for the OTP request.
 * @param {string} empId
 * @param {string} purpose
 * @returns {Promise<number>} - Remaining TTL in seconds, or 0 if no cooldown active.
 */
export async function getOtpCooldownTime(empId, purpose) {
  const key = getCooldownKey(empId, purpose);
  const ttl = await redisConnection.ttl(key);
  return ttl > 0 ? ttl : 0;
}

/**
 * Increments the failed attempts counter for an active OTP.
 * Deletes the OTP key if the limit (5) is exceeded.
 * @param {string} empId
 * @param {string} purpose
 * @param {string} tempToken
 * @returns {Promise<number>} - The new attempt count, or 0 if OTP expired.
 */
export async function incrementOtpAttempts(empId, purpose, tempToken) {
  const key = getOtpKey(empId, purpose, tempToken);
  const ttl = await redisConnection.ttl(key);
  if (ttl <= 0) return 0;

  const activeOtp = await getOtp(empId, purpose, tempToken);
  if (!activeOtp) return 0;

  const attempts = (activeOtp.attempts || 0) + 1;
  if (attempts >= 5) {
    await deleteOtp(empId, purpose, tempToken);
    return attempts;
  }

  const data = JSON.stringify({
    otp_code: activeOtp.otp_code,
    is_verified: false,
    attempts,
  });

  await redisConnection.set(key, data, "EX", ttl);
  return attempts;
}
