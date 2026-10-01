import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  emailVerificationRequired,
  envReport,
} from "../src/lib/config.js";

process.env.JWT_SECRET = "test-secret-for-email-verification";

const mocks = vi.hoisted(() => ({
  cookieSet: vi.fn(),
  connectDB: vi.fn(async () => {}),
  sendMail: vi.fn(async () => ({ delivered: true, dev: false })),
  isEmailConfigured: vi.fn(() => true),
  findOne: vi.fn(),
  create: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body, init) => ({
      body,
      status: init?.status ?? 200,
      cookies: { set: mocks.cookieSet },
    }),
  },
}));

vi.mock("../src/lib/db.js", () => ({ connectDB: mocks.connectDB }));
vi.mock("../src/lib/mailer.js", () => ({
  sendMail: mocks.sendMail,
  isEmailConfigured: mocks.isEmailConfigured,
}));
vi.mock("../src/models/User.js", () => ({
  default: { findOne: mocks.findOne, create: mocks.create },
}));

vi.mock("../src/lib/tokens.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    tokensMatch: actual.tokensMatch,
    isExpired: actual.isExpired,
  };
});

const FLAG = "EMAIL_VERIFICATION_REQUIRED";
let flagSnapshot;
let ipCounter = 0;
let accountCounter = 0;
let loginPost;
let registerPost;

beforeAll(async () => {
  ({ POST: loginPost } = await import("../src/app/api/auth/login/route.js"));
  ({ POST: registerPost } = await import("../src/app/api/auth/register/route.js"));
});

beforeEach(() => {
  flagSnapshot = process.env[FLAG];
  delete process.env[FLAG];
  mocks.cookieSet.mockClear();
  mocks.sendMail.mockClear();
  mocks.connectDB.mockClear();
  mocks.create.mockReset();
  mocks.create.mockImplementation(async (data) => ({ _id: "user-1", ...data }));
  mocks.findOne.mockReset();
});

afterEach(() => {
  if (flagSnapshot === undefined) delete process.env[FLAG];
  else process.env[FLAG] = flagSnapshot;
});

function makeRequest(body) {
  ipCounter += 1;
  return {
    json: async () => body,
    headers: new Headers({ "x-forwarded-for": `203.0.113.${ipCounter}` }),
    nextUrl: { origin: "https://academy.test" },
  };
}

const PASSWORD = "CorrectHorse1";

function userDoc(overrides = {}) {
  return {
    _id: "user-1",
    name: "Test Student",
    email: "student@academy.test",
    role: "student",
    emailVerified: false,
    tokenVersion: 0,
    comparePassword: async (password) => password === PASSWORD,
    ...overrides,
  };
}

// Every request gets its own IP and login account so the in-memory rate-limit
// buckets (10 per account, 30 per IP) cannot leak between test cases.
function credentials() {
  accountCounter += 1;
  return { email: `student${accountCounter}@academy.test`, password: PASSWORD };
}

function postLogin(user, bodyOverrides = {}) {
  const body = { ...credentials(), ...bodyOverrides };
  // The login route chains .select("+password") onto the findOne query.
  mocks.findOne.mockReturnValue({
    select: () => Promise.resolve(user({ email: body.email })),
  });
  return loginPost(makeRequest(body));
}

