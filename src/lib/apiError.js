const CODE_KEYS = {
  INVALID_BODY: "errors.invalidBody",
  RATE_LIMITED: "errors.rateLimited",
  EMAIL_EXISTS: "errors.emailExists",
  INVALID_CREDENTIALS: "errors.invalidCredentials",
  EMAIL_NOT_VERIFIED: "errors.emailNotVerified",
  INVALID_TOKEN: "errors.invalidToken",
  EXPIRED_TOKEN: "errors.expiredToken",
  INVALID_PASSWORD: "errors.invalidPassword",
  WEAK_PASSWORD: "errors.weakPassword",
  NOT_AUTHENTICATED: "errors.unauthorized",
  GENERIC: "errors.generic",
  EMAIL_UNAVAILABLE: "errors.emailUnavailable",
};

export function errorCodeKey(code) {
  return CODE_KEYS[code] || null;
}

export function errorMessage(t, result, fallbackKey) {
  const key = result?.code ? CODE_KEYS[result.code] : null;
  if (key) return t(key);
  if (result?.error) return result.error;
  return t(fallbackKey || "errors.generic");
}
