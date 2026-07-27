import "server-only";
import { createHash, timingSafeEqual } from "crypto";

/** httpOnly cookie holding a hash of the admin password — never the password itself. */
export const ADMIN_COOKIE = "pg_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** The token we expect in the cookie for an authenticated admin, or null if unconfigured. */
export function expectedAdminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return hash(pw);
}

/** Constant-time check that a submitted password matches the configured one. */
export function passwordMatches(password: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(hash(password));
  const b = Buffer.from(hash(pw));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Whether a cookie value proves the admin authenticated. */
export function cookieIsValid(cookieValue: string | undefined): boolean {
  const expected = expectedAdminToken();
  if (!expected || !cookieValue) return false;
  const a = Buffer.from(cookieValue);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
