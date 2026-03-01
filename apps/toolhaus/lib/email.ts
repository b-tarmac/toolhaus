import {
  createEmailClient,
  sendToolhausFreeSignupWelcomeEmail,
  sendToolhausProUpgradeEmail,
  sendToolhausProCancellationEmail,
  sendToolhausApiRateLimitEmail,
  sendToolhausPaymentFailedEmail,
} from "@portfolio/email";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://toolhaus.dev";
const fromEmail = process.env.RESEND_FROM || "Toolhaus <hello@toolhaus.dev>";

function getEmailClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return createEmailClient(key);
}

const config = { from: fromEmail, appUrl };

export async function sendFreeSignupWelcome(to: string, firstName: string): Promise<void> {
  const client = getEmailClient();
  if (!client) return;
  await sendToolhausFreeSignupWelcomeEmail(client, config, to, firstName);
}

export async function sendProUpgradeWelcome(to: string, firstName: string): Promise<void> {
  const client = getEmailClient();
  if (!client) return;
  await sendToolhausProUpgradeEmail(client, config, to, firstName);
}

export async function sendProCancellation(to: string, firstName: string): Promise<void> {
  const client = getEmailClient();
  if (!client) return;
  await sendToolhausProCancellationEmail(client, config, to, firstName);
}

export async function sendApiRateLimitHit(to: string, firstName: string): Promise<void> {
  const client = getEmailClient();
  if (!client) return;
  await sendToolhausApiRateLimitEmail(client, config, to, firstName);
}

export async function sendPaymentFailed(to: string, firstName: string): Promise<void> {
  const client = getEmailClient();
  if (!client) return;
  await sendToolhausPaymentFailedEmail(client, config, to, firstName);
}
