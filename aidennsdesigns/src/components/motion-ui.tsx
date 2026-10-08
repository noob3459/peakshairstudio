"use client";

import { useId, useRef, useState } from "react";
import { Paragraphs } from "./ui";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export function AnimatedFAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const answerId = useId();
  const root = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const plusRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const element = root.current;
    if (!element || prefersReducedMotion()) return;
    gsap.fromTo(element, { autoAlpha: 0, y: 12 }, {
      autoAlpha: 1, y: 0, duration: 0.52, ease: "power3.out",
      clearProps: "transform,opacity,visibility",
      scrollTrigger: { trigger: element, start: "top 94%", once: true },
    });
  }, { scope: root });

  useGSAP(() => {
    const panel = answerRef.current;
    const plus = plusRef.current;
    if (!panel || !plus) return;
    gsap.killTweensOf([panel, plus]);
    if (prefersReducedMotion()) {
      gsap.set(panel, { height: open ? "auto" : 0, autoAlpha: open ? 1 : 0, y: 0 });
      gsap.set(plus, { rotation: open ? 45 : 0, color: open ? "#c9a227" : "#1b3a6b" });
      return;
    }
    if (open) {
      gsap.fromTo(panel, { height: 0, autoAlpha: 0, y: -5 }, {
        height: "auto", autoAlpha: 1, y: 0, duration: 0.34, ease: "power3.out",
      });
    } else {
      gsap.to(panel, { height: 0, autoAlpha: 0, y: -4, duration: 0.25, ease: "power2.inOut" });
    }
    gsap.to(plus, { rotation: open ? 45 : 0, color: open ? "#c9a227" : "#1b3a6b", duration: 0.24, ease: "power2.out" });
  }, { scope: root, dependencies: [open] });

  return (
    <div ref={root} className="faq-item">
      <button
        className="faq-trigger"
        type="button"
        aria-expanded={open}
        aria-controls={answerId}
        id={`${answerId}-trigger`}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{question}</span>
        <span ref={plusRef} className="faq-plus" aria-hidden="true">+</span>
      </button>
      <div
        ref={answerRef}
        id={answerId}
        className="faq-answer-motion"
        role="region"
        aria-labelledby={`${answerId}-trigger`}
        aria-hidden={!open}
      >
        <div className="answer"><Paragraphs text={answer} /></div>
      </div>
    </div>
  );
}
