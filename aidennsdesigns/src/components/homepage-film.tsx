"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./homepage-film.module.css";
import { MotionReveal } from "./motion-primitives";

const DESKTOP_VIDEO = "/videos/aidenns-homepage-wide.mp4";
const MOBILE_VIDEO = "/videos/aidenns-homepage-mobile.mp4";

export function HomepageFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState("");
  const [soundOn, setSoundOn] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateSource = () => setSource(query.matches ? MOBILE_VIDEO : DESKTOP_VIDEO);
    const updateMotion = () => setReducedMotion(motionQuery.matches);
    updateSource();
    updateMotion();
    query.addEventListener("change", updateSource);
    motionQuery.addEventListener("change", updateMotion);
    return () => {
      query.removeEventListener("change", updateSource);
      motionQuery.removeEventListener("change", updateMotion);
    };
  }, []);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setSoundOn(!video.muted);
  }

  return (
    <section className={styles.section} aria-labelledby="homepage-film-heading">
      <div className={styles.wrap}>
        <MotionReveal className={styles.heading}>
          <header>
            <p className={styles.eyebrow}>A look behind the design</p>
            <h2 id="homepage-film-heading">From first line of code to finished website.</h2>
            <p>See how thoughtful design and careful development bring a website to life.</p>
          </header>
        </MotionReveal>
        <MotionReveal className={styles.player} delay={0.12}>
          <video
            ref={videoRef}
            className={styles.video}
            src={source || undefined}
            poster="/hero-mockups.webp"
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            preload="none"
            controls={reducedMotion}
            aria-label="A looping animation showing the design and development of a website"
          />
          <button
            className={styles.soundButton}
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? "Turn animation sound off" : "Turn animation sound on"}
            aria-pressed={soundOn}
          >
            <span aria-hidden="true">{soundOn ? "◖))" : "◖×"}</span>
            {soundOn ? "Sound on" : "Sound off"}
          </button>
        </MotionReveal>
      </div>
    </section>
  );
}
