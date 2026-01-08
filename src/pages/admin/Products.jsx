import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';
import { getProducts, getBrands, createProduct, updateProduct, deleteProduct, createVariant } from '@lib/supabase';
import { formatPrice } from '@utils/helpers';
import { categories, sizes } from '@data/translations';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import toast from 'react-hot-toast';
import styles from '@styles/components/Products.module.css';

export default function Products() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name_sr: '',
    name_en: '',
    description_sr: '',
    description_en: '',
    category: 't-shirts',
    brand_id: '',
    base_price: '',
    style: 'streetwear',
    image_url: '',
    sizes: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, brandsData] = await Promise.all([
        getProducts({}),
        getBrands(),
      ]);
      setProducts(productsData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name_sr: product.name_sr || '',
        name_en: product.name_en || '',
        description_sr: product.description_sr || '',
        description_en: product.description_en || '',
        category: product.category || 't-shirts',
        brand_id: product.brand_id || '',
        base_price: product.base_price || '',
        style: product.style || 'streetwear',
        image_url: product.image_url || '',
        sizes: product.variants?.map(v => v.size) || [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name_sr: '',
        name_en: '',
        description_sr: '',
        description_en: '',
        category: 't-shirts',
        brand_id: '',
        base_price: '',
        style: 'streetwear',
        image_url: '',
        sizes: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name_sr || !formData.base_price) {
      toast.error('Popunite obavezna polja');
      return;
    }

    setSaving(true);

    try {
      const productData = {
        name_sr: formData.name_sr,
        name_en: formData.name_en || formData.name_sr,
        description_sr: formData.description_sr,
        description_en: formData.description_en,
        category: formData.category,
        brand_id: formData.brand_id || null,
        base_price: parseFloat(formData.base_price),
        style: formData.style,
        image_url: formData.image_url,
        is_active: true,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Proizvod ažuriran');
      } else {
        const newProduct = await createProduct(productData);
        
        // Create variants for selected sizes
        for (const size of formData.sizes) {
          await createVariant({
            product_id: newProduct.id,
            size,
            quantity: 0,
            sku: `${formData.category.substring(0, 3).toUpperCase()}-${size}-${Date.now()}`,
          });
        }
        
        toast.success('Proizvod dodat');
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      await deleteProduct(product.id);
      toast.success('Proizvod obrisan');
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Greška pri brisanju');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name_sr.toLowerCase().includes(search.toLowerCase()) ||
                         p.name_en?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getSizeOptions = () => {
    if (['pants', 'jeans', 'shorts'].includes(formData.category)) {
      return sizes.pants;
    }
    return sizes.clothing;
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
        <h1 className={styles.title}>{t('products')}</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          {t('addProduct')}
        </Button>
      </div>

      {/* Filters */}
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
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.select}
        >
          <option value="">Sve kategorije</option>
          {categories.slice(1).map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {t(cat.key)}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Slika</th>
              <th>Naziv</th>
              <th>Kategorija</th>
              <th>Brend</th>
              <th>Cijena</th>
              <th>Stanje</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const totalStock = product.variants?.reduce((sum, v) => sum + v.quantity, 0) || 0;
              
              return (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productImage}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name_sr} />
                      ) : (
                        <div className={styles.noImage}>No img</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={styles.productName}>{product.name_sr}</span>
                  </td>
                  <td>{t(product.category)}</td>
                  <td>{product.brand?.name || '-'}</td>
                  <td>{formatPrice(product.base_price)}</td>
                  <td>
                    <span className={`${styles.stock} ${totalStock === 0 ? styles.outOfStock : totalStock < 5 ? styles.lowStock : ''}`}>
                      {totalStock} kom
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={styles.actionBtn}
                        onClick={() => handleOpenModal(product)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredProducts.length === 0 && (
          <p className={styles.empty}>Nema proizvoda</p>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? t('editProduct') : t('addProduct')}
        size="large"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>{t('productName')} (SR) *</label>
              <input
                type="text"
                name="name_sr"
                value={formData.name_sr}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className={styles.field}>
              <label>{t('productNameEn')} (EN)</label>
              <input
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>{t('category')} *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {t(cat.key)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.field}>
              <label>{t('brand')}</label>
              <select
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
              >
                <option value="">-- Bez brenda --</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>{t('price')} (€) *</label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className={styles.field}>
              <label>{t('style')}</label>
              <select
                name="style"
                value={formData.style}
                onChange={handleChange}
              >
                <option value="streetwear">{t('streetwear')}</option>
                <option value="elegant">{t('elegant')}</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>URL slike</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className={styles.field}>
            <label>{t('description')} (SR)</label>
            <textarea
              name="description_sr"
              value={formData.description_sr}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label>{t('descriptionEn')} (EN)</label>
            <textarea
              name="description_en"
              value={formData.description_en}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {!editingProduct && (
            <div className={styles.field}>
              <label>Veličine</label>
              <div className={styles.sizesGrid}>
                {getSizeOptions().map((size) => (
                  <label key={size} className={styles.sizeCheckbox}>
                    <input
                      type="checkbox"
                      checked={formData.sizes.includes(size)}
                      onChange={() => handleSizeToggle(size)}
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
