import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';
import { useCart } from '@context/CartContext';
import { formatPrice } from '@utils/helpers';
import Button from '@components/common/Button';
import OrderForm from './OrderForm';
import styles from '@styles/components/Cart.module.css';

export default function Cart() {
  const { t, language } = useLanguage();
  const { 
    cart, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity,
    totalItems,
    totalPrice,
  } = useCart();
  
  const [showOrderForm, setShowOrderForm] = useState(false);

  if (!isCartOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={closeCart} />
      <div className={styles.sidebar}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>
            <ShoppingBag size={20} />
            {t('yourCart')} ({totalItems})
          </h3>
          <button className={styles.closeButton} onClick={closeCart}>
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className={styles.items}>
          {cart.length === 0 ? (
            <div className={styles.empty}>
              <ShoppingBag size={48} strokeWidth={1} />
              <p>{t('cartEmpty')}</p>
              <Button variant="secondary" onClick={closeCart}>
                {t('continueShopping')}
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className={styles.itemPlaceholder} />
                  )}
                </div>
                
                <div className={styles.itemInfo}>
                  <h4 className={styles.itemName}>
                    {language === 'sr' ? item.name : item.nameEn}
                  </h4>
                  <p className={styles.itemSize}>{t('size')}: {item.size}</p>
                  
                  <div className={styles.itemActions}>
                    <div className={styles.quantityControl}>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <button 
                      className={styles.removeButton}
                      onClick={() => removeFromCart(item.productId, item.variantId)}
                    >
                      {t('remove')}
                    </button>
                  </div>
                </div>
                
                <div className={styles.itemPrice}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && !showOrderForm && (
          <div className={styles.footer}>
            <div className={styles.total}>
              <span>{t('total')}</span>
              <span className={styles.totalPrice}>{formatPrice(totalPrice)}</span>
            </div>
            <Button 
              variant="primary" 
              size="large" 
              fullWidth
              onClick={() => setShowOrderForm(true)}
            >
              {t('checkout')}
            </Button>
          </div>
        )}

        {/* Order Form */}
        {showOrderForm && (
          <OrderForm 
            onBack={() => setShowOrderForm(false)}
            onSuccess={() => {
              setShowOrderForm(false);
            }}
          />
        )}
      </div>
    </>
  );
}
