import { useState, useEffect } from 'react';
import { Eye, Search } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';
import { getOrders, updateOrderStatus } from '@lib/supabase';
import { formatPrice, formatDateTime } from '@utils/helpers';
import { orderStatuses } from '@data/translations';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';
import toast from 'react-hot-toast';
import styles from '@styles/components/Orders.module.css';

export default function Orders() {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      
      const data = await getOrders(filters);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Status ažuriran');
      loadOrders();
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Greška pri ažuriranju');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusStyle = (status) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    return { backgroundColor: statusConfig?.color || '#888' };
  };

  const filteredOrders = orders.filter(o =>
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.phone.includes(search) ||
    o.id.toString().includes(search)
  );

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
        <h1 className={styles.title}>{t('orders')}</h1>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Pretraži po imenu, telefonu ili ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">Svi statusi</option>
          {orderStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {t(status.key)}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Kupac</th>
              <th>Telefon</th>
              <th>Ukupno</th>
              <th>Status</th>
              <th>Datum</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>
                  <span className={styles.customerName}>{order.customer_name}</span>
                  <span className={styles.customerCity}>{order.city}</span>
                </td>
                <td>{order.phone}</td>
                <td className={styles.total}>{formatPrice(order.total)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={styles.statusSelect}
                    style={getStatusStyle(order.status)}
                    disabled={updatingStatus}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {t(status.key)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={styles.date}>{formatDateTime(order.created_at)}</td>
                <td>
                  <button 
                    className={styles.viewBtn}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredOrders.length === 0 && (
          <p className={styles.empty}>Nema narudžbi</p>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Narudžba #${selectedOrder?.id}`}
        size="large"
      >
        {selectedOrder && (
          <div className={styles.orderDetail}>
            <div className={styles.detailSection}>
              <h4>Informacije o kupcu</h4>
              <div className={styles.detailGrid}>
                <div>
                  <span className={styles.detailLabel}>Ime</span>
                  <span className={styles.detailValue}>{selectedOrder.customer_name}</span>
                </div>
                <div>
                  <span className={styles.detailLabel}>Telefon</span>
                  <span className={styles.detailValue}>{selectedOrder.phone}</span>
                </div>
                <div>
                  <span className={styles.detailLabel}>Grad</span>
                  <span className={styles.detailValue}>{selectedOrder.city}</span>
                </div>
                <div>
                  <span className={styles.detailLabel}>Adresa</span>
                  <span className={styles.detailValue}>{selectedOrder.address}</span>
                </div>
              </div>
              {selectedOrder.note && (
                <div className={styles.note}>
                  <span className={styles.detailLabel}>Napomena</span>
                  <p>{selectedOrder.note}</p>
                </div>
              )}
            </div>

            <div className={styles.detailSection}>
              <h4>Artikli</h4>
              <div className={styles.itemsList}>
                {selectedOrder.order_items?.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>
                        {language === 'sr' 
                          ? item.variant?.product?.name_sr 
                          : item.variant?.product?.name_en}
                      </span>
                      <span className={styles.itemMeta}>
                        Veličina: {item.variant?.size} | Količina: {item.quantity}
                      </span>
                    </div>
                    <span className={styles.itemPrice}>
                      {formatPrice(item.price_at_purchase * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.orderSummary}>
              <div className={styles.summaryRow}>
                <span>Status</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className={styles.statusSelect}
                  style={getStatusStyle(selectedOrder.status)}
                  disabled={updatingStatus}
                >
                  {orderStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {t(status.key)}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.summaryRow}>
                <span>Ukupno</span>
                <span className={styles.totalPrice}>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
