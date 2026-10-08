import Link from "next/link";
import Image from "next/image";
import { requireOwner } from "@/lib/auth";
import { AdminMenu } from "@/components/admin/admin-nav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireOwner();
  return (
    <div className="ad-shell">
      <aside className="ad-side">
        <Link href="/admin" className="ad-brand">
          <Image src="/aidenns-designs-mark.png" width={40} height={40} alt="" aria-hidden="true" />
          <span>Aidenn&apos;s Designs<small>Admin</small></span>
        </Link>
        <AdminMenu />
        <a href="/" target="_blank" rel="noopener noreferrer" className="ad-viewsite">View site<span className="sr-only"> (opens in a new tab)</span> ↗</a>
      </aside>
      <main className="ad-main" id="main">{children}</main>
    </div>
  );
}