describe("emailVerificationRequired flag", () => {
  it("is disabled when the variable is unset", () => {
    expect(emailVerificationRequired()).toBe(false);
  });

  it.each(["false", "FALSE", " no ", "off", "0", ""])(
    "stays disabled for %j",
    (value) => {
      process.env[FLAG] = value;
      expect(emailVerificationRequired()).toBe(false);
    }
  );

  it.each(["true", "TRUE", " yes ", "on", "1"])(
    "is enabled for %j",
    (value) => {
      process.env[FLAG] = value;
      expect(emailVerificationRequired()).toBe(true);
    }
  );

  it("falls back to disabled for an unrecognised value", () => {
    process.env[FLAG] = "ture";
    expect(emailVerificationRequired()).toBe(false);
  });

  it("is reported in the env report with a reminder warning", () => {
    const report = envReport();
    expect(report.features.emailVerification).toBe(false);
    expect(
      report.warnings.some((w) => w.includes("EMAIL_VERIFICATION_REQUIRED"))
    ).toBe(true);
  });

  it("warns about an unrecognised value instead of silently enabling it", () => {
    process.env[FLAG] = "maybe";
    const report = envReport();
    expect(report.features.emailVerification).toBe(false);
    expect(
      report.warnings.some((w) => w.includes("unrecognised value"))
    ).toBe(true);
  });

  it("warns when enabled without SMTP delivery", () => {
    process.env[FLAG] = "true";
    const snapshot = { ...process.env };
    for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]) {
      delete process.env[key];
    }
    try {
      const report = envReport();
      expect(report.features.emailVerification).toBe(true);
      expect(
        report.warnings.some(
          (w) => w.includes("EMAIL_VERIFICATION_REQUIRED") && w.includes("SMTP")
        )
      ).toBe(true);
    } finally {
      for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]) {
        if (snapshot[key] === undefined) delete process.env[key];
        else process.env[key] = snapshot[key];
      }
    }
  });

  it("never leaks the flag value or SMTP secrets to the report", () => {
    process.env[FLAG] = "true";
    const saved = {};
    const smtp = {
      SMTP_HOST: "smtp.example.com",
      SMTP_USER: "user@example.com",
      SMTP_PASS: "super-secret-pass",
      SMTP_FROM: "Noor <no-reply@example.com>",
    };
    for (const [key, value] of Object.entries(smtp)) {
      saved[key] = process.env[key];
      process.env[key] = value;
    }

    try {
      const serialized = JSON.stringify(envReport());
      expect(serialized).not.toContain("super-secret-pass");
      expect(serialized).not.toContain("SMTP_PASS");
    } finally {
      for (const [key, value] of Object.entries(saved)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });
});

