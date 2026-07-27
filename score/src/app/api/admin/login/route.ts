import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  expectedAdminToken,
  passwordMatches,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const adminUrl = new URL("/admin", req.url);

  if (form.get("logout")) {
    const res = NextResponse.redirect(adminUrl, { status: 303 });
    res.cookies.delete(ADMIN_COOKIE);
    return res;
  }

  const token = expectedAdminToken();
  if (!token) {
    adminUrl.searchParams.set("error", "unconfigured");
    return NextResponse.redirect(adminUrl, { status: 303 });
  }

  const password = String(form.get("password") ?? "");
  if (!passwordMatches(password)) {
    adminUrl.searchParams.set("error", "invalid");
    return NextResponse.redirect(adminUrl, { status: 303 });
  }

  const res = NextResponse.redirect(adminUrl, { status: 303 });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
