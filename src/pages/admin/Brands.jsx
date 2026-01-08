import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';
import { getBrands, createBrand, updateBrand } from '@lib/supabase';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import toast from 'react-hot-toast';
import styles from '@styles/components/Brands.module.css';

export default function Brands() {
  const { t } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '', logo_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({ name: brand.name, logo_url: brand.logo_url || '' });
    } else {
      setEditingBrand(null);
      setFormData({ name: '', logo_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Unesite naziv brenda');
      return;
    }

    setSaving(true);

    try {
      const brandData = {
        name: formData.name,
        logo_url: formData.logo_url || null,
        is_active: true,
      };

      if (editingBrand) {
        await updateBrand(editingBrand.id, brandData);
        toast.success('Brend ažuriran');
      } else {
        await createBrand(brandData);
        toast.success('Brend dodat');
      }

      handleCloseModal();
      loadBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error('Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (brand) => {
    if (!confirm(`Da li ste sigurni da želite deaktivirati brend "${brand.name}"?`)) return;

    try {
      await updateBrand(brand.id, { is_active: false });
      toast.success('Brend deaktiviran');
      loadBrands();
    } catch (error) {
      console.error('Error deactivating brand:', error);
      toast.error('Greška pri deaktivaciji');
    }
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
        <h1 className={styles.title}>{t('brands')}</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          {t('addBrand')}
        </Button>
      </div>

      {/* Brands Grid */}
      <div className={styles.brandsGrid}>
        {brands.map((brand) => (
          <div key={brand.id} className={styles.brandCard}>
            <div className={styles.brandLogo}>
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} />
              ) : (
                <span className={styles.brandInitial}>
                  {brand.name.charAt(0)}
                </span>
              )}
            </div>
            <h3 className={styles.brandName}>{brand.name}</h3>
            <div className={styles.brandActions}>
              <button 
                className={styles.actionBtn}
                onClick={() => handleOpenModal(brand)}
              >
                <Edit size={16} />
              </button>
              <button 
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={() => handleDeactivate(brand)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {brands.length === 0 && (
        <p className={styles.empty}>Nema brendova. Dodajte prvi brend.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBrand ? t('editBrand') : t('addBrand')}
        size="small"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>{t('brandName')} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="npr. Polo Ralph Lauren"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Logo URL</label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className={styles.formActions}>
            <Button variant="ghost" type="button" onClick={handleCloseModal}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              {t('save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
