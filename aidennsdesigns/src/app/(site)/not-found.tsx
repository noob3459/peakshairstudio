import Link from "next/link";

export const metadata = { title: "Page not found — AidennsDesigns" };

export default function NotFound() {
  return (
    <section className="sec">
      <div className="wrap narrow">
        <p className="eyebrow">404</p>
        <h1 className="h-page">This page isn’t here.</h1>
        <p className="lede">It may have moved or isn’t published.</p>
        <p className="more"><Link href="/" className="btn btn-primary">Back to home</Link></p>
      </div>
    </section>
  );
}
