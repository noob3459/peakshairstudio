import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = { title: "Admin — Aidenn's Designs", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="ad-root">{children}</div>;
}
