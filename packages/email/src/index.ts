import { Resend } from "resend";

// ─── Client factory ───────────────────────────────────────────────────────────

export function createEmailClient(apiKey: string): Resend {
  return new Resend(apiKey);
}

// ─── Generic send helper ──────────────────────────────────────────────────────

export async function sendEmail(params: {
  client: Resend;
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const { client, ...rest } = params;
  const { error } = await client.emails.send(rest);
  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// ─── EasyBiscuit email templates ──────────────────────────────────────────────

export interface EasyBiscuitEmailConfig {
  from: string;
  appUrl: string;
}

export async function sendEasyBiscuitWelcomeEmail(
  client: Resend,
  config: EasyBiscuitEmailConfig,
  to: string,
  firstName: string
): Promise<void> {
  await sendEmail({
    client,
    from: config.from,
    to,
    subject: "Welcome to EasyBiscuit 🍪",
    html: buildWelcomeHtml({ firstName, appUrl: config.appUrl }),
  });
}

export async function sendEasyBiscuitProUpgradeEmail(
  client: Resend,
  config: EasyBiscuitEmailConfig,
  to: string,
  firstName: string
): Promise<void> {
  await sendEmail({
    client,
    from: config.from,
    to,
    subject: "You're on Pro — here's what's unlocked",
    html: buildProUpgradeHtml({ firstName, appUrl: config.appUrl }),
  });
}

export async function sendEasyBiscuitPaymentFailedEmail(
  client: Resend,
  config: EasyBiscuitEmailConfig,
  to: string,
  firstName: string
): Promise<void> {
  await sendEmail({
    client,
    from: config.from,
    to,
    subject: "Action needed: payment issue with EasyBiscuit Pro",
    html: buildPaymentFailedHtml({ firstName, appUrl: config.appUrl }),
  });
}

export async function sendEasyBiscuitCancelledEmail(
  client: Resend,
  config: EasyBiscuitEmailConfig,
  to: string,
  firstName: string
): Promise<void> {
  await sendEmail({
    client,
    from: config.from,
    to,
    subject: "Your Pro subscription has ended",
    html: buildCancelledHtml({ firstName, appUrl: config.appUrl }),
  });
}

// ─── HTML template builders ───────────────────────────────────────────────────

function buildWelcomeHtml(data: { firstName: string; appUrl: string }): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to EasyBiscuit</title></head>
<body style="font-family:Inter,sans-serif;background:#FAFAF7;color:#1E293B;padding:40px 20px;max-width:600px;margin:0 auto">
  <h1 style="color:#D97706;font-size:28px;margin-bottom:8px">Welcome to EasyBiscuit, ${data.firstName}! 🍪</h1>
  <p style="color:#64748B;font-size:16px;margin-bottom:24px">Every tool your small business actually needs — right in your browser.</p>
  <p style="font-size:15px;line-height:1.6">Here are three tools to start with:</p>
  <ul style="font-size:15px;line-height:1.8">
    <li><a href="${data.appUrl}/tools/business/invoice-generator" style="color:#D97706">Invoice Generator</a> — Create a professional PDF invoice in seconds</li>
    <li><a href="${data.appUrl}/tools/business/qr-code-generator" style="color:#D97706">QR Code Generator</a> — Generate QR codes for your business</li>
    <li><a href="${data.appUrl}/tools/calculators/vat-calculator" style="color:#D97706">VAT Calculator</a> — Quick tax calculations</li>
  </ul>
  <a href="${data.appUrl}/dashboard" style="display:inline-block;background:#D97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px">Go to Dashboard</a>
</body>
</html>`;
}

function buildProUpgradeHtml(data: { firstName: string; appUrl: string }): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>You're on Pro</title></head>
<body style="font-family:Inter,sans-serif;background:#FAFAF7;color:#1E293B;padding:40px 20px;max-width:600px;margin:0 auto">
  <h1 style="color:#D97706;font-size:28px;margin-bottom:8px">You're on Pro, ${data.firstName}! 🎉</h1>
  <p style="font-size:15px;line-height:1.6;margin-bottom:16px">Here's what's now unlocked for you:</p>
  <ul style="font-size:15px;line-height:1.8">
    <li>Unlimited uses on all tools</li>
    <li>Batch invoice processing (up to 50 invoices at once)</li>
    <li>Saved client profiles &amp; invoice templates</li>
    <li>Upload files up to 100MB</li>
  </ul>
  <a href="${data.appUrl}/dashboard" style="display:inline-block;background:#D97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px">Go to Dashboard</a>
</body>
</html>`;
}

function buildPaymentFailedHtml(data: { firstName: string; appUrl: string }): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Payment issue</title></head>
<body style="font-family:Inter,sans-serif;background:#FAFAF7;color:#1E293B;padding:40px 20px;max-width:600px;margin:0 auto">
  <h1 style="color:#DC2626;font-size:24px;margin-bottom:8px">Action needed: payment issue</h1>
  <p style="font-size:15px;line-height:1.6">Hi ${data.firstName}, we had trouble processing your EasyBiscuit Pro payment. Please update your payment details to keep your Pro access.</p>
  <a href="${data.appUrl}/dashboard/billing" style="display:inline-block;background:#D97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px">Update Payment Details</a>
</body>
</html>`;
}

function buildCancelledHtml(data: { firstName: string; appUrl: string }): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Subscription ended</title></head>
<body style="font-family:Inter,sans-serif;background:#FAFAF7;color:#1E293B;padding:40px 20px;max-width:600px;margin:0 auto">
  <h1 style="color:#475569;font-size:24px;margin-bottom:8px">Your Pro subscription has ended</h1>
  <p style="font-size:15px;line-height:1.6">Hi ${data.firstName}, your EasyBiscuit Pro subscription is now inactive. You can still use all free tools — just with the standard daily limits.</p>
  <a href="${data.appUrl}/pricing" style="display:inline-block;background:#D97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px">Resubscribe to Pro</a>
</body>
</html>`;
}
