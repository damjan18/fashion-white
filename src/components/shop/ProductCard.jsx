import { useLanguage } from '@context/LanguageContext';
import { formatPrice, hasStock, getAvailableSizes } from '@utils/helpers';
import styles from '@styles/components/ProductCard.module.css';

export default function ProductCard({ product, onClick }) {
  const { language, t } = useLanguage();
  
  const name = language === 'sr' ? product.name_sr : product.name_en;
  const inStock = hasStock(product.variants);
  const availableSizes = getAvailableSizes(product.variants);

  return (
    <div 
      className={`${styles.card} ${!inStock ? styles.outOfStock : ''}`}
      onClick={onClick}
    >
      <div className={styles.imageWrapper}>
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={name}
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>
            <svg viewBox="0 0 100 100" className={styles.placeholderSvg}>
              <rect fill="#f5f5f5" width="100" height="100"/>
              <text x="50" y="55" textAnchor="middle" fill="#ccc" fontSize="12">No Image</text>
            </svg>
          </div>
        )}
        
        {!inStock && (
          <div className={styles.outOfStockBadge}>
            {t('outOfStock')}
          </div>
        )}
        
        {product.brand && (
          <div className={styles.brandBadge}>
            {product.brand.name}
          </div>
        )}
      </div>
      
      <div className={styles.info}>
        <span className={styles.category}>
          {t(product.category)}
        </span>
        
        <h3 className={styles.name}>{name}</h3>
        
        <div className={styles.footer}>
          <span className={styles.price}>
            {formatPrice(product.base_price)}
          </span>
          
          {inStock && availableSizes.length > 0 && (
            <span className={styles.sizes}>
              {availableSizes.slice(0, 4).join(' / ')}
              {availableSizes.length > 4 && ' ...'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
