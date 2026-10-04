"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const reveal = {
  hidden: { opacity: 0, y: 26, filter: "blur(7px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function MotionReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <motion.div
      className={className}
      initial={ready && !reduce ? "hidden" : false}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -48px 0px" }}
      variants={reduce ? undefined : reveal}
      transition={{ duration: 0.82, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({ children, className = "", index = 0, timeline = false }: { children: ReactNode; className?: string; index?: number; timeline?: boolean }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const style = timeline ? ({ "--step-index": index } as CSSProperties) : undefined;
  return (
    <motion.li
      className={className}
      style={style}
      initial={ready && !reduce ? { opacity: 0, y: 22, filter: "blur(5px)" } : false}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.72, delay: index * (timeline ? 0 : 0.08), ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -5, transition: { type: "spring", stiffness: 300, damping: 24 } }}
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
      whileHover={reduce ? undefined : { y: -2, scale: 1.025 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      animate={reduce ? undefined : { boxShadow: ["0 0 0 0 rgba(201,162,39,.08)", "0 0 0 6px rgba(201,162,39,.12)", "0 0 0 0 rgba(201,162,39,.08)"] }}
      transition={reduce ? undefined : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
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
