import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/controllers/authController";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const result = await loginUser(username, password);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  const response = NextResponse.json({
    message: result.message,
    id: result.id,
    username: result.username,
  });

  // Detecta si estás bajo HTTPS real:
  const isHttps = req.nextUrl.protocol === "https:";
  response.cookies.set("auth_token", result.token!, {
    httpOnly: true,
    path: "/",
    secure: isHttps,         // true solo si HTTPS
    sameSite: "lax",         // Lax funciona en GET/POST same-origin
    maxAge: 60 * 60 * 24,    // 1 día
  });

  return response;
}
