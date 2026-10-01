import { SITE } from "../data/siteData";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout({ heading, bodyParagraphs, ctaLabel, ctaUrl, footerNote }) {
  const button = ctaUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td style="border-radius:8px;background:#0f766e">
        <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:12px 28px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px">${escapeHtml(ctaLabel)}</a>
      </td></tr></table>
      <p style="font-family:Arial,sans-serif;font-size:13px;color:#64748b;word-break:break-all">Or paste this link into your browser:<br>${escapeHtml(ctaUrl)}</p>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f1f5f9">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden" cellpadding="0" cellspacing="0">
          <tr><td style="background:#0f766e;padding:24px 32px;text-align:center">
             <p style="margin:0;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#ffffff">🌙 ${escapeHtml(SITE.name)}</p>
          </td></tr>
           <tr><td style="padding:32px">
            <h1 style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:22px;color:#0f172a">${escapeHtml(heading)}</h1>
            ${bodyParagraphs
              .map(
                (p) =>
                  `<p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#334155">${escapeHtml(p)}</p>`
              )
              .join("\n            ")}
            ${button}
            <p style="margin:24px 0 0;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#94a3b8">${escapeHtml(footerNote)}</p>
          </td></tr>
          <tr><td style="background:#f8fafc;padding:20px 32px;text-align:center">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#94a3b8">© ${new Date().getFullYear()} ${escapeHtml(SITE.name)} · ${escapeHtml(SITE.location || "")}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function verificationEmail({ name, url }) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const text = `${greeting}\n\nWelcome to ${SITE.name}! Please confirm your email address to activate your account.\n\n${url}\n\nThis link expires in 24 hours. If you didn't create an account, you can safely ignore this email.`;
  const html = layout({
    heading: "Confirm your email",
    bodyParagraphs: [
      greeting,
      `Welcome to <strong>${SITE.name}</strong>! Please confirm your email address to activate your account.`,
      "The link below is single-use and expires in <strong>24 hours</strong>.",
    ],
    ctaLabel: "Verify my email",
    ctaUrl: url,
    footerNote:
      "If you didn't create an account with us, you can safely ignore this email.",
  });
  return { subject: `Confirm your email — ${SITE.name}`, text, html };
}

export function passwordResetEmail({ name, url }) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const text = `${greeting}\n\nWe received a request to reset your ${SITE.name} password.\n\n${url}\n\nThis link can be used once and expires in 30 minutes. If you didn't request this, you can safely ignore this email.`;
  const html = layout({
    heading: "Reset your password",
    bodyParagraphs: [
      greeting,
      `We received a request to reset your <strong>${SITE.name}</strong> password.`,
      'The link below is single-use and expires in <strong>30 minutes</strong>.',
    ],
    ctaLabel: "Choose a new password",
    ctaUrl: url,
    footerNote:
      "If you didn't request a password reset, you can safely ignore this email. Your password has not changed.",
  });
  return { subject: `Reset your password — ${SITE.name}`, text, html };
}
