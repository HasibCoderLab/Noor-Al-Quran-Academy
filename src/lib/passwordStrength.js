const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty",
  "qwerty123",
  "abc123",
  "letmein",
  "admin",
  "welcome",
  "monkey",
  "iloveyou",
  "123123",
  "111111",
  "000000",
  "test",
  "guest",
  "dragon",
]);

const LABEL_PERCENTAGE = {
  weak: 25,
  medium: 50,
  strong: 75,
  "very-strong": 100,
};

export function getPasswordStrength(password) {
  const value = password || "";
  if (!value) {
    return { score: 0, label: null, percentage: 0 };
  }

  let score = 0;

  if (value.length >= 8) score += 1;
  if (value.length >= 10) score += 1;
  if (value.length >= 12) score += 1;
  if (value.length >= 14) score += 1;

  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  const lower = value.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) score = Math.min(score, 2);
  if (/^[a-z]+$/.test(lower)) score = Math.min(score, 2);
  if (/^\d+$/.test(value)) score = Math.min(score, 2);

  let label;
  if (value.length < 8 || score <= 2) label = "weak";
  else if (score <= 4) label = "medium";
  else if (score <= 6) label = "strong";
  else label = "very-strong";

  return {
    score,
    label,
    percentage: LABEL_PERCENTAGE[label],
  };
}
