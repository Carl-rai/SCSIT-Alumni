import { NextRequest } from "next/server";
import { proxyToBackend } from "../../../_backend-proxy";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(req, `/api/alumni-csv-uploads/${id}/open/`);
}
