import nodemailer from "nodemailer";

import { smtpConfigured } from "./config.js";

let transporter = null;
let transporterKey = null;

export function isEmailConfigured() {
  return smtpConfigured();
}

export function validateSmtpConfig() {
  const errors = [];

  if (!process.env.SMTP_HOST) {
    errors.push("SMTP_HOST is required");
  }
  if (!process.env.SMTP_USER) {
    errors.push("SMTP_USER is required");
  }
  if (!process.env.SMTP_PASS) {
    errors.push("SMTP_PASS is required");
  }

  const port = Number(process.env.SMTP_PORT || 587);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    errors.push("SMTP_PORT must be a valid port number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function smtpFrom() {
  return process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER;
}

function smtpOptions() {
  const port = Number(process.env.SMTP_PORT || 587);
  const secureOverride = process.env.SMTP_SECURE;
  const secure =
    secureOverride === "true" || secureOverride === "false"
      ? secureOverride === "true"
      : port === 465;

  return {
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
}

function getTransporter() {
  const options = smtpOptions();
  const key = `${options.host}|${options.port}|${options.secure}|${options.auth.user}`;
  if (!transporter || key !== transporterKey) {
    transporter = nodemailer.createTransport(options);
    transporterKey = key;
  }
  return transporter;
}

function devLog({ to, subject, text }) {
  const redacted = String(text || "").replace(
    /(token=)[^&\s]+/g,
    "$1[redacted]"
  );
  console.log(
    `[mail:dev] (SMTP not configured — logging instead)\n  To: ${to}\n  Subject: ${subject}\n  ${redacted.replace(
      /\n/g,
      "\n  "
    )}`
  );
}

export async function sendMail({ to, subject, html, text }) {
  if (!isEmailConfigured()) {
    devLog({ to, subject, text });
    return { delivered: false, dev: true };
  }

  await getTransporter().sendMail({
    from: smtpFrom(),
    to,
    subject,
    html,
    text,
  });

  return { delivered: true, dev: false };
}
