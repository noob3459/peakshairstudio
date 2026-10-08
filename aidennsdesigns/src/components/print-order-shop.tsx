"use client";
import Image from "next/image";
import { AnimatePresence, motion, useAnimationControls, useInView, useReducedMotion } from "motion/react";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { submitInquiry, type InquiryState } from "@/app/inquiry-action";

type Product = "card-single" | "card-double" | "flyer";
type Line = { product: Product; quantity: number; size?: string };
const initial: InquiryState = { status: "idle", errors: {} };
const catalog: Record<Product, { name: string; price: number; image: string; alt: string }> = {
  "card-single": { name: "Single-sided card design", price: 20, image: "/products/card-single-sided.png", alt: "Flat digital preview of Aidenn’s Designs single-sided business card design with phone, email, website and a scannable QR code" },
  "card-double": { name: "Double-sided card design", price: 30, image: "/products/card-double-sided.png", alt: "Flat digital preview showing both sides of Aidenn’s Designs business card design; the reverse side describes the services and places a scannable QR code on the right" },
  flyer: { name: "Digital flyer design", price: 25, image: "/products/flyer-digital.png", alt: "Digital flyer design preview for Aidenn’s Designs" },
};
const flyerSizes = ["Landscape 8.5 × 11 in", "Portrait 8.5 × 11 in", "Half-sheet 5.5 × 8.5 in"];

function AnimatedProduct({ children, index, reduce }: { children: ReactNode; index: number; reduce: boolean | null }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.18 });
  const controls = useAnimationControls();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    const visible = { opacity: 1, y: 0, scale: 1 };
    if (reduce) { controls.set(visible); return; }
    if (!ready) return;
    if (inView) {
      controls.set({ opacity: 0, y: 22, scale: 0.985 });
      void controls.start({ ...visible, transition: { duration: 0.72, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] } });
    } else controls.set({ opacity: 0, y: 22, scale: 0.985 });
  }, [controls, inView, index, ready, reduce]);
  return <motion.article ref={ref} className="design-product" initial={false} animate={controls} whileHover={reduce ? undefined : { y: -5, transition: { type: "spring", stiffness: 300, damping: 25 } }} layout>{children}</motion.article>;
}

export function PrintOrderShop({ id, headingId, eyebrow, heading, intro, footnote }: { id?: string; headingId: string; eyebrow?: string; heading: string; intro?: string; footnote?: string }) {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const [loadedAt, setLoadedAt] = useState("");
  const [cart, setCart] = useState<Line[]>([]);
  const [size, setSize] = useState(flyerSizes[0]);
  const reduce = useReducedMotion();
  useEffect(() => setLoadedAt(String(Date.now())), []);

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
            return <AnimatedProduct key={product} index={(Object.keys(catalog) as Product[]).indexOf(product)} reduce={reduce}>
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
          <motion.div className="design-cart" layout transition={{ type: "spring", stiffness: 320, damping: 30 }}>
            <div><p className="eyebrow">Request summary</p><h3>Your design request</h3></div>
            <AnimatePresence mode="wait" initial={false}>
              {!cart.length ? <motion.p key="empty" className="form-note" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.22 }}>Add a design above to begin. Card options are priced per design; there are no print quantities.</motion.p> : <motion.ul key="items" className="design-cart-lines" layout initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnimatePresence initial={false}>{cart.map((line, index) => <motion.li layout key={`${line.product}-${line.size ?? ""}`} initial={reduce ? { opacity: 0 } : { opacity: 0, x: 14, scale: 0.98 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 12, scale: 0.98 }} transition={{ type: "spring", stiffness: 360, damping: 30 }}><span><strong>{catalog[line.product].name}</strong>{line.size && <small>{line.size}</small>}{line.product === "flyer" && <small>{line.quantity} digital design{line.quantity === 1 ? "" : "s"}</small>}</span><span>${catalog[line.product].price * line.quantity}</span><button type="button" aria-label={`Remove ${catalog[line.product].name}`} onClick={() => remove(index)}>Remove</button></motion.li>)}</AnimatePresence>
              </motion.ul>}
            </AnimatePresence>
            <p className="design-total"><span>Estimated design total</span><strong>${total}</strong></p>
            <p className="form-note">This is a request only. No payment is collected here. Work begins after Aidenn’s Designs contacts you to confirm the details.</p>
          </motion.div>
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
