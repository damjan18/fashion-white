import { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';
import { useCart } from '@context/CartContext';
import { formatPrice } from '@utils/helpers';
import Button from '@components/common/Button';
import styles from '@styles/components/ProductModal.module.css';

export default function ProductModal({ product, isOpen, onClose }) {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const name = language === 'sr' ? product.name_sr : product.name_en;
  const description = language === 'sr' ? product.description_sr : product.description_en;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
    onClose();
    setSelectedVariant(null);
    setQuantity(1);
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= (selectedVariant?.quantity || 10)) {
      setQuantity(newQty);
    }
  };

  const availableVariants = product.variants?.filter(v => v.quantity > 0) || [];
  const allVariants = product.variants || [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.content}>
          {/* Image */}
          <div className={styles.imageSection}>
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={name}
                className={styles.image}
              />
            ) : (
              <div className={styles.placeholder}>
                <span>No Image</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className={styles.details}>
            {product.brand && (
              <span className={styles.brand}>{product.brand.name}</span>
            )}
            
            <span className={styles.category}>{t(product.category)}</span>
            
            <h2 className={styles.name}>{name}</h2>
            
            <p className={styles.price}>{formatPrice(product.base_price)}</p>
            
            {description && (
              <p className={styles.description}>{description}</p>
            )}

            {/* Size Selection */}
            <div className={styles.sizeSection}>
              <p className={styles.sizeLabel}>{t('selectSize')}</p>
              <div className={styles.sizes}>
                {allVariants.map((variant) => {
                  const isAvailable = variant.quantity > 0;
                  const isSelected = selectedVariant?.id === variant.id;
                  
                  return (
                    <button
                      key={variant.id}
                      className={`${styles.sizeButton} ${isSelected ? styles.selected : ''} ${!isAvailable ? styles.unavailable : ''}`}
                      onClick={() => isAvailable && setSelectedVariant(variant)}
                      disabled={!isAvailable}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>
              
              {selectedVariant && (
                <p className={styles.stockInfo}>
                  {selectedVariant.quantity} {t('inStock')}
                </p>
              )}
            </div>

            {/* Quantity */}
            {selectedVariant && (
              <div className={styles.quantitySection}>
                <p className={styles.quantityLabel}>{t('quantity')}</p>
                <div className={styles.quantityControl}>
                  <button 
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <button 
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= selectedVariant.quantity}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <Button
              variant="primary"
              size="large"
              fullWidth
              disabled={!selectedVariant || availableVariants.length === 0}
              onClick={handleAddToCart}
            >
              {availableVariants.length === 0 ? t('outOfStock') : t('addToCart')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
