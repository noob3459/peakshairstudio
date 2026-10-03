import { redirect } from "next/navigation";
import { authConfigured, isOwner } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export default async function LoginPage() {
  if (await isOwner()) redirect("/admin");
  const ready = authConfigured();
  return (
    <main className="ad-login-wrap" id="main">
      <h1>Owner sign-in</h1>
      {ready ? <LoginForm /> : (
        <div className="ad-card">
          <p><strong>Sign-in isn’t set up yet.</strong></p>
          <p>Set <code>OWNER_EMAIL</code>, <code>OWNER_PASSWORD_HASH</code> and <code>SESSION_SECRET</code> in the environment. Run <code>npm run owner:setup</code> to generate the last two. See README.md.</p>
        </div>
      )}
    </main>
  );
}
