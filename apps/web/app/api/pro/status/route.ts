import { NextResponse } from "next/server";
import { getProUserFromRequest } from "@/lib/pro-auth";

export async function GET(req: Request) {
  const auth = await getProUserFromRequest(req);
  return NextResponse.json({
    isPro: auth.ok,
  });
}
