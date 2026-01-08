import { useLanguage } from '@context/LanguageContext';
import styles from '@styles/components/About.module.css';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={`${styles.title} fade-in`}>{t('ourStory')}</h1>
        
        <div className={`${styles.content} fade-in fade-in-delay-1`}>
          <p>{t('aboutText1')}</p>
          <p>{t('aboutText2')}</p>
          <p>{t('aboutText3')}</p>
        </div>

        <div className={`${styles.brands} fade-in fade-in-delay-2`}>
          <div className={styles.brandsList}>
            <span>Polo Ralph Lauren</span>
            <span>•</span>
            <span>Lacoste</span>
            <span>•</span>
            <span>Armani</span>
            <span>•</span>
            <span>Gucci</span>
            <span>•</span>
            <span>Kenzo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
