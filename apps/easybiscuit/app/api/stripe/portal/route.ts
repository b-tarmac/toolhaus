import { NextResponse } from "next/server";
import { getProUser } from "@/lib/pro-auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://easybiscuit.co";

export async function POST() {
  const auth = await getProUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const result = await db.execute({
      sql: "SELECT stripe_customer_id FROM users WHERE clerk_id = ?",
      args: [auth.clerkId],
    });

    const customerId = result.rows[0]?.stripe_customer_id as string | undefined;
    if (!customerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
