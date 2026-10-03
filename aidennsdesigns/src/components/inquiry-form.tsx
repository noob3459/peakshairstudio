"use client";
import { useActionState, useEffect, useState } from "react";
import { submitInquiry, type InquiryState } from "@/app/inquiry-action";

const initial: InquiryState = { status: "idle", errors: {} };

export function InquiryForm() {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const [loadedAt, setLoadedAt] = useState("");
  useEffect(() => setLoadedAt(String(Date.now())), []);

  if (state.status === "success") {
    return (
      <div className="form-success" role="status">
        <h3>Your inquiry was received.</h3>
        <p>Thank you. We will follow up using the contact details you gave. This is not a booking, a contract, or a final quote.</p>
      </div>
    );
  }
  const e = state.errors;
  const err = (k: string) => e[k] && <p className="field-error" id={`${k}-err`}>{e[k]}</p>;
  const a = (k: string) => ({ "aria-invalid": e[k] ? true : undefined, "aria-describedby": e[k] ? `${k}-err` : undefined });
  const v = state.values ?? {};

  return (
    <form action={action} className="form" noValidate={false}>
      {state.status === "error" && state.message && <p className="form-alert" role="alert">{state.message}</p>}
      <input type="hidden" name="t" value={loadedAt} />
      <div className="hp" aria-hidden="true">
        <label>Leave this empty<input name="company_url" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="row2">
        <div className="field"><label htmlFor="name">Your name <span className="req">(required)</span></label>
          <input id="name" name="name" required maxLength={100} autoComplete="name" defaultValue={v.name} {...a("name")} />{err("name")}</div>
        <div className="field"><label htmlFor="business">Business name</label>
          <input id="business" name="business" maxLength={120} autoComplete="organization" defaultValue={v.business} {...a("business")} />{err("business")}</div>
      </div>
      <div className="field"><label htmlFor="contact">Email or preferred contact method <span className="req">(required)</span></label>
        <input id="contact" name="contact" required maxLength={200} defaultValue={v.contact} {...a("contact")} />{err("contact")}</div>
      <div className="field"><label htmlFor="website">Current website, if any</label>
        <input id="website" name="website" maxLength={200} inputMode="url" placeholder="https://" defaultValue={v.website} {...a("website")} />{err("website")}</div>
      <div className="field"><label htmlFor="about">Tell us about your business <span className="req">(required)</span></label>
        <textarea id="about" name="about" required rows={4} maxLength={1500} defaultValue={v.about} {...a("about")} />{err("about")}</div>
      <div className="field"><label htmlFor="goals">What should the website accomplish? <span className="req">(required)</span></label>
        <textarea id="goals" name="goals" required rows={4} maxLength={1500} defaultValue={v.goals} {...a("goals")} />{err("goals")}</div>
      <div className="field"><label htmlFor="features">Pages or features you are considering</label>
        <textarea id="features" name="features" rows={3} maxLength={1000} defaultValue={v.features} {...a("features")} />{err("features")}</div>
      <p className="form-note">We only use these details to respond to your inquiry.</p>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Sending…" : "Send request"}</button>
    </form>
  );
}
