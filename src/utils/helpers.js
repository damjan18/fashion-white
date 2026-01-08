// Format price with currency
export function formatPrice(price, currency = '€') {
  return `${currency}${price.toFixed(2)}`;
}

// Format date
export function formatDate(dateString, locale = 'sr-Latn-ME') {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format date and time
export function formatDateTime(dateString, locale = 'sr-Latn-ME') {
  const date = new Date(dateString);
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Generate SKU
export function generateSKU(productName, size, brandName = '') {
  const brand = brandName.substring(0, 3).toUpperCase();
  const product = productName.substring(0, 3).toUpperCase();
  const sizeCode = size.toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${brand}-${product}-${sizeCode}-${random}`;
}

// Slugify text
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Calculate total stock for a product
export function calculateTotalStock(variants) {
  if (!variants || !Array.isArray(variants)) return 0;
  return variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
}

// Check if product has any stock
export function hasStock(variants) {
  return calculateTotalStock(variants) > 0;
}

// Get available sizes (with stock > 0)
export function getAvailableSizes(variants) {
  if (!variants || !Array.isArray(variants)) return [];
  return variants
    .filter(v => v.quantity > 0)
    .map(v => v.size);
}

// Sort products
export function sortProducts(products, sortBy) {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'price-low-high':
      return sorted.sort((a, b) => a.base_price - b.base_price);
    case 'price-high-low':
      return sorted.sort((a, b) => b.base_price - a.base_price);
    case 'newest':
    default:
      return sorted.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
  }
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Validate phone number (Montenegro format)
export function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  // Montenegro numbers: +382 XX XXX XXX or 0XX XXX XXX
  return cleaned.length >= 8 && cleaned.length <= 12;
}

// Validate email
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Truncate text
export function truncate(text, length = 100) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Group array by key
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

// Calculate percentage change
export function percentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Local storage helpers with error handling
export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
  }
}
