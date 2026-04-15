import { NextRequest } from "next/server";
import { proxyToBackend } from "../../_backend-proxy";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return proxyToBackend(req, "/api/id-requests/import/");
}
