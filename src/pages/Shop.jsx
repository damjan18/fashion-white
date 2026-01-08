import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import { getProducts } from '@lib/supabase';
import { sortProducts } from '@utils/helpers';
import { categories } from '@data/translations';
import ProductCard from '@components/shop/ProductCard';
import ProductModal from '@components/shop/ProductModal';
import ProductFilters from '@components/shop/ProductFilters';
import styles from '@styles/components/Shop.module.css';

export default function Shop() {
  const { category } = useParams();
  const { t } = useLanguage();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    brand: null,
    style: null,
    sort: 'newest',
    inStockOnly: false,
  });

  const currentCategory = category || 'all';
  const categoryData = categories.find(c => c.slug === currentCategory) || categories[0];

  useEffect(() => {
    setLoading(true);
    getProducts({
      category: currentCategory === 'all' ? null : currentCategory,
      brand: filters.brand,
      style: filters.style,
      inStockOnly: filters.inStockOnly,
    })
      .then(data => {
        const sorted = sortProducts(data, filters.sort);
        setProducts(sorted);
      })
      .finally(() => setLoading(false));
  }, [currentCategory, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      brand: null,
      style: null,
      sort: 'newest',
      inStockOnly: false,
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>{t(categoryData.key)}</h1>
          
          {/* Category Navigation */}
          <nav className={styles.categoryNav}>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={cat.slug === 'all' ? '/shop' : `/shop/${cat.slug}`}
                className={`${styles.categoryLink} ${currentCategory === cat.slug ? styles.active : ''}`}
              >
                {t(cat.key)}
              </Link>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <ProductFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Products Grid */}
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p>{t('noResults')}</p>
          </div>
        ) : (
          <>
            <p className={styles.resultsCount}>
              {products.length} {products.length === 1 ? 'proizvod' : 'proizvoda'}
            </p>
            <div className={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
