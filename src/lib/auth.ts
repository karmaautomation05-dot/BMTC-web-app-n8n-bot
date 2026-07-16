import { NextRequest, NextResponse } from "next/server";

export function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const adminToken = process.env.ADMIN_TOKEN || "admin";

  if (!token || token !== adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
