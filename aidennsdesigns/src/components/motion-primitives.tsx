"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export function MotionReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    gsap.fromTo(element, { autoAlpha: 0, y: 20, filter: "blur(3px)" }, {
      autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.68, delay,
      ease: "power3.out", clearProps: "transform,opacity,visibility,filter",
      scrollTrigger: { trigger: element, start: "top 90%", once: true },
    });
  }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}

export function MotionItem({ children, className = "", index = 0, timeline = false }: { children: ReactNode; className?: string; index?: number; timeline?: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const style = timeline ? ({ "--step-index": index } as CSSProperties) : undefined;
  useGSAP(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    gsap.fromTo(element, { autoAlpha: 0, y: 16, filter: "blur(2px)" }, {
      autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.62,
      delay: index * (timeline ? 0.055 : 0.065), ease: "power3.out",
      clearProps: "transform,opacity,visibility,filter",
      scrollTrigger: { trigger: element, start: "top 92%", once: true },
    });
  }, { scope: ref });
  return <li ref={ref} className={className} style={style}>{children}</li>;
}

export function TimelineNumber({ number, index, count }: { number: number; index: number; count: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    gsap.to(element, {
      scale: 1.1,
      boxShadow: "0 0 0 8px rgba(201,162,39,.16)",
      duration: 0.32,
      delay: index * 0.2,
      repeat: -1,
      repeatDelay: Math.max(2.8, count * 0.7),
      yoyo: true,
      ease: "sine.inOut",
      scrollTrigger: { trigger: element, start: "top 94%", toggleActions: "play pause resume pause" },
    });
  }, { scope: ref });
  return <span ref={ref} className="step-n" aria-hidden="true">{number}</span>;
}

export function MotionHeroLayer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const element = ref.current;
    const section = element?.parentElement?.parentElement;
    if (!element || !section || prefersReducedMotion()) return;
    gsap.to(element, {
      y: 56, scale: 1.12, ease: "none",
      scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.65 },
    });
  }, { scope: ref });
  return <div ref={ref} className="hero-motion-layer">{children}</div>;
}

export function MotionCallToAction() {
  return <a href="/contact" className="project-make-link"><span>Make a website like this</span><span aria-hidden="true">↗</span></a>;
}

export function MotionProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    gsap.fromTo(element, { scaleX: 0 }, {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: document.documentElement, start: "top top", end: "max", scrub: true },
    });
  }, { scope: ref });
  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}

export function MotionStagger({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const container = ref.current;
    if (!container || prefersReducedMotion()) return;
    const items = container.querySelectorAll(".motion-stagger-item");
    if (!items.length) return;
    gsap.fromTo(items, { autoAlpha: 0, y: 18, filter: "blur(2px)" }, {
      autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.62, delay: 0.08,
      stagger: 0.12, ease: "power3.out", clearProps: "transform,opacity,visibility,filter",
    });
  }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}

export function MotionStaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`motion-stagger-item ${className}`}>{children}</div>;
}

export function MotionHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    gsap.fromTo(element, { autoAlpha: 0, y: -16, scale: 0.985 }, {
      autoAlpha: 1, y: 0, scale: 1, duration: 0.72, delay: 0.1, ease: "power3.out",
      clearProps: "transform,opacity,visibility",
    });
  }, { scope: ref });
  return <header ref={ref} className="site-header">{children}</header>;
}

export function MotionFooter({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    gsap.fromTo(element, { autoAlpha: 0, y: 24 }, {
      autoAlpha: 1, y: 0, duration: 0.72, ease: "power3.out",
      clearProps: "transform,opacity,visibility",
      scrollTrigger: { trigger: element, start: "top 92%", once: true },
    });
  }, { scope: ref });
  return <footer ref={ref} className="site-footer on-dark">{children}</footer>;
}

export function ServiceIcon({ index }: { index: number }) {
  const icons = [
    <><rect x="3.5" y="4.5" width="17" height="14" rx="2" /><path d="M3.5 8.5h17M8 21h8m-4-2.5V21" /><circle cx="6.5" cy="6.5" r=".6" fill="currentColor" /></>,
    <><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="M3.5 9h17M7 13h5m-5 3h8" /><path d="m17 15 2 2 3-4" /></>,
    <><path d="M7 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V5A1.5 1.5 0 0 1 6.5 3.5Z" /><path d="M15 3.5V8h4M8 12h8M8 15.5h8M8 19h5" /></>,
    <><path d="M4 18.5 5.5 14 15 4.5a2.1 2.1 0 0 1 3 3L8.5 17 4 18.5Z" /><path d="m13.5 6 3 3M4 21h16" /></>,
  ];
  return <span className="service-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">{icons[index % icons.length]}</svg></span>;
}