describe("POST /api/auth/login with verification disabled", () => {
  it("logs in an unverified account instead of returning EMAIL_NOT_VERIFIED", async () => {
    const response = await postLogin(() => userDoc({ emailVerified: false }));

    expect(response.status).toBe(200);
    expect(response.body.code).toBeUndefined();
    expect(response.body.user.emailVerified).toBe(false);
    expect(mocks.cookieSet).toHaveBeenCalledTimes(1);
    expect(mocks.cookieSet.mock.calls[0][0]).toBe("auth-token");
  });

  it.each(["false", "off", "0", "no"])(
    "keeps the account logged in when the flag is %j",
    async (value) => {
      process.env[FLAG] = value;

      const response = await postLogin(() => userDoc({ emailVerified: false }));

      expect(response.status).toBe(200);
      expect(mocks.cookieSet).toHaveBeenCalledTimes(1);
    }
  );

  it("routes the admin role through the unchanged admin flow", async () => {
    const response = await postLogin(() =>
      userDoc({ emailVerified: false, role: "admin" })
    );

    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe("admin");
  });

  it("still rejects a wrong password with the generic error", async () => {
    const response = await postLogin(() => userDoc({ emailVerified: false }), {
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_CREDENTIALS");
    expect(mocks.cookieSet).not.toHaveBeenCalled();
  });

  it("still rejects an unknown account with the same generic error", async () => {
    const response = await postLogin(() => null);

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_CREDENTIALS");
    expect(mocks.cookieSet).not.toHaveBeenCalled();
  });

  it("keeps rate limiting active while verification is disabled", async () => {
    mocks.findOne.mockReturnValue({
      select: () => Promise.resolve(userDoc({ emailVerified: false })),
    });
    const body = { email: "ratelimit@academy.test", password: PASSWORD };
    const request = () => ({
      json: async () => body,
      headers: new Headers({ "x-forwarded-for": "198.51.100.7" }),
      nextUrl: { origin: "https://academy.test" },
    });

    const responses = [];
    for (let i = 0; i < 31; i += 1) {
      responses.push(await loginPost(request()));
    }

    expect(responses[0].status).toBe(200);
    expect(responses[30].status).toBe(429);
    expect(responses[30].body.code).toBe("RATE_LIMITED");
  });
});

describe("POST /api/auth/login with verification enabled", () => {
  beforeEach(() => {
    process.env[FLAG] = "true";
  });

  it("blocks an unverified account with EMAIL_NOT_VERIFIED", async () => {
    const response = await postLogin(() => userDoc({ emailVerified: false }));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("EMAIL_NOT_VERIFIED");
    expect(mocks.cookieSet).not.toHaveBeenCalled();
  });

  it("lets a verified account through", async () => {
    const response = await postLogin(() => userDoc({ emailVerified: true }));

    expect(response.status).toBe(200);
    expect(mocks.cookieSet).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/auth/register", () => {
  const REGISTRATION = {
    name: "Test Student",
    email: "new.student@academy.test",
    password: "CorrectHorse1",
  };

  it("does not require verification while the flag is disabled", async () => {
    const response = await registerPost(makeRequest(REGISTRATION));

    expect(response.status).toBe(201);
    expect(response.body.requiresVerification).toBe(false);
    expect(response.body.user.emailVerified).toBe(true);
    expect(response.body.devVerificationUrl).toBeUndefined();
  });

  it("skips the verification email while the flag is disabled", async () => {
    await registerPost(makeRequest(REGISTRATION));

    expect(mocks.sendMail).not.toHaveBeenCalled();
    const created = mocks.create.mock.calls[0][0];
    expect(created.emailVerifyTokenHash).toBeUndefined();
    expect(created.emailVerifyExpires).toBeUndefined();
  });

  it("generates no crypto token at all while the flag is disabled", async () => {
    const tokens = await import("../src/lib/tokens.js");
    const spy = vi.spyOn(tokens, "generateToken");

    try {
      await registerPost(makeRequest(REGISTRATION));
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it("stores no pending token so re-enabling cannot lock the account out", async () => {
    await registerPost(makeRequest(REGISTRATION));

    const created = mocks.create.mock.calls[0][0];
    expect(created.emailVerified).toBe(true);
    expect(created.emailVerifyTokenHash).toBeUndefined();
  });

  it("issues a token and a verification email once the flag is enabled", async () => {
    process.env[FLAG] = "true";

    const response = await registerPost(makeRequest(REGISTRATION));

    expect(response.status).toBe(201);
    expect(response.body.requiresVerification).toBe(true);
    expect(response.body.user.emailVerified).toBe(false);
    expect(response.body.emailSent).toBe(true);

    const created = mocks.create.mock.calls[0][0];
    expect(created.emailVerifyTokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(created.emailVerifyExpires).toBeInstanceOf(Date);

    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail.mock.calls[0][0].to).toBe(REGISTRATION.email);
    expect(mocks.sendMail.mock.calls[0][0].html).toContain("/verify-email?token=");
  });

  it("still surfaces a dev verification url when SMTP is unconfigured", async () => {
    process.env[FLAG] = "true";
    mocks.isEmailConfigured.mockReturnValue(false);
    mocks.sendMail.mockResolvedValueOnce({ delivered: false, dev: true });
    const nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    try {
      const response = await registerPost(makeRequest(REGISTRATION));
      expect(response.body.devVerificationUrl).toContain("/verify-email?token=");
    } finally {
      process.env.NODE_ENV = nodeEnv;
      mocks.isEmailConfigured.mockReturnValue(true);
    }
  });

  it("does not fail registration when the verification email cannot be sent", async () => {
    process.env[FLAG] = "true";
    mocks.sendMail.mockRejectedValueOnce(new Error("SMTP unavailable"));

    const response = await registerPost(makeRequest(REGISTRATION));

    expect(response.status).toBe(201);
    expect(response.body.emailSent).toBe(false);
  });

  it("keeps rejecting a duplicate email", async () => {
    mocks.findOne.mockResolvedValue(userDoc());

    const response = await registerPost(makeRequest(REGISTRATION));

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("EMAIL_EXISTS");
  });
});

const REQUIRED_SURFACE = [
  "src/app/verify-email/page.js",
  "src/app/verify-email/layout.js",
  "src/app/api/auth/verify-email/route.js",
  "src/app/api/auth/resend-verification/route.js",
  "src/app/api/auth/forgot-password/route.js",
  "src/app/api/auth/reset-password/route.js",
  "src/lib/mailer.js",
  "src/lib/emailTemplates.js",
  "src/lib/tokens.js",
];

function readSrc(relative) {
  return readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.jsx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

describe("verification surface stays intact", () => {
  it.each(REQUIRED_SURFACE)("keeps %s", (file) => {
    expect(existsSync(new URL(`../${file}`, import.meta.url))).toBe(true);
  });

  it("keeps the EMAIL_NOT_VERIFIED branch in the login route", () => {
    const source = readSrc("src/app/api/auth/login/route.js");
    expect(source).toContain("EMAIL_NOT_VERIFIED");
    expect(source).toMatch(
      /emailVerificationRequired\(\)\s*&&\s*user\.emailVerified === false/
    );
  });

  it("keeps the login 403 behaviour reachable", () => {
    expect(readSrc("src/app/api/auth/login/route.js")).toContain("status: 403");
  });

  it("keeps token hashing, expiry and timing-safe matching in verify-email", () => {
    const source = readSrc("src/app/api/auth/verify-email/route.js");
    expect(source).toContain("tokensMatch");
    expect(source).toContain("isExpired");
    expect(source).toMatch(/emailVerified = true/);
  });

  it("keeps resend-verification issuing a fresh token", () => {
    const source = readSrc("src/app/api/auth/resend-verification/route.js");
    expect(source).toContain("user.emailVerified === false");
    expect(source).toContain("generateToken");
    expect(source).toMatch(/emailVerifyTokenHash = hash/);
    expect(source).toMatch(/emailVerifyExpires = new Date/);
  });

  it("keeps the password reset flow independent of the flag", () => {
    const forgot = readSrc("src/app/api/auth/forgot-password/route.js");
    const reset = readSrc("src/app/api/auth/reset-password/route.js");
    for (const source of [forgot, reset]) {
      expect(source).not.toContain("emailVerificationRequired");
    }
    expect(forgot).toContain("passwordResetTokenHash");
    expect(reset).toContain("tokenVersion");
  });

  it("keeps the centralized mailer as the only transport", () => {
    const source = readSrc("src/lib/mailer.js");
    expect(source).toContain("createTransport");
    expect(source).toContain("SMTP_PASS");
  });

  it("never exposes the flag or SMTP secrets to client code", () => {
    const root = fileURLToPath(new URL("../src", import.meta.url));
    for (const file of walk(root)) {
      const source = readFileSync(file, "utf8");
      if (!/^\s*["']use client["']/.test(source)) continue;
      expect(source).not.toContain("SMTP_PASS");
      expect(source).not.toContain("SMTP_USER");
      expect(source).not.toContain("EMAIL_VERIFICATION_REQUIRED");
      expect(source).not.toMatch(/lib\/config/);
    }
  });
});

describe("full email verification flow", () => {
  const REGISTRATION = {
    name: "Flow Student",
    email: "flow@academy.test",
    password: "CorrectHorse1",
  };

  function mockUserWithTokens(overrides = {}) {
    const user = {
      _id: "flow-user",
      name: REGISTRATION.name,
      email: REGISTRATION.email,
      role: "student",
      emailVerified: false,
      tokenVersion: 0,
      emailVerifyTokenHash: "verify-hash",
      emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      passwordResetTokenHash: "reset-hash",
      passwordResetExpires: new Date(Date.now() + 30 * 60 * 1000),
      save: async function () {},
      ...overrides,
    };
    return user;
  }

  it("register → verify → login succeeds", async () => {
    process.env[FLAG] = "true";

    const registerResponse = await registerPost(makeRequest(REGISTRATION));
    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.requiresVerification).toBe(true);
    expect(registerResponse.body.emailSent).toBe(true);

    const emailHtml = mocks.sendMail.mock.calls[0][0].html;
    const tokenMatch = emailHtml.match(/token=([^&"]+)/);
    const emailMatch = emailHtml.match(/email=([^&"]+)/);
    expect(tokenMatch).toBeTruthy();
    expect(emailMatch).toBeTruthy();

    const user = mockUserWithTokens();
    mocks.findOne.mockReturnValue({
      select: () => Promise.resolve(user),
    });

    const tokensModule = await import("../src/lib/tokens.js");
    const originalMatch = tokensModule.tokensMatch;
    const originalExpired = tokensModule.isExpired;
    tokensModule.tokensMatch = () => true;
    tokensModule.isExpired = () => false;

    try {
      const verifyPost = (await import("../src/app/api/auth/verify-email/route.js")).POST;
      const verifyResponse = await verifyPost(
        makeRequest({
          token: decodeURIComponent(tokenMatch[1]),
          email: decodeURIComponent(emailMatch[1]),
        })
      );
      expect(verifyResponse.status).toBe(200);
    } finally {
      tokensModule.tokensMatch = originalMatch;
      tokensModule.isExpired = originalExpired;
    }

    const loginResponse = await postLogin(() =>
      userDoc({ email: REGISTRATION.email, emailVerified: true })
    );
    expect(loginResponse.status).toBe(200);
  });

  it("register → verify → login with old token fails", async () => {
    process.env[FLAG] = "true";

    await registerPost(makeRequest(REGISTRATION));

    const emailHtml = mocks.sendMail.mock.calls[0][0].html;
    const tokenMatch = emailHtml.match(/token=([^&"]+)/);
    const emailMatch = emailHtml.match(/email=([^&"]+)/);

    const user = mockUserWithTokens();
    mocks.findOne.mockReturnValue({
      select: () => Promise.resolve(user),
    });

    const tokensModule = await import("../src/lib/tokens.js");
    const originalMatch = tokensModule.tokensMatch;
    const originalExpired = tokensModule.isExpired;
    tokensModule.tokensMatch = () => true;
    tokensModule.isExpired = () => false;

    try {
      const verifyPost = (await import("../src/app/api/auth/verify-email/route.js")).POST;
      const firstVerify = await verifyPost(
        makeRequest({
          token: decodeURIComponent(tokenMatch[1]),
          email: decodeURIComponent(emailMatch[1]),
        })
      );
      expect(firstVerify.status).toBe(200);
    } finally {
      tokensModule.tokensMatch = originalMatch;
      tokensModule.isExpired = originalExpired;
    }

    const clearedUser = mockUserWithTokens({
      emailVerifyTokenHash: undefined,
      emailVerifyExpires: undefined,
    });
    mocks.findOne.mockReturnValue({
      select: () => Promise.resolve(clearedUser),
    });

    const verifyPost = (await import("../src/app/api/auth/verify-email/route.js")).POST;
    const secondVerify = await verifyPost(
      makeRequest({
        token: decodeURIComponent(tokenMatch[1]),
        email: decodeURIComponent(emailMatch[1]),
      })
    );
    expect(secondVerify.status).toBe(400);
    expect(secondVerify.body.code).toBe("INVALID_TOKEN");
  });

  it("forgot password → reset → login succeeds", async () => {
    process.env[FLAG] = "true";

    const user = mockUserWithTokens();
    mocks.findOne.mockResolvedValue(user);

    const forgotPost = (await import("../src/app/api/auth/forgot-password/route.js")).POST;
    const forgotResponse = await forgotPost(
      makeRequest({ email: REGISTRATION.email })
    );
    expect(forgotResponse.status).toBe(200);
    expect(forgotResponse.body.ok).toBe(true);

    const emailHtml = mocks.sendMail.mock.calls[0][0].html;
    const tokenMatch = emailHtml.match(/token=([^&"]+)/);
    const emailMatch = emailHtml.match(/email=([^&"]+)/);
    expect(tokenMatch).toBeTruthy();
    expect(emailMatch).toBeTruthy();

    const resetUser = mockUserWithTokens();
    mocks.findOne.mockReturnValue({
      select: () => Promise.resolve(resetUser),
    });

    const tokensModule = await import("../src/lib/tokens.js");
    const originalMatch = tokensModule.tokensMatch;
    const originalExpired = tokensModule.isExpired;
    tokensModule.tokensMatch = () => true;
    tokensModule.isExpired = () => false;

    try {
      const resetPost = (await import("../src/app/api/auth/reset-password/route.js")).POST;
      const resetResponse = await resetPost(
        makeRequest({
          token: decodeURIComponent(tokenMatch[1]),
          email: decodeURIComponent(emailMatch[1]),
          password: "NewPassword123",
        })
      );
      expect(resetResponse.status).toBe(200);
      expect(resetResponse.body.ok).toBe(true);
    } finally {
      tokensModule.tokensMatch = originalMatch;
      tokensModule.isExpired = originalExpired;
    }
  });

  it("forgot password always returns ok for non-existing email", async () => {
    mocks.findOne.mockResolvedValue(null);

    const forgotPost = (await import("../src/app/api/auth/forgot-password/route.js")).POST;
    const response = await forgotPost(
      makeRequest({ email: "nonexistent@academy.test" })
    );

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });
});
