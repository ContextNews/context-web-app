import styles from './LandingFeatureCard.module.css'

function LandingFeatureCard({
  title,
  description,
  href,
  linkLabel,
  imageUrl,
  imageOverlayText,
}) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        {imageUrl ? <img src={imageUrl} alt="" className={styles.image} /> : null}
        {imageOverlayText ? (
          <div className={styles.imageOverlay}>{imageOverlayText}</div>
        ) : null}
      </div>
      <div className={styles.bottom}>
        <p className={styles.description}>{description}</p>
        <a href={href} className={styles.link}>
          {linkLabel || title}
        </a>
      </div>
    </article>
  )
}

export default LandingFeatureCard
