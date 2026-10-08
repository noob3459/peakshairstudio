"use client";

import { motion, useAnimationControls, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const reveal = {
  hidden: { opacity: 0, y: 20, filter: "blur(3px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function MotionReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12, margin: "0px 0px -48px 0px" });
  const controls = useAnimationControls();
  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (reduce) { controls.set("visible"); return; }
    if (!ready) return;
    if (inView) {
      controls.set("hidden");
      void controls.start("visible");
    } else controls.set("hidden");
  }, [controls, inView, ready, reduce]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={controls}
      variants={reveal}
      transition={{ duration: 0.68, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({ children, className = "", index = 0, timeline = false }: { children: ReactNode; className?: string; index?: number; timeline?: boolean }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const controls = useAnimationControls();
  useEffect(() => setReady(true), []);
  useEffect(() => {
    const hidden = { opacity: 0, y: 16, filter: "blur(2px)" };
    const visible = { opacity: 1, y: 0, filter: "blur(0px)" };
    if (reduce) controls.set(visible);
    else if (ready && inView) {
      controls.set(hidden);
      void controls.start(visible);
    } else if (ready) controls.set(hidden);
  }, [controls, inView, ready, reduce]);

  const style = timeline ? ({ "--step-index": index } as CSSProperties) : undefined;
  return (
    <motion.li
      ref={ref}
      className={className}
      style={style}
      initial={false}
      animate={controls}
      transition={{ duration: 0.62, delay: index * (timeline ? 0 : 0.065), ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -4, transition: { type: "spring", stiffness: 300, damping: 26 } }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
    >
      {children}
    </motion.li>
  );
}

export function TimelineNumber({ number, index, count }: { number: number; index: number; count: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className="step-n"
      aria-hidden="true"
      animate={reduce ? undefined : { scale: [1, 1.12, 1], boxShadow: ["0 0 0 0 rgba(201,162,39,0)", "0 0 0 9px rgba(201,162,39,.16)", "0 0 0 0 rgba(201,162,39,0)"] }}
      transition={{ duration: Math.max(1, count) * 1.05, delay: index * 1.05, repeat: Infinity, ease: "easeInOut", times: [0, 0.08, 0.16] }}
    >
      {number}
    </motion.span>
  );
}

export function MotionHeroLayer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 56]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);
  const reduce = useReducedMotion();
  return <motion.div ref={ref} className="hero-motion-layer" style={reduce ? undefined : { y, scale }}>{children}</motion.div>;
}

export function MotionCallToAction() {
  const reduce = useReducedMotion();
  return (
    <motion.a
      href="/contact"
      className="project-make-link"
      whileHover={reduce ? undefined : { y: -2, scale: 1.02, boxShadow: "0 10px 24px -16px rgba(201,162,39,.65)" }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={reduce ? undefined : { type: "spring", stiffness: 320, damping: 24 }}
    >
      <span>Make a website like this</span><span aria-hidden="true">↗</span>
    </motion.a>
  );
}

export function MotionProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  if (reduce) return null;
  return <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}

const entrance = {
  hidden: { opacity: 0, y: 18, filter: "blur(5px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function MotionStagger({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const controls = useAnimationControls();
  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (reduce) { controls.set("visible"); return; }
    if (!ready) return;
    controls.set("hidden");
    void controls.start("visible");
  }, [controls, ready, reduce]);
  return (
    <motion.div
      className={className}
      initial={false}
      animate={controls}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
    >
      {children}
    </motion.div>
  );
}

export function MotionStaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : entrance}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function MotionHeader({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const controls = useAnimationControls();
  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (reduce) { controls.set({ opacity: 1, y: 0, scale: 1 }); return; }
    if (!ready) return;
    controls.set({ opacity: 0, y: -16, scale: 0.985 });
    void controls.start({ opacity: 1, y: 0, scale: 1 });
  }, [controls, ready, reduce]);
  return (
    <motion.header
      className="site-header"
      initial={false}
      animate={controls}
      transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.header>
  );
}

export function MotionFooter({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.08 });
  const controls = useAnimationControls();
  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (reduce) { controls.set({ opacity: 1, y: 0 }); return; }
    if (!ready) return;
    if (inView) {
      controls.set({ opacity: 0, y: 30 });
      void controls.start({ opacity: 1, y: 0 });
    } else controls.set({ opacity: 0, y: 30 });
  }, [controls, inView, ready, reduce]);
  return (
    <motion.footer
      ref={ref}
      className="site-footer on-dark"
      initial={false}
      animate={controls}
      transition={{ duration: 0.86, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.footer>
  );
}

export function ServiceIcon({ index }: { index: number }) {
  const reduce = useReducedMotion();
  const icons = [
    <><rect x="3.5" y="4.5" width="17" height="14" rx="2" /><path d="M3.5 8.5h17M8 21h8m-4-2.5V21" /><circle cx="6.5" cy="6.5" r=".6" fill="currentColor" /></>,
    <><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="M3.5 9h17M7 13h5m-5 3h8" /><path d="m17 15 2 2 3-4" /></>,
    <><path d="M7 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V5A1.5 1.5 0 0 1 6.5 3.5Z" /><path d="M15 3.5V8h4M8 12h8M8 15.5h8M8 19h5" /></>,
    <><path d="M4 18.5 5.5 14 15 4.5a2.1 2.1 0 0 1 3 3L8.5 17 4 18.5Z" /><path d="m13.5 6 3 3M4 21h16" /></>,
  ];
  return (
    <motion.span
      className="service-icon"
      aria-hidden="true"
      whileHover={reduce ? undefined : { y: -3, rotate: -4, scale: 1.06 }}
      transition={{ type: "spring", stiffness: 340, damping: 18 }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">{icons[index % icons.length]}</svg>
    </motion.span>
  );
}
