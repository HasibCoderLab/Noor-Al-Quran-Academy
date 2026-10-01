import { describe, it, expect } from "vitest";
import {
  verificationEmail,
  passwordResetEmail,
} from "../src/lib/emailTemplates.js";

describe("verificationEmail", () => {
  const url =
    "https://example.com/verify-email?token=abc123&email=test%40example.com";

  it("contains the verification link in text and html", () => {
    const { subject, text, html } = verificationEmail({
      name: "Test User",
      url,
    });

    expect(subject).toContain("Confirm your email");
    expect(text).toContain(url);
    expect(html).toContain(url.replace(/&/g, "&amp;"));
  });

  it("includes the user name", () => {
    const { text, html } = verificationEmail({ name: "Test User", url });

    expect(text).toContain("Hi Test User,");
    expect(html).toContain("Hi Test User,");
  });

  it("handles missing name", () => {
    const { text, html } = verificationEmail({ name: "", url });

    expect(text).toContain("Hi,");
    expect(html).toContain("Hi,");
  });

  it("mentions the 24-hour expiry", () => {
    const { text, html } = verificationEmail({ name: "Test User", url });

    expect(text).toContain("24 hours");
    expect(html).toContain("24 hours");
  });

  it("includes a security note", () => {
    const { text, html } = verificationEmail({ name: "Test User", url });

    expect(text).toMatch(/safely ignore/i);
    expect(html).toMatch(/safely ignore/i);
  });

  it("escapes the URL in HTML", () => {
    const trickyUrl = "https://example.com/verify-email?token=<script>";
    const { html } = verificationEmail({ name: "Test", url: trickyUrl });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("passwordResetEmail", () => {
  const url =
    "https://example.com/reset-password?token=abc123&email=test%40example.com";

  it("contains the reset link in text and html", () => {
    const { subject, text, html } = passwordResetEmail({
      name: "Test User",
      url,
    });

    expect(subject).toContain("Reset your password");
    expect(text).toContain(url);
    expect(html).toContain(url.replace(/&/g, "&amp;"));
  });

  it("includes the user name", () => {
    const { text, html } = passwordResetEmail({ name: "Test User", url });

    expect(text).toContain("Hi Test User,");
    expect(html).toContain("Hi Test User,");
  });

  it("handles missing name", () => {
    const { text, html } = passwordResetEmail({ name: "", url });

    expect(text).toContain("Hi,");
    expect(html).toContain("Hi,");
  });

  it("mentions the 30-minute expiry", () => {
    const { text, html } = passwordResetEmail({ name: "Test User", url });

    expect(text).toContain("30 minutes");
    expect(html).toContain("30 minutes");
  });

  it("includes a security note", () => {
    const { text, html } = passwordResetEmail({ name: "Test User", url });

    expect(text).toMatch(/safely ignore/i);
    expect(html).toMatch(/safely ignore/i);
  });

  it("escapes the URL in HTML", () => {
    const trickyUrl = "https://example.com/reset-password?token=<script>";
    const { html } = passwordResetEmail({ name: "Test", url: trickyUrl });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
