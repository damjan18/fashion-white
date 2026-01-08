import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';
import { useCart } from '@context/CartContext';
import { categories } from '@data/translations';
import styles from '@styles/components/Navbar.module.css';

export default function Navbar() {
  const { t, language, toggleLanguage } = useLanguage();
  const { totalItems, openCart } = useCart();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isShopActive = location.pathname.startsWith('/shop');

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <h1>Fashion White</h1>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <Link 
            to="/" 
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            {t('home')}
          </Link>
          
          <div 
            className={styles.dropdown}
            onMouseEnter={() => setIsShopDropdownOpen(true)}
            onMouseLeave={() => setIsShopDropdownOpen(false)}
          >
            <Link 
              to="/shop" 
              className={`${styles.navLink} ${isShopActive ? styles.active : ''}`}
            >
              {t('shop')}
              <ChevronDown size={14} className={styles.chevron} />
            </Link>
            
            {isShopDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    to={category.slug === 'all' ? '/shop' : `/shop/${category.slug}`}
                    className={styles.dropdownItem}
                  >
                    {t(category.key)}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <Link 
            to="/about" 
            className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}
          >
            {t('about')}
          </Link>
          
          <Link 
            to="/contact" 
            className={`${styles.navLink} ${isActive('/contact') ? styles.active : ''}`}
          >
            {t('contact')}
          </Link>
        </div>

        {/* Right Side */}
        <div className={styles.rightSection}>
          {/* Language Toggle */}
          <button 
            className={styles.langToggle}
            onClick={toggleLanguage}
          >
            {language === 'sr' ? 'EN' : 'SR'}
          </button>

          {/* Cart Button */}
          <button className={styles.cartButton} onClick={openCart}>
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems}</span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className={styles.mobileMenuToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link 
            to="/" 
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('home')}
          </Link>
          
          <div className={styles.mobileShopSection}>
            <span className={styles.mobileNavLabel}>{t('shop')}</span>
            <div className={styles.mobileShopLinks}>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={category.slug === 'all' ? '/shop' : `/shop/${category.slug}`}
                  className={styles.mobileShopLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(category.key)}
                </Link>
              ))}
            </div>
          </div>
          
          <Link 
            to="/about" 
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('about')}
          </Link>
          
          <Link 
            to="/contact" 
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('contact')}
          </Link>
        </div>
      )}
    </nav>
  );
}
