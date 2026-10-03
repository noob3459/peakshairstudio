"use server";
import { redirect } from "next/navigation";
import { authConfigured, clientKey, startSession, verifyOwner } from "@/lib/auth";
import { clearRateLimit, hitRateLimit } from "@/lib/db";

export type LoginState = { error?: string; email?: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  if (!authConfigured()) return { error: "Sign-in isn’t set up yet. See the setup steps in the project README." };
  const key = await clientKey("login");
  try {
    if ((await hitRateLimit(key, 900)) > 8) return { error: "Too many attempts. Wait 15 minutes and try again." };
  } catch {
    return { error: "Sign-in is temporarily unavailable." };
  }
  const email = String(form.get("email") ?? "").slice(0, 200);
  const password = String(form.get("password") ?? "").slice(0, 200);
  if (!verifyOwner(email, password)) return { error: "That email and password don’t match.", email };
  await clearRateLimit(key);
  await startSession();
  redirect("/admin");
}
