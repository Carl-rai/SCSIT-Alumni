import { NextRequest } from "next/server";
import { proxyToBackend } from "../../../_backend-proxy";

export const runtime = "nodejs";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  return proxyToBackend(req, `/api/alumni-csv-uploads/${context.params.id}/open/`);
}
