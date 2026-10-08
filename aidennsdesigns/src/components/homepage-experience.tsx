import styles from "./homepage-film.module.css";
import { MotionReveal } from "./motion-primitives";

export function HomepageExperience() {
  return (
    <section className={styles.experienceSection} aria-labelledby="homepage-experience-heading">
      <div className={styles.experienceWrap}>
        <MotionReveal className={styles.experienceIntro}>
          <p className={styles.eyebrow}>Aidenn’s Designs</p>
          <h2 id="homepage-experience-heading">Thoughtful design, with the details in view.</h2>
          <p>Clear experience and pricing, presented with the same care as every website.</p>
        </MotionReveal>
        <div className={styles.experienceGrid}>
          <MotionReveal className={styles.experienceStat}>
            <p className={styles.statEyebrow}>Experience</p>
            <p className={styles.statValue} aria-label="About two years">~2<small> years</small></p>
            <span className={styles.statRule} aria-hidden="true" />
            <h3>Designing for businesses</h3>
            <p>For about two years, Aidenn’s Designs has helped businesses build a polished, professional presence online.</p>
          </MotionReveal>
          <MotionReveal className={styles.experienceStat} delay={0.1}>
            <p className={styles.statEyebrow}>Website design &amp; setup</p>
            <p className={styles.statValue}>$250</p>
            <span className={styles.statRule} aria-hidden="true" />
            <h3>One-time setup</h3>
            <p>Domain registration is separate, with the exact cost shared for approval.</p>
          </MotionReveal>
          <MotionReveal className={styles.experienceStat} delay={0.2}>
            <p className={styles.statEyebrow}>Hosting &amp; management</p>
            <p className={`${styles.statValue} ${styles.statRange}`}>$50–$75</p>
            <span className={styles.statRule} aria-hidden="true" />
            <h3>Quarterly care</h3>
            <p>Choose the care plan that fits, with hosting and ongoing management included.</p>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
