"use client";
import Image from "next/image";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { submitInquiry, type InquiryState } from "@/app/inquiry-action";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type Product = "card-single" | "card-double" | "flyer";
type Line = { product: Product; quantity: number; size?: string };
const initial: InquiryState = { status: "idle", errors: {} };
const catalog: Record<Product, { name: string; price: number; image: string; alt: string }> = {
  "card-single": { name: "Single-sided card design", price: 20, image: "/products/card-single-sided.png", alt: "Flat digital preview of Aidenn’s Designs single-sided business card design with phone, email, website and a scannable QR code" },
  "card-double": { name: "Double-sided card design", price: 30, image: "/products/card-double-sided.png", alt: "Flat digital preview showing both sides of Aidenn’s Designs business card design; the reverse side describes the services and places a scannable QR code on the right" },
  flyer: { name: "Digital flyer design", price: 25, image: "/products/flyer-digital.png", alt: "Digital flyer design preview for Aidenn’s Designs" },
};
const flyerSizes = ["Landscape 8.5 × 11 in", "Portrait 8.5 × 11 in", "Half-sheet 5.5 × 8.5 in"];

function AnimatedProduct({ children, index }: { children: ReactNode; index: number }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    gsap.fromTo(element, { autoAlpha: 0, y: 20, scale: 0.99 }, {
      autoAlpha: 1, y: 0, scale: 1, duration: 0.64, delay: index * 0.08,
      ease: "power3.out", clearProps: "transform,opacity,visibility",
      scrollTrigger: { trigger: element, start: "top 92%", once: true },
    });
  }, { scope: ref });
  return <article ref={ref} className="design-product">{children}</article>;
}

