import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';
import { getOrders, getProducts, getLowStockProducts } from '@lib/supabase';
import { formatPrice, formatDateTime } from '@utils/helpers';
import { orderStatuses } from '@data/translations';
import styles from '@styles/components/Dashboard.module.css';

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [orders, products, lowStock] = await Promise.all([
        getOrders({}),
        getProducts({}),
        getLowStockProducts(3),
      ]);

      const todayOrders = orders.filter(o => 
        new Date(o.created_at) >= today
      );
      
      const confirmedOrders = orders.filter(o => 
        ['confirmed', 'shipped', 'delivered'].includes(o.status)
      );
      
      const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.total, 0);

      setStats({
        todayOrders: todayOrders.length,
        totalRevenue,
        lowStockCount: lowStock.length,
        totalProducts: products.length,
      });

      setRecentOrders(orders.slice(0, 5));
      setLowStockItems(lowStock.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    return { backgroundColor: statusConfig?.color || '#888' };
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>{t('dashboard')}</h1>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#3b82f6' }}>
            <ShoppingCart size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.todayOrders}</span>
            <span className={styles.statLabel}>{t('todayOrders')}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{formatPrice(stats.totalRevenue)}</span>
            <span className={styles.statLabel}>{t('totalRevenue')}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#f59e0b' }}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.lowStockCount}</span>
            <span className={styles.statLabel}>{t('lowStock')}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#8b5cf6' }}>
            <Package size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.totalProducts}</span>
            <span className={styles.statLabel}>{t('totalProducts')}</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Recent Orders */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{t('recentOrders')}</h2>
            <Link to="/admin/orders" className={styles.viewAll}>
              Pogledaj sve
            </Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <p className={styles.empty}>Nema narudžbi</p>
          ) : (
            <div className={styles.ordersList}>
              {recentOrders.map((order) => (
                <div key={order.id} className={styles.orderItem}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderCustomer}>{order.customer_name}</span>
                    <span className={styles.orderDate}>
                      {formatDateTime(order.created_at)}
                    </span>
                  </div>
                  <div className={styles.orderMeta}>
                    <span 
                      className={styles.orderStatus}
                      style={getStatusStyle(order.status)}
                    >
                      {t(`status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`)}
                    </span>
                    <span className={styles.orderTotal}>
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{t('lowStock')}</h2>
            <Link to="/admin/inventory" className={styles.viewAll}>
              Pogledaj sve
            </Link>
          </div>
          
          {lowStockItems.length === 0 ? (
            <p className={styles.empty}>Sve je na stanju!</p>
          ) : (
            <div className={styles.stockList}>
              {lowStockItems.map((item) => (
                <div key={item.id} className={styles.stockItem}>
                  <div className={styles.stockInfo}>
                    <span className={styles.stockProduct}>
                      {item.product?.name_sr || 'Unknown'}
                    </span>
                    <span className={styles.stockSize}>
                      Veličina: {item.size}
                    </span>
                  </div>
                  <span className={`${styles.stockQty} ${item.quantity === 0 ? styles.outOfStock : ''}`}>
                    {item.quantity} kom
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
