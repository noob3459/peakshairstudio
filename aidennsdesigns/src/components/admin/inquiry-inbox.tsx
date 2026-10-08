"use client";

import { useMemo, useState } from "react";
import { InquiryActions } from "@/components/admin/list-actions";

type Inquiry = {
  id: string; name: string; business: string; contact: string; website: string;
  about: string; goals: string; features: string; handled: boolean;
  emailStatus: string; createdAt: string;
};

type Filter = "all" | "new" | "handled";
const EMAIL_STATUS: Record<string, string> = {
  not_configured: "Email alert not configured", sent: "Email alert sent",
};
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function InquiryInbox({ items }: { items: Inquiry[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const counts = useMemo(() => ({
    all: items.length,
    new: items.filter((item) => !item.handled).length,
    handled: items.filter((item) => item.handled).length,
  }), [items]);
  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesFilter = filter === "all" || (filter === "new" ? !item.handled : item.handled);
      const matchesSearch = !needle || [item.name, item.business, item.contact, item.website, item.about, item.goals, item.features]
        .some((value) => value?.toLowerCase().includes(needle));
      return matchesFilter && matchesSearch;
    });
  }, [filter, items, search]);

  return (
    <>
      <div className="ad-inbox-stats" aria-label="Inquiry counts">
        <div className="ad-inbox-stat"><span>All requests</span><strong>{counts.all}</strong></div>
        <div className="ad-inbox-stat ad-inbox-stat-new"><span>Needs a reply</span><strong>{counts.new}</strong></div>
        <div className="ad-inbox-stat"><span>Handled</span><strong>{counts.handled}</strong></div>
      </div>

      <div className="ad-inbox-tools">
        <label className="ad-inbox-search-label" htmlFor="inquiry-search">Search requests</label>
        <input id="inquiry-search" className="ad-input ad-inbox-search" type="search" value={search}
          onChange={(event) => setSearch(event.target.value)} placeholder="Name, business, email, or request details" />
        <div className="ad-inbox-filters" role="group" aria-label="Filter inquiries">
          {(["all", "new", "handled"] as const).map((key) => (
            <button key={key} type="button" className={`ad-inbox-filter${filter === key ? " active" : ""}`}
              aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {key === "all" ? "All" : key === "new" ? "Needs a reply" : "Handled"}<span>{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="ad-empty ad-inbox-empty">
          <strong>{items.length === 0 ? "Your inbox is ready" : "No matching requests"}</strong>
          <p>{items.length === 0 ? "Website and design submissions will appear here with the details clients share." : "Try another search or switch the status filter."}</p>
        </div>
      ) : (
        <ul className="ad-inbox-list">
          {visible.map((q) => {
            const designRequest = q.features.toLowerCase().includes("digital design request");
            const email = isEmail(q.contact) ? q.contact.trim() : null;
            return (
              <li key={q.id} className={`ad-inbox-card${q.handled ? " is-handled" : ""}`}>
                <article>
                  <header className="ad-inbox-card-head">
                    <div className="ad-inbox-person">
                      <span className={`ad-inbox-status${q.handled ? " handled" : ""}`}>{q.handled ? "Handled" : "Needs a reply"}</span>
                      <h2>{q.name || "Name not provided"}</h2>
                      {q.business && <p>{q.business}</p>}
                    </div>
                    <div className="ad-inbox-meta">
                      <span className="ad-inbox-type">{designRequest ? "Digital design request" : "Website inquiry"}</span>
                      <time dateTime={q.createdAt}>{new Date(q.createdAt).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC</time>
                    </div>
                  </header>

                  <div className="ad-inbox-details">
                    <section className="ad-inbox-contact">
                      <h3>Contact details</h3>
                      <p className="ad-inbox-contact-value">{email ? <a href={`mailto:${email}`}>{email}</a> : q.contact || "Not provided"}</p>
                      {q.website && <p><span>Current website</span><br />{q.website}</p>}
                    </section>
                    <section className="ad-inbox-message">
                      <h3>About the business</h3><p>{q.about || "Not provided"}</p>
                      <h3>What they want to achieve</h3><p>{q.goals || "Not provided"}</p>
                      {q.features && <><h3>{designRequest ? "Design details" : "Pages and features"}</h3><p>{q.features}</p></>}
                    </section>
                  </div>

                  <footer className="ad-inbox-card-foot">
                    <span className={`ad-inbox-email-state${q.emailStatus === "sent" ? " sent" : ""}`}>
                      <span aria-hidden="true">{q.emailStatus === "sent" ? "●" : "○"}</span> {EMAIL_STATUS[q.emailStatus] ?? `Email alert: ${q.emailStatus}`}
                    </span>
                    <InquiryActions id={q.id} handled={q.handled} />
                  </footer>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
