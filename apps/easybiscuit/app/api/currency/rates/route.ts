import { NextResponse } from "next/server";

/** Fetches exchange rates. Uses free exchangerate-api.com (1500 req/month). */
export async function GET() {
  try {
    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("Failed to fetch rates");
    const data = await res.json();
    return NextResponse.json({ rates: data.rates, base: data.base });
  } catch (e) {
    console.error("Currency API error:", e);
    return NextResponse.json(
      { error: "Could not fetch exchange rates" },
      { status: 502 }
    );
  }
}
