import { NextRequest } from "next/server";
import { proxyToBackend } from "../_backend-proxy";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return proxyToBackend(req, "/api/alumni-csv-uploads/");
}

export async function POST(req: NextRequest) {
  return proxyToBackend(req, "/api/alumni-csv-uploads/");
}
