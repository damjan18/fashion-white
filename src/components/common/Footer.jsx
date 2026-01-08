import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';
import { categories } from '@data/translations';
import styles from '@styles/components/Footer.module.css';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brandSection}>
            <h3 className={styles.brandName}>Fashion White</h3>
            <p className={styles.tagline}>
              {t('footerTagline')}<br />
              {t('footerTagline2')}
            </p>
          </div>

          {/* Shop Links */}
          <div className={styles.linksSection}>
            <h4 className={styles.sectionTitle}>{t('shop')}</h4>
            <ul className={styles.linksList}>
              {categories.slice(0, 6).map((category) => (
                <li key={category.slug}>
                  <Link 
                    to={category.slug === 'all' ? '/shop' : `/shop/${category.slug}`}
                    className={styles.link}
                  >
                    {t(category.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div className={styles.linksSection}>
            <h4 className={styles.sectionTitle}>Info</h4>
            <ul className={styles.linksList}>
              <li>
                <Link to="/about" className={styles.link}>{t('about')}</Link>
              </li>
              <li>
                <Link to="/contact" className={styles.link}>{t('contact')}</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.contactSection}>
            <h4 className={styles.sectionTitle}>{t('contact')}</h4>
            <p className={styles.contactInfo}>+382 67 123 456</p>
            <p className={styles.contactInfo}>info@fashionwhite.me</p>
            
            <div className={styles.social}>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p>© {currentYear} Fashion White. {t('allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
}
