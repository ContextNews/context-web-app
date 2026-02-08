import { useEffect, useState } from 'react'
import styles from './StoryViewEntities.module.css'

function StoryViewEntities({ story }) {
  const [activeTab, setActiveTab] = useState('entities')
  const [loadedPersonImages, setLoadedPersonImages] = useState({})
  const persons = Array.isArray(story?.persons) ? story.persons : []
  const locations = Array.isArray(story?.locations) ? story.locations : []
  const showPersons = activeTab === 'entities' || activeTab === 'persons'
  const showLocations = activeTab === 'entities' || activeTab === 'locations'
  const showOrganizations = activeTab === 'organizations'

  const hasVisibleEntities =
    (showPersons && persons.length > 0) || (showLocations && locations.length > 0)

  useEffect(() => {
    setLoadedPersonImages({})
  }, [story?.story_id])

  const markPersonImageLoaded = (personKey) => {
    setLoadedPersonImages((prev) => {
      if (prev[personKey]) return prev
      return { ...prev, [personKey]: true }
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'entities' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('entities')}
          >
            Entities
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'locations' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('locations')}
          >
            Locations
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'organizations' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('organizations')}
          >
            Organizations
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'persons' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('persons')}
          >
            Persons
          </button>
        </div>
      </div>
      <div className={styles.scroll}>
        {showPersons && persons.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>Persons</div>
            <div className={styles.items}>
              {persons.map((person, index) => {
                const personKey = person.wikidata_qid || `${person.name || 'person'}-${index}`
                const isImageLoaded = Boolean(loadedPersonImages[personKey])

                return (
                  <div
                    key={personKey}
                    className={`${styles.item} ${styles.personItem}`}
                  >
                    <div className={styles.personRow}>
                      {person.image_url ? (
                        <div
                          className={`${styles.personImageFrame} ${
                            isImageLoaded ? styles.personImageFrameLoaded : ''
                          }`}
                        >
                          <img
                            src={person.image_url}
                            alt={person.name || 'Person'}
                            className={styles.personImage}
                            loading="lazy"
                            ref={(node) => {
                              if (node && node.complete && node.naturalWidth > 0) {
                                markPersonImageLoaded(personKey)
                              }
                            }}
                            onLoad={() => markPersonImageLoaded(personKey)}
                            onError={(event) => {
                              event.currentTarget.style.display = 'none'
                            }}
                          />
                          <div
                            className={`${styles.personImageCover} ${
                              isImageLoaded ? styles.personImageCoverLoaded : ''
                            }`}
                            aria-hidden="true"
                          />
                        </div>
                      ) : (
                        <div className={styles.personImageFallback} aria-hidden="true" />
                      )}
                      <div className={styles.personContent}>
                        <div className={styles.itemTitle}>{person.name || 'Unknown person'}</div>
                        {person.description ? (
                          <div className={styles.itemMeta}>{person.description}</div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        {showLocations && locations.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>Locations</div>
            <div className={styles.items}>
              {locations.map((location, index) => (
                <div
                  key={location.wikidata_qid || `${location.name || 'location'}-${index}`}
                  className={`${styles.item} ${styles.locationItem}`}
                >
                  <div className={styles.itemTitle}>{location.name || 'Unknown location'}</div>
                  <div className={styles.itemMeta}>
                    {[location.location_type, location.country_code].filter(Boolean).join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {showOrganizations ? (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>Organizations</div>
            <div className={styles.empty}>No organizations available yet.</div>
          </section>
        ) : null}

        {!showOrganizations && !hasVisibleEntities ? (
          <div className={styles.empty}>No entities available for this story.</div>
        ) : null}
      </div>
    </div>
  )
}

export default StoryViewEntities
