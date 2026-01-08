import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';
import { getProducts } from '@lib/supabase';
import ProductCard from '@components/shop/ProductCard';
import ProductModal from '@components/shop/ProductModal';
import Button from '@components/common/Button';
import styles from '@styles/components/Home.module.css';

export default function Home() {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({})
      .then(products => {
        setFeaturedProducts(products.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground} />
        <div className={styles.heroContent}>
          <p className={`${styles.heroSubtitle} fade-in`}>
            {t('heroSubtitle')}
          </p>
          <h1 className={`${styles.heroTitle} fade-in fade-in-delay-1`}>
            {t('heroTitle')}<br />
            <span className={styles.heroTitleItalic}>{t('heroTitleItalic')}</span>
          </h1>
          <p className={`${styles.heroDescription} fade-in fade-in-delay-2`}>
            {t('heroDescription')}
          </p>
          <Link to="/shop" className="fade-in fade-in-delay-3">
            <Button variant="primary" size="large">
              {t('exploreCollection')}
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featured}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('featuredPieces')}</h2>
          
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}
          
          <div className={styles.viewAll}>
            <Link to="/shop">
              <Button variant="secondary">
                {t('viewAllProducts')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className={styles.values}>
        <div className={styles.container}>
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <h3>{t('premiumQuality')}</h3>
              <p>{t('premiumQualityDesc')}</p>
            </div>
            <div className={styles.valueItem}>
              <h3>{t('curatedSelection')}</h3>
              <p>{t('curatedSelectionDesc')}</p>
            </div>
            <div className={styles.valueItem}>
              <h3>{t('effortlessStyle')}</h3>
              <p>{t('effortlessStyleDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