export function PrintOrderShop({ id, headingId, eyebrow, heading, intro, footnote }: { id?: string; headingId: string; eyebrow?: string; heading: string; intro?: string; footnote?: string }) {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const [loadedAt, setLoadedAt] = useState("");
  const [cart, setCart] = useState<Line[]>([]);
  const [size, setSize] = useState(flyerSizes[0]);
  const cartRef = useRef<HTMLDivElement>(null);
  useEffect(() => setLoadedAt(String(Date.now())), []);

  useGSAP(() => {
    const cartElement = cartRef.current;
    if (!cartElement || prefersReducedMotion()) return;
    const content = cartElement.querySelector<HTMLElement>(cart.length ? ".design-cart-lines" : ".form-note");
    if (!content) return;
    gsap.fromTo(content, { autoAlpha: 0, y: 8 }, {
      autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out",
      clearProps: "transform,opacity,visibility",
    });
    const lines = cartElement.querySelectorAll<HTMLElement>(".design-cart-lines > li");
    if (lines.length) gsap.fromTo(lines, { autoAlpha: 0, x: 12, scale: 0.99 }, {
      autoAlpha: 1, x: 0, scale: 1, duration: 0.28, stagger: 0.045,
      ease: "power2.out", clearProps: "transform,opacity,visibility",
    });
  }, { scope: cartRef, dependencies: [cart], revertOnUpdate: true });

  const add = (product: Product) => setCart((current) => {
    if (product !== "flyer" && current.some((line) => line.product === product)) return current;
    if (product === "flyer") {
      const found = current.find((line) => line.product === "flyer" && line.size === size);
      if (found) return current.map((line) => line === found ? { ...line, quantity: Math.min(10, line.quantity + 1) } : line);
    }
    return [...current, { product, quantity: 1, ...(product === "flyer" ? { size } : {}) }];
  });
  const remove = (index: number) => setCart((current) => current.filter((_, i) => i !== index));
  const total = cart.reduce((sum, line) => sum + catalog[line.product].price * line.quantity, 0);
  const error = (key: string) => state.errors[key] && <p className="field-error" id={`design-${key}-err`}>{state.errors[key]}</p>;
  const invalid = (key: string) => ({ "aria-invalid": state.errors[key] ? true : undefined, "aria-describedby": state.errors[key] ? `design-${key}-err` : undefined });

  if (state.status === "success") return (
    <section id={id} className="sec sec-alt" aria-labelledby={headingId}>
      <div className="wrap"><div className="form-success" role="status"><h3>Your digital design request was received.</h3><p>No payment was collected. Aidenn’s Designs will contact you to confirm the request and next steps. You will arrange any printing directly with a provider you choose.</p></div></div>
    </section>
  );

  return (
    <section id={id} className="sec sec-alt" aria-labelledby={headingId}>
      <div className="wrap">
        <header className="sec-head center">
          {eyebrow && <p className="eyebrow" style={{ justifyContent: "center" }}>{eyebrow}</p>}
          <h2 className="h-page" id={headingId}>{heading}</h2>
          {intro && <p className="lede">{intro}</p>}
        </header>
        <div className="design-products">
          {(Object.keys(catalog) as Product[]).map((product) => {
            const item = catalog[product];
            const inCart = product !== "flyer" && cart.some((line) => line.product === product);
            return <AnimatedProduct key={product} index={(Object.keys(catalog) as Product[]).indexOf(product)}>
              <Image src={item.image} alt={item.alt} width={1440} height={1000} sizes="(max-width: 760px) 100vw, 33vw" />
              <div className="design-product-copy">
                <div><h3>{item.name}</h3><p className="price"><strong>${item.price}</strong><span>per design</span></p></div>
                {product === "flyer" && <div className="field"><label htmlFor="flyer-size">Flyer format</label><select id="flyer-size" value={size} onChange={(event) => setSize(event.target.value)}>{flyerSizes.map((option) => <option key={option}>{option}</option>)}</select></div>}
                <p className="design-delivery">Digital design file only. Printing, ordering and delivery are handled by you through a provider you choose.</p>
                <button type="button" className="btn btn-ghost" onClick={() => add(product)} disabled={inCart}>{inCart ? "Added to request" : product === "flyer" ? "Add flyer design" : "Add design"}</button>
              </div>
            </AnimatedProduct>;
          })}
        </div>

        <div className="design-checkout" id="design-request">
          <div ref={cartRef} className="design-cart">
            <div><p className="eyebrow">Request summary</p><h3>Your design request</h3></div>
            {!cart.length ? <p className="form-note">Add a design above to begin. Card options are priced per design; there are no print quantities.</p> : <ul className="design-cart-lines">
              {cart.map((line, index) => <li key={`${line.product}-${line.size ?? ""}`}><span><strong>{catalog[line.product].name}</strong>{line.size && <small>{line.size}</small>}{line.product === "flyer" && <small>{line.quantity} digital design{line.quantity === 1 ? "" : "s"}</small>}</span><span>${catalog[line.product].price * line.quantity}</span><button type="button" aria-label={`Remove ${catalog[line.product].name}`} onClick={() => remove(index)}>Remove</button></li>)}
            </ul>}
            <p className="design-total"><span>Estimated design total</span><strong>${total}</strong></p>
            <p className="form-note">This is a request only. No payment is collected here. Work begins after Aidenn’s Designs contacts you to confirm the details.</p>
          </div>
          <form action={action} className="form design-request-form">
            {state.status === "error" && state.message && <p className="form-alert" role="alert">{state.message}</p>}
            {error("order")}
            <input type="hidden" name="kind" value="design-order" />
            <input type="hidden" name="t" value={loadedAt} />
            <input type="hidden" name="order" value={JSON.stringify(cart)} />
            <div className="hp" aria-hidden="true"><label>Leave this empty<input name="company_url" tabIndex={-1} autoComplete="off" /></label></div>
            <h3>Where should we follow up?</h3>
            <div className="field"><label htmlFor="design-name">Your name <span className="req">(required)</span></label><input id="design-name" name="name" required maxLength={100} autoComplete="name" {...invalid("name")} />{error("name")}</div>
            <div className="field"><label htmlFor="design-business">Business name</label><input id="design-business" name="business" maxLength={120} autoComplete="organization" /></div>
            <div className="field"><label htmlFor="design-contact">Email or preferred contact method <span className="req">(required)</span></label><input id="design-contact" name="contact" required maxLength={200} autoComplete="email" {...invalid("contact")} />{error("contact")}</div>
            <div className="field"><label htmlFor="design-notes">Notes or design preferences</label><textarea id="design-notes" name="notes" rows={4} maxLength={1500} placeholder="Share your preferred wording, style, colors, or any questions." /></div>
            <button className="btn btn-primary" disabled={pending || cart.length === 0}>{pending ? "Sending request…" : "Submit design request"}</button>
            <p className="form-note">By submitting, you are requesting digital design work only. No printing is included and no payment is taken online.</p>
          </form>
        </div>
        {footnote && <p className="footnote">{footnote}</p>}
      </div>
    </section>
  );
}
