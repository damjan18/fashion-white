import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';
import { getBrands } from '@lib/supabase';
import styles from '@styles/components/ProductFilters.module.css';

export default function ProductFilters({ filters, onFilterChange, onClear }) {
  const { t } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getBrands().then(setBrands);
  }, []);

  const hasActiveFilters = filters.brand || filters.style || filters.inStockOnly;

  return (
    <div className={styles.container}>
      {/* Mobile Toggle */}
      <button 
        className={styles.mobileToggle}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={18} />
        {t('filters')}
        {hasActiveFilters && <span className={styles.badge} />}
        <ChevronDown size={16} className={isOpen ? styles.rotated : ''} />
      </button>

      {/* Filters */}
      <div className={`${styles.filters} ${isOpen ? styles.open : ''}`}>
        {/* Brand Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>{t('brand')}</label>
          <select
            value={filters.brand || ''}
            onChange={(e) => onFilterChange({ ...filters, brand: e.target.value || null })}
            className={styles.select}
          >
            <option value="">{t('allBrands')}</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Style Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>{t('style')}</label>
          <select
            value={filters.style || ''}
            onChange={(e) => onFilterChange({ ...filters, style: e.target.value || null })}
            className={styles.select}
          >
            <option value="">{t('allStyles')}</option>
            <option value="streetwear">{t('streetwear')}</option>
            <option value="elegant">{t('elegant')}</option>
          </select>
        </div>

        {/* Sort */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>{t('sortBy')}</label>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
            className={styles.select}
          >
            <option value="newest">{t('newest')}</option>
            <option value="price-low-high">{t('priceLowHigh')}</option>
            <option value="price-high-low">{t('priceHighLow')}</option>
          </select>
        </div>

        {/* In Stock Toggle */}
        <div className={styles.filterGroup}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={filters.inStockOnly || false}
              onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked })}
            />
            <span className={styles.checkmark} />
            {t('inStockOnly')}
          </label>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button className={styles.clearButton} onClick={onClear}>
            <X size={14} />
            {t('clearFilters')}
          </button>
        )}
      </div>
    </div>
  );
}
