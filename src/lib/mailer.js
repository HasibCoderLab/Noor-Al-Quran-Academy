import nodemailer from "nodemailer";

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
}

export async function sendMail({ to, subject, html, text }) {
  if (!isEmailConfigured()) {
    console.log(
      `[mail:dev] (SMTP not configured — logging instead)\n  To: ${to}\n  Subject: ${subject}\n  ${String(
        text || ""
      ).replace(/\n/g, "\n  ")}`
    );
    return { delivered: false, dev: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  });

  return { delivered: true, dev: false };
}
