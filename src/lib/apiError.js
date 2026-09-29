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
  SLOT_TAKEN: "errors.slotTaken",
  INVALID_TRANSITION: "errors.invalidTransition",
  NOT_FOUND: "errors.notFound",
  FORBIDDEN: "errors.forbidden",
  DUPLICATE: "admin.availability.duplicate",
  PAST_DATE: "admin.availability.pastDate",
  STRIPE_NOT_CONFIGURED: "errors.paymentNotConfigured",
  STRIPE_ERROR: "errors.generic",
  NOT_ELIGIBLE: "review.notEligible",
  DUPLICATE_REVIEW: "errors.duplicateReview",
  RATING_INVALID: "validation.ratingRequired",
  REVIEW_MIN: "validation.reviewMin",
  REVIEW_MAX: "validation.reviewMax",
  AI_NOT_CONFIGURED: "errors.aiUnavailable",
  AI_RATE_LIMITED: "errors.aiRateLimited",
  AI_FAILED: "errors.aiFailed",
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
