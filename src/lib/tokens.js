import crypto from "node:crypto";

export function generateToken() {
  const token = crypto.randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function tokensMatch(storedHash, token) {
  if (!storedHash || !token) return false;
  const expected = Buffer.from(storedHash, "utf8");
  const actual = Buffer.from(hashToken(token), "utf8");
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

export function isExpired(date) {
  if (!date) return true;
  return new Date(date).getTime() <= Date.now();
}
