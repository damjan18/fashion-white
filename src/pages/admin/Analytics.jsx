import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useLanguage } from '@context/LanguageContext';
import { getAnalytics } from '@lib/supabase';
import { formatPrice } from '@utils/helpers';
import styles from '@styles/components/Analytics.module.css';

export default function Analytics() {
  const { t, language } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const dateTo = new Date().toISOString();
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(dateRange));
      
      const data = await getAnalytics(dateFrom.toISOString(), dateTo);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRevenueData = () => {
    if (!analytics?.revenueByDay) return [];
    
    return Object.entries(analytics.revenueByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('sr-Latn-ME', { month: 'short', day: 'numeric' }),
        revenue,
      }));
  };

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
        <h1 className={styles.title}>{t('analytics')}</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className={styles.select}
        >
          <option value="7">Posljednjih 7 dana</option>
          <option value="30">Posljednjih 30 dana</option>
          <option value="90">Posljednjih 90 dana</option>
          <option value="365">Posljednja godina</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>
            {formatPrice(analytics?.totalRevenue || 0)}
          </span>
          <span className={styles.summaryLabel}>Ukupan prihod</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>
            {analytics?.totalOrders || 0}
          </span>
          <span className={styles.summaryLabel}>Broj narudžbi</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>
            {formatPrice(analytics?.averageOrderValue || 0)}
          </span>
          <span className={styles.summaryLabel}>Prosječna vrijednost</span>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className={styles.chartCard}>
        <h3>Prihod po danima</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatRevenueData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip 
                formatter={(value) => [`€${value}`, 'Prihod']}
                contentStyle={{ 
                  background: '#fff', 
                  border: '1px solid #eee',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#1a1a1a" 
                strokeWidth={2}
                dot={{ fill: '#1a1a1a', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className={styles.chartCard}>
        <h3>Najprodavaniji proizvodi</h3>
        {analytics?.topProducts?.length > 0 ? (
          <div className={styles.productsList}>
            {analytics.topProducts.map((item, index) => (
              <div key={index} className={styles.productItem}>
                <span className={styles.productRank}>{index + 1}</span>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>
                    {language === 'sr' ? item.product?.name_sr : item.product?.name_en}
                  </span>
                  <span className={styles.productStats}>
                    {item.quantity} prodato | {formatPrice(item.revenue)} prihod
                  </span>
                </div>
                <div className={styles.productBar}>
                  <div 
                    className={styles.productBarFill}
                    style={{ 
                      width: `${(item.quantity / analytics.topProducts[0].quantity) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Nema podataka o prodaji</p>
        )}
      </div>
    </div>
  );
}
