import { Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';
import styles from '@styles/components/Contact.module.css';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={`${styles.title} fade-in`}>{t('getInTouch')}</h1>
        
        <p className={`${styles.description} fade-in fade-in-delay-1`}>
          {t('contactDescription')}
        </p>

        <div className={`${styles.contactInfo} fade-in fade-in-delay-2`}>
          <div className={styles.contactItem}>
            <span className={styles.label}>{t('phoneLabel')}</span>
            <a href="tel:+38267123456" className={styles.value}>
              <Phone size={18} />
              +382 67 123 456
            </a>
          </div>

          <div className={styles.contactItem}>
            <span className={styles.label}>{t('emailLabel')}</span>
            <a href="mailto:info@fashionwhite.me" className={styles.value}>
              <Mail size={18} />
              info@fashionwhite.me
            </a>
          </div>
        </div>

        <div className={`${styles.social} fade-in fade-in-delay-3`}>
          <span className={styles.label}>{t('followUs')}</span>
          <div className={styles.socialLinks}>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <Instagram size={24} />
              Instagram
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <Facebook size={24} />
              Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
