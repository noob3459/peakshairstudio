// Generates OWNER_PASSWORD_HASH and SESSION_SECRET. Run: npm run owner:setup
// The password is read from the terminal without echo and is never stored or printed.
import { randomBytes, scryptSync } from "node:crypto";
import readline from "node:readline";

function ask(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(prompt)) rl.output.write(s); };
    rl.question(prompt, (a) => { rl.close(); process.stdout.write("\n"); resolve(a); });
  });
}

const pw = await ask("Choose an owner password (min 12 characters): ");
const again = await ask("Repeat the password: ");
if (pw !== again) { console.error("Passwords do not match."); process.exit(1); }
if (pw.length < 12) { console.error("Use at least 12 characters."); process.exit(1); }

const salt = randomBytes(16);
const hash = scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
console.log("\nAdd these to your host's environment variables (Vercel: Project → Settings → Environment Variables),");
console.log("or to .env.local for local development.\n");
console.log(`OWNER_PASSWORD_HASH=scrypt:16384:${salt.toString("base64url")}:${hash.toString("base64url")}`);
console.log(`SESSION_SECRET=${randomBytes(48).toString("base64url")}`);
console.log("\nAlso set OWNER_EMAIL to the address you will sign in with.");
console.log("Changing OWNER_PASSWORD_HASH signs out every existing session.");
