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
  if (get("kind") === "design-order") return submitDesignOrder(get);
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

type DesignLine = { product: "card-single" | "card-double" | "flyer"; quantity: number; size?: string };

async function submitDesignOrder(get: (key: string) => string): Promise<InquiryState> {
  const values = { name: get("name").slice(0, 100), business: get("business").slice(0, 120), contact: get("contact").slice(0, 200), notes: get("notes").slice(0, 1500) };
  const errors: Record<string, string> = {};
  if (get("company_url")) return { status: "success", errors: {} };
  if (!(Date.now() - Number(get("t")) > 3000)) return { status: "error", errors: {}, message: "Please wait a moment, then submit your request again." };
  if (!values.name) errors.name = "Please enter your name.";
  if (!values.contact) errors.contact = "Please enter an email or another way to reach you.";
  else if (values.contact.includes("@") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.contact)) errors.contact = "That email address doesn’t look right.";

  let parsedLines: unknown;
  try { parsedLines = JSON.parse(get("order")); } catch { /* Invalid cart is rejected below. */ }
  const isArray = Array.isArray(parsedLines);
  const lines: DesignLine[] = isArray ? parsedLines as DesignLine[] : [];
  const sizes = new Set(["Landscape 8.5 × 11 in", "Portrait 8.5 × 11 in", "Half-sheet 5.5 × 8.5 in"]);
  if (!isArray || lines.length < 1 || lines.length > 12) errors.order = "Please add at least one design to your request.";
  const cleanLines: DesignLine[] = [];
  for (const raw of lines.slice(0, 12)) {
    if (!raw || !["card-single", "card-double", "flyer"].includes(raw.product)) { errors.order = "Your cart contains an invalid item. Please refresh and try again."; break; }
    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10 || (raw.product !== "flyer" && quantity !== 1)) { errors.order = "Please review the number of digital designs in your request."; break; }
    if (raw.product === "flyer" && (typeof raw.size !== "string" || !sizes.has(raw.size))) { errors.order = "Please choose a flyer size and orientation."; break; }
    cleanLines.push({ product: raw.product, quantity, ...(raw.product === "flyer" ? { size: raw.size } : {}) });
  }
  if (Object.keys(errors).length) return { status: "error", errors, message: "Please review your request details." };

  const catalog = {
    "card-single": { title: "Single-sided business card design", price: 20 },
    "card-double": { title: "Double-sided business card design", price: 30 },
    flyer: { title: "Digital flyer design", price: 25 },
  } as const;
  const amount = cleanLines.reduce((sum, line) => sum + catalog[line.product].price * line.quantity, 0);
  const summary = cleanLines.map((line) => `${catalog[line.product].title}${line.size ? ` (${line.size})` : ""} × ${line.quantity} — $${catalog[line.product].price * line.quantity}`).join("\n");
  const features = `DIGITAL DESIGN REQUEST — NO PRINTING OR FULFILLMENT\n${summary}\nEstimated design total: $${amount}\nNo payment collected. Contact the client to confirm before work begins.${values.notes ? `\n\nClient notes:\n${values.notes}` : ""}`;

  try {
    if ((await hitRateLimit(await clientKey("inquiry"), 3600)) > 5) return { status: "error", errors: {}, message: "Too many requests from this connection. Please try again later." };
    const rows = await query<{ id: string }>(
      `insert into inquiries (name, business, contact, website, about, goals, features) values ($1,$2,$3,'',$4,$5,$6) returning id`,
      [values.name, values.business, values.contact, "Request for digital design files only; the client will arrange printing independently if wanted.", "Please contact the client to confirm their digital design request and next steps.", features],
    );
    await notify(rows[0].id, { ...values, website: "", about: "Digital design request only; no physical products or printing.", goals: `Estimated design total: $${amount}. No payment was collected.`, features });
  } catch (err) {
    console.error("design request failed", err);
    return { status: "error", errors: {}, message: "Something went wrong and your request was not saved. Please try again." };
  }
  return { status: "success", errors: {} };
}

