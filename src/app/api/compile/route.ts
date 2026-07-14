/**
 * POST /api/compile
 * Context compilation endpoint
 * - Validates request with Zod
 * - Routes to Demo or Live provider
 * - Returns validated CanonicalContextPackage
 */
import { NextRequest, NextResponse } from "next/server";
import { CompileRequestSchema } from "@/schemas/request.schema";
import { compileDemo } from "@/server/providers/demo.provider";
import { compileWithLLM, isLiveProviderConfigured } from "@/server/providers/openai.provider";
import { uid } from "@/lib/ids";

export async function POST(req: NextRequest) {
  const requestId = uid("req");
  const start = Date.now();

  // 1. Parse & validate request
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { requestId, error: { code: "INVALID_BODY", message: "Request body is not valid JSON", retryable: false } },
      { status: 400 }
    );
  }

  const parsed = CompileRequestSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return NextResponse.json(
      { requestId, error: { code: "VALIDATION_ERROR", message: msg, retryable: false } },
      { status: 400 }
    );
  }

  const request = parsed.data;

  // 2. Route to appropriate provider
  try {
    if (isLiveProviderConfigured()) {
      const { pkg, repaired } = await compileWithLLM(request);
      return NextResponse.json({
        requestId,
        mode: "live",
        durationMs: Date.now() - start,
        data: pkg,
        meta: { repaired },
      });
    }

    // Demo mode
    const pkg = compileDemo();
    return NextResponse.json({
      requestId,
      mode: "demo",
      durationMs: 0,
      data: pkg,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "INTERNAL_ERROR";
    const retryable = msg.startsWith("MODEL_TIMEOUT") || msg.startsWith("MODEL_HTTP_5");
    return NextResponse.json(
      { requestId, error: { code: msg.split(":")[0] || "INTERNAL_ERROR", message: msg, retryable } },
      { status: 500 }
    );
  }
}
