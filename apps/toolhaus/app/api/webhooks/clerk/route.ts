import { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { sendFreeSignupWelcome } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.created") {
      const user = evt.data as { email_addresses?: { email_address: string }[]; first_name?: string; username?: string };
      const email = user.email_addresses?.[0]?.email_address;
      const firstName = user.first_name || user.username || "there";

      if (email) {
        sendFreeSignupWelcome(email, firstName).catch((e) =>
          console.error("Free signup welcome email failed:", e)
        );
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return Response.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}
