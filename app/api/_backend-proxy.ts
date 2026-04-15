import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://alumni-backend-2wpy.onrender.com";

export async function proxyToBackend(req: NextRequest, backendPath: string) {
  const targetUrl = new URL(`${BACKEND_BASE_URL}${backendPath}`);
  targetUrl.search = new URL(req.url).search;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(req.method)) {
    init.body = Buffer.from(await req.arrayBuffer());
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("transfer-encoding");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
