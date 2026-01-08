import { useState, useEffect } from 'react';
import { Search, Save, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';
import { getProducts, updateStock } from '@lib/supabase';
import Button from '@components/common/Button';
import toast from 'react-hot-toast';
import styles from '@styles/components/Inventory.module.css';

export default function Inventory() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [changes, setChanges] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts({});
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (variantId, newQuantity) => {
    const qty = Math.max(0, parseInt(newQuantity) || 0);
    setChanges(prev => ({
      ...prev,
      [variantId]: qty,
    }));
  };

  const handleSave = async () => {
    if (Object.keys(changes).length === 0) {
      toast.error('Nema promjena za čuvanje');
      return;
    }

    setSaving(true);

    try {
      const promises = Object.entries(changes).map(([variantId, quantity]) =>
        updateStock(variantId, quantity)
      );
      
      await Promise.all(promises);
      
      toast.success('Stanje ažurirano');
      setChanges({});
      loadProducts();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  };

  const getVariantQuantity = (variant) => {
    return changes[variant.id] !== undefined ? changes[variant.id] : variant.quantity;
  };

  const filteredProducts = products.filter(p =>
    p.name_sr.toLowerCase().includes(search.toLowerCase()) ||
    p.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const hasChanges = Object.keys(changes).length > 0;

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('inventory')}</h1>
        {hasChanges && (
          <Button variant="primary" onClick={handleSave} loading={saving}>
            <Save size={18} />
            Sačuvaj promjene ({Object.keys(changes).length})
          </Button>
        )}
      </div>

      {/* Search */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Pretraži proizvode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory Grid */}
      <div className={styles.inventoryGrid}>
        {filteredProducts.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productHeader}>
              <div className={styles.productImage}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name_sr} />
                ) : (
                  <div className={styles.noImage}>No img</div>
                )}
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name_sr}</h3>
                <p className={styles.productMeta}>
                  {product.brand?.name && <span>{product.brand.name}</span>}
                  <span>{t(product.category)}</span>
                </p>
              </div>
            </div>

            <div className={styles.variants}>
              <div className={styles.variantsHeader}>
                <span>Veličina</span>
                <span>SKU</span>
                <span>Količina</span>
              </div>
              
              {product.variants?.length > 0 ? (
                product.variants.map((variant) => {
                  const quantity = getVariantQuantity(variant);
                  const isLow = quantity > 0 && quantity <= 3;
                  const isOut = quantity === 0;
                  const hasChange = changes[variant.id] !== undefined;
                  
                  return (
                    <div 
                      key={variant.id} 
                      className={`${styles.variantRow} ${hasChange ? styles.changed : ''}`}
                    >
                      <span className={styles.variantSize}>{variant.size}</span>
                      <span className={styles.variantSku}>{variant.sku || '-'}</span>
                      <div className={styles.quantityInput}>
                        {(isLow || isOut) && (
                          <AlertTriangle 
                            size={14} 
                            className={isOut ? styles.alertOut : styles.alertLow} 
                          />
                        )}
                        <input
                          type="number"
                          min="0"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(variant.id, e.target.value)}
                          className={`${isOut ? styles.outOfStock : isLow ? styles.lowStock : ''}`}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className={styles.noVariants}>Nema veličina</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className={styles.empty}>Nema proizvoda</p>
      )}
    </div>
  );
}