// The inquiry is already saved, so an email failure never loses the request.
async function notify(id: string, v: Record<string, string>) {
  const { RESEND_API_KEY: key, INQUIRY_FROM: from } = process.env;
  if (!key || !from) return;

  const ownerEmail = "aidennq29@gmail.com";
  const customerEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.contact) ? v.contact.trim() : undefined;
  const details: Array<[string, string]> = [
    ["Name", v.name],
    ["Business", v.business],
    ["Contact", v.contact],
    ["Current website", v.website],
    ["About the business", v.about],
    ["Website goals", v.goals],
    ["Pages or features", v.features],
  ];
  const htmlEntities: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  };
  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => htmlEntities[char]);
  const textDetails = details.map(([label, value]) => `${label}: ${value || "Not provided"}`).join("\n\n");
  const htmlDetails = details.map(([label, value]) => `
    <tr>
      <td style="padding:13px 16px;border-bottom:1px solid #e3e1da;color:#626878;font-size:13px;font-weight:700;vertical-align:top;width:155px">${escapeHtml(label)}</td>
      <td style="padding:13px 16px;border-bottom:1px solid #e3e1da;color:#14171f;font-size:15px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(value || "Not provided")}</td>
    </tr>`).join("");
  const emailFrame = (title: string, intro: string, body: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f3ef;color:#14171f;font-family:Arial,Helvetica,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(intro)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f3ef;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fff;border:1px solid #e3e1da;border-radius:16px;overflow:hidden">
        <tr><td style="background:#0b1626;padding:25px 32px;border-bottom:4px solid #c9a227">
          <div style="color:#fff;font-size:21px;font-weight:700;letter-spacing:-.4px">Aidenn’s Designs</div>
          <div style="margin-top:6px;color:#e4c65e;font-size:11px;font-weight:700;letter-spacing:2px">WEBSITE DESIGN STUDIO</div>
        </td></tr>
        <tr><td style="padding:32px">
          <div style="margin-bottom:9px;color:#1b3a6b;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">${escapeHtml(title)}</div>
          <h1 style="margin:0 0 12px;color:#14171f;font-size:28px;line-height:1.2;letter-spacing:-.7px">${escapeHtml(title === "Inquiry received" ? `Thank you, ${v.name}.` : "A new website inquiry")}</h1>
          <p style="margin:0 0 24px;color:#626878;font-size:15px;line-height:1.7">${escapeHtml(intro)}</p>
          ${body}
        </td></tr>
        <tr><td style="padding:19px 32px;background:#f9f9f7;border-top:1px solid #e3e1da;color:#626878;font-size:12px;line-height:1.6">
          Aidenn’s Designs <span style="color:#c9a227">•</span> Thoughtful websites for businesses<br>
          This message relates to a request submitted through aidennsdesigns.com.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const detailsTable = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e3e1da;border-top:3px solid #c9a227;border-radius:12px;border-spacing:0;overflow:hidden">${htmlDetails}</table>`;
  const ownerHtml = emailFrame(
    "New inquiry",
    `${v.name} submitted a website inquiry. Reply to this email to respond directly to the customer.`,
    `${detailsTable}<p style="margin:22px 0 0;color:#626878;font-size:13px;line-height:1.6">This inquiry is also saved in the website admin inbox.</p>`,
  );
  const customerHtml = emailFrame(
    "Inquiry received",
    "We’ve received your request and will review the details. We’ll follow up using the contact information you provided.",
    `${detailsTable}<p style="margin:22px 0 0;padding:16px 18px;border-left:3px solid #c9a227;background:#f9f9f7;color:#626878;font-size:13px;line-height:1.6">Your inquiry is a starting point for a conversation. It is not a booking, contract, or final quote.</p>`,
  );
  const ownerText = `A new website inquiry has been received. Reply to this email to respond directly to the customer.\n\n${textDetails}\n\nThis inquiry is also saved in the website admin inbox.`;
  const customerText = `Thank you, ${v.name}. We’ve received your request and will review the details. We’ll follow up using the contact information you provided.\n\n${textDetails}\n\nYour inquiry is a starting point for a conversation. It is not a booking, contract, or final quote.`;

  const send = async (to: string, subject: string, text: string, html: string, replyTo?: string) => {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, reply_to: replyTo, subject, text, html }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const [ownerSent, customerSent] = await Promise.all([
    send(ownerEmail, `New website inquiry · ${v.name}`.slice(0, 120), ownerText, ownerHtml, customerEmail),
    customerEmail
      ? send(customerEmail, "We received your inquiry | Aidenn’s Designs", customerText, customerHtml, from)
      : Promise.resolve(null),
  ]);
  const status = ownerSent
    ? (customerSent === true ? "sent" : customerSent === false ? "sent_customer_failed" : "sent_owner_only")
    : (customerSent === true ? "customer_only" : "failed");
  try {
    await query("update inquiries set email_status = $2 where id = $1", [id, status]);
  } catch (err) {
    console.error("inquiry email status update failed", err);
  }
}
