import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const SESSION_HOURS = 8;
const prod = process.env.NODE_ENV === "production";
export const COOKIE = prod ? "__Host-ad_session" : "ad_session";

export function authConfigured(): boolean {
  return Boolean(
    process.env.OWNER_EMAIL && process.env.OWNER_PASSWORD_HASH && (process.env.SESSION_SECRET?.length ?? 0) >= 32,
  );
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt:16384:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

// Always does the same amount of work, so a wrong email costs the same time as a wrong password.
const DUMMY = hashPassword("not-the-password");
export function verifyOwner(email: string, password: string): boolean {
  const stored = process.env.OWNER_PASSWORD_HASH ?? DUMMY;
  const [scheme, n, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !n || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, Buffer.from(salt, "base64url"), expected.length, { N: Number(n), r: 8, p: 1 });
  const passwordOk = timingSafeEqual(actual, expected);
  const a = Buffer.from(email.trim().toLowerCase());
  const b = Buffer.from((process.env.OWNER_EMAIL ?? "").trim().toLowerCase());
  const emailOk = a.length === b.length && timingSafeEqual(a, b);
  return passwordOk && emailOk && authConfigured();
}

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET);
// Changing the password hash invalidates every existing session.
const pwVersion = () => createHash("sha256").update(process.env.OWNER_PASSWORD_HASH ?? "").digest("hex").slice(0, 16);

export async function startSession() {
  const token = await new SignJWT({ pwv: pwVersion() })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("owner")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: prod, sameSite: "strict", path: "/", maxAge: SESSION_HOURS * 3600,
  });
}

export async function endSession() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, secure: prod, sameSite: "strict", path: "/", maxAge: 0 });
}

export async function isOwner(): Promise<boolean> {
  if (!authConfigured()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"], subject: "owner" });
    return payload.pwv === pwVersion();
  } catch {
    return false;
  }
}

/** Call at the top of every admin page, server action and admin route handler. */
export async function requireOwner(): Promise<void> {
  if (!(await isOwner())) redirect("/admin/login");
}

/** For route handlers: reject cross-site requests (cookies are SameSite=Strict as well). */
export async function sameOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function clientKey(scope: string): Promise<string> {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(`${scope}:${ip}`).digest("hex");
}
