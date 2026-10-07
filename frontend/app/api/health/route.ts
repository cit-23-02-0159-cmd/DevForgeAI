import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:8000"}/health`, {
      cache: "no-store", signal: AbortSignal.timeout(5000),
    });
    if (![200, 503].includes(response.status)) throw new Error("Unexpected backend response");
    const health: unknown = await response.json();
    return NextResponse.json(health, { status: response.status });
  } catch {
    return NextResponse.json({ status: "unavailable", service: "DevForge AI API", database: "unknown" }, { status: 503 });
  }
}
