import { NextResponse } from "next/server";
import { isLiveProviderConfigured } from "@/server/providers/openai.provider";

export async function GET() {
  return NextResponse.json({
    ok: true,
    liveMode: isLiveProviderConfigured(),
    demoMode: true,
    timestamp: new Date().toISOString(),
  });
}
