import { readFileSync } from "node:fs";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const { createTransportMock, sendMailMock } = vi.hoisted(() => ({
  createTransportMock: vi.fn(),
  sendMailMock: vi.fn(),
}));

vi.mock("nodemailer", () => ({
  default: { createTransport: createTransportMock },
}));

const TOUCHED = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "SMTP_SECURE",
  "EMAIL_FROM",
];

const ROUTES = [
  "src/app/api/auth/register/route.js",
  "src/app/api/auth/resend-verification/route.js",
  "src/app/api/auth/forgot-password/route.js",
];

let snapshot;
let logSpy;

beforeEach(async () => {
  snapshot = {};
  for (const key of TOUCHED) {
    snapshot[key] = process.env[key];
    delete process.env[key];
  }
  createTransportMock.mockReset();
  sendMailMock.mockReset();
  sendMailMock.mockResolvedValue({ messageId: "test" });
  createTransportMock.mockReturnValue({ sendMail: sendMailMock });
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  vi.resetModules();
});

afterEach(() => {
  for (const key of TOUCHED) {
    if (snapshot[key] === undefined) delete process.env[key];
    else process.env[key] = snapshot[key];
  }
  logSpy.mockRestore();
});

async function loadMailer() {
  return import("../src/lib/mailer.js");
}

function configureSmtp() {
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.SMTP_PORT = "465";
  process.env.SMTP_USER = "resend";
  process.env.SMTP_PASS = "re_secret_value";
  process.env.SMTP_FROM = "Noor <no-reply@example.com>";
}

describe("dependency", () => {
  it("declares nodemailer in dependencies", () => {
    const pkg = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8")
    );
    expect(pkg.dependencies.nodemailer).toBeTruthy();
  });
});

describe("isEmailConfigured", () => {
  it("is false when no SMTP variables are set", async () => {
    const { isEmailConfigured } = await loadMailer();
    expect(isEmailConfigured()).toBe(false);
  });

  it("is false when SMTP_PASS is missing", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    const { isEmailConfigured } = await loadMailer();
    expect(isEmailConfigured()).toBe(false);
  });

  it("is true when host, user and pass are set", async () => {
    configureSmtp();
    const { isEmailConfigured } = await loadMailer();
    expect(isEmailConfigured()).toBe(true);
  });
});

describe("sendMail", () => {
  it("falls back to a dev log instead of sending when unconfigured", async () => {
    const { sendMail } = await loadMailer();
    const result = await sendMail({
      to: "student@example.com",
      subject: "Confirm your email",
      text: "Open https://example.com/verify-email?token=abc123secret&email=a%40b.com",
      html: "<p>hi</p>",
    });

    expect(result).toEqual({ delivered: false, dev: true });
    expect(createTransportMock).not.toHaveBeenCalled();
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("redacts verification tokens from the dev log", async () => {
    const { sendMail } = await loadMailer();
    await sendMail({
      to: "student@example.com",
      subject: "Reset your password",
      text: "Reset: https://example.com/reset-password?token=super-secret-token&email=a%40b.com",
    });

    const logged = logSpy.mock.calls.map((args) => args.join(" ")).join("\n");
    expect(logged).not.toContain("super-secret-token");
    expect(logged).toContain("token=[redacted]");
  });

  it("sends through SMTP using environment variables only", async () => {
    configureSmtp();
    const { sendMail } = await loadMailer();

    const result = await sendMail({
      to: "student@example.com",
      subject: "Confirm your email",
      text: "text",
      html: "<p>html</p>",
    });

    expect(result).toEqual({ delivered: true, dev: false });
    expect(createTransportMock).toHaveBeenCalledTimes(1);
    expect(createTransportMock).toHaveBeenCalledWith({
      host: "smtp.example.com",
      port: 465,
      secure: true,
      auth: { user: "resend", pass: "re_secret_value" },
    });
    expect(sendMailMock).toHaveBeenCalledWith({
      from: "Noor <no-reply@example.com>",
      to: "student@example.com",
      subject: "Confirm your email",
      html: "<p>html</p>",
      text: "text",
    });
  });

  it("uses port 587 without implicit TLS by default", async () => {
    configureSmtp();
    process.env.SMTP_PORT = "587";
    const { sendMail } = await loadMailer();
    await sendMail({ to: "a@b.com", subject: "s", text: "t" });

    expect(createTransportMock.mock.calls[0][0].secure).toBe(false);
  });

  it("honours SMTP_SECURE=true over the port default", async () => {
    configureSmtp();
    process.env.SMTP_PORT = "587";
    process.env.SMTP_SECURE = "true";
    const { sendMail } = await loadMailer();
    await sendMail({ to: "a@b.com", subject: "s", text: "t" });

    expect(createTransportMock.mock.calls[0][0].secure).toBe(true);
  });

  it("reuses one transporter across sends", async () => {
    configureSmtp();
    const { sendMail } = await loadMailer();
    await sendMail({ to: "a@b.com", subject: "s1", text: "t" });
    await sendMail({ to: "c@d.com", subject: "s2", text: "t" });

    expect(createTransportMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to SMTP_USER for the From header when SMTP_FROM is unset", async () => {
    configureSmtp();
    delete process.env.SMTP_FROM;
    const { sendMail } = await loadMailer();
    await sendMail({ to: "a@b.com", subject: "s", text: "t" });

    expect(sendMailMock.mock.calls[0][0].from).toBe("resend");
  });
});

describe("auth routes", () => {
  it.each(ROUTES)("%s uses the centralized mailer", (route) => {
    const source = readFileSync(
      new URL(`../${route}`, import.meta.url),
      "utf8"
    );
    expect(source).toMatch(/from\s+"[^"]*lib\/mailer"/);
    expect(source).toContain("sendMail");
    expect(source).not.toContain("nodemailer");
    expect(source).not.toContain("createTransport");
  });

  it("no API route reads SMTP secrets", () => {
    for (const route of ROUTES) {
      const source = readFileSync(
        new URL(`../${route}`, import.meta.url),
        "utf8"
      );
      expect(source).not.toContain("SMTP_PASS");
      expect(source).not.toContain("SMTP_USER");
    }
  });
});
