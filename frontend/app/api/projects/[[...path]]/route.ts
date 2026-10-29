import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function proxy(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await context.params;
  if (path.length > 1 || (path.length === 1 && !/^[0-9a-f-]{36}$/i.test(path[0]))) {
    return NextResponse.json({ detail: "Invalid project ID" }, { status: 422 });
  }
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL ?? "http://localhost:8010"}/api/projects${path.length ? `/${path[0]}` : ""}${request.nextUrl.search}`,
      { method: request.method, headers: { "Content-Type": "application/json" },
        body: ["POST", "PATCH"].includes(request.method) ? await request.text() : undefined,
        cache: "no-store", signal: AbortSignal.timeout(8000) },
    );
    if (response.status === 204) return new NextResponse(null, { status: 204 });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ detail: "Projects service unavailable. Please try again." }, { status: 503 });
  }
}

export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
