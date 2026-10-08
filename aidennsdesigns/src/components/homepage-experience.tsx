import styles from "./homepage-film.module.css";

export function HomepageExperience() {
  return (
    <section className={styles.experienceSection} aria-labelledby="homepage-experience-heading">
      <div className={styles.experienceCard}>
        <div className={styles.experienceYears} aria-label="About two years">
          <span>~2</span>
          <small>YEARS</small>
        </div>
        <div className={styles.experienceCopy}>
          <p className={styles.eyebrow}>Design for every business</p>
          <h2 id="homepage-experience-heading">Helping businesses show up with confidence.</h2>
          <p>For about two years, Aidenn’s Designs has helped businesses build a polished, professional presence online.</p>
        </div>
      </div>
    </section>
  );
}
