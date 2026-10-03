"use client";
import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/login/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="ad-card ad-login">
      {state.error && <div className="notice notice-error" role="alert">{state.error}</div>}
      <div className="ad-field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" className="ad-input" autoComplete="username" defaultValue={state.email} required /></div>
      <div className="ad-field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" className="ad-input" autoComplete="current-password" required /></div>
      <button className="ad-btn ad-primary" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
