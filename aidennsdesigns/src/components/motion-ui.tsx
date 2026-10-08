"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { Paragraphs } from "./ui";

export function AnimatedFAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const answerId = useId();

  return (
    <motion.div
      className="faq-item"
      layout
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: "spring", stiffness: 360, damping: 34, duration: 0.55 }}
    >
      <button
        className="faq-trigger"
        type="button"
        aria-expanded={open}
        aria-controls={open ? answerId : undefined}
        id={`${answerId}-trigger`}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{question}</span>
        <motion.span
          className="faq-plus"
          aria-hidden="true"
          animate={{ rotate: open ? 45 : 0, color: open ? "var(--gold)" : "var(--blue)" }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
        >+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={answerId}
            className="faq-answer-motion"
            role="region"
            aria-labelledby={`${answerId}-trigger`}
            key="answer"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -4 }}
            transition={{ duration: reduce ? 0.16 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="answer"><Paragraphs text={answer} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
