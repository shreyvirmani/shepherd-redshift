import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  let apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  let mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";
  let cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY || "cb1_599f_1_3c89a0d4011867be9f0f9d8d";

  if (!apiKey) {
    try {
      const candidates = [
        path.resolve(process.cwd(), ".env.local"),
        path.resolve(process.cwd(), "apps/web/.env.local"),
        path.resolve(process.cwd(), "..", ".env.local"),
        path.resolve(process.cwd(), ".env"),
      ];
      for (const envPath of candidates) {
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, "utf-8");
          const match = content.match(/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=([^\r\n#]+)/);
          if (match && match[1]) {
            apiKey = match[1].trim();
            break;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ apiKey, mapId, cartoKey });
}
