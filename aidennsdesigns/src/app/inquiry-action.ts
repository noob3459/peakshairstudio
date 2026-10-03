"use server";
import { hitRateLimit, query } from "@/lib/db";
import { clientKey } from "@/lib/auth";
import { normalizeHref } from "@/lib/content";

export type InquiryState = {
  status: "idle" | "success" | "error";
  errors: Record<string, string>;
  message?: string;
  values?: Record<string, string>;
};

const LIMITS = { name: 100, business: 120, contact: 200, website: 200, about: 1500, goals: 1500, features: 1000 } as const;

export async function submitInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  const get = (k: string) => String(form.get(k) ?? "").replace(/\r\n/g, "\n").trim();
  const values = Object.fromEntries(Object.keys(LIMITS).map((k) => [k, get(k)]));

  // Bots: filled honeypot or a form submitted implausibly fast. Pretend success, store nothing.
  const elapsed = Date.now() - Number(get("t"));
  if (get("company_url") || !(elapsed > 3000)) {
    if (get("company_url")) return { status: "success", errors: {} };
    return { status: "error", errors: {}, message: "That was sent very quickly. Please check your details and try again.", values };
  }

  const errors: Record<string, string> = {};
  for (const [k, max] of Object.entries(LIMITS)) if (values[k].length > max) errors[k] = `Please keep this under ${max} characters.`;
  if (!values.name) errors.name = "Please enter your name.";
  if (!values.contact) errors.contact = "Please enter an email or another way to reach you.";
  else if (values.contact.includes("@") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.contact)) errors.contact = "That email address doesn’t look right.";
  if (!values.about) errors.about = "Please tell us a little about your business.";
  if (!values.goals) errors.goals = "Please tell us what the website should accomplish.";
  if (values.website) {
    const raw = /^https?:\/\//i.test(values.website) ? values.website : `https://${values.website}`;
    const ok = normalizeHref(raw);
    if (!ok) errors.website = "Enter a web address like example.com."; else values.website = ok;
  }
  if (Object.keys(errors).length) return { status: "error", errors, message: "Please fix the highlighted fields.", values };

  try {
    if ((await hitRateLimit(await clientKey("inquiry"), 3600)) > 5) {
      return { status: "error", errors: {}, message: "Too many requests from this connection. Please try again later.", values };
    }
    const rows = await query<{ id: string }>(
      `insert into inquiries (name, business, contact, website, about, goals, features) values ($1,$2,$3,$4,$5,$6,$7) returning id`,
      [values.name, values.business, values.contact, values.website, values.about, values.goals, values.features],
    );
    await notify(rows[0].id, values);
  } catch (err) {
    console.error("inquiry failed", err);
    return { status: "error", errors: {}, message: "Something went wrong and your request was not saved. Please try again in a moment.", values };
  }
  return { status: "success", errors: {} };
}

// Optional email notification. The inquiry is already saved, so a failure here never loses it.
async function notify(id: string, v: Record<string, string>) {
  const { RESEND_API_KEY: key, INQUIRY_NOTIFY_TO: to, INQUIRY_FROM: from } = process.env;
  if (!key || !to || !from) return;
  let status = "sent";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to, reply_to: v.contact.includes("@") ? v.contact : undefined,
        subject: `Website inquiry from ${v.name}`.slice(0, 120),
        text: `Name: ${v.name}\nBusiness: ${v.business}\nContact: ${v.contact}\nWebsite: ${v.website}\n\nAbout:\n${v.about}\n\nGoals:\n${v.goals}\n\nPages/features:\n${v.features}`,
      }),
    });
    if (!res.ok) status = `failed_${res.status}`;
  } catch {
    status = "failed";
  }
  await query("update inquiries set email_status = $2 where id = $1", [id, status]);
}
