import { useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useLanguage } from "@context/LanguageContext";
import { useCart } from "@context/CartContext";
import { createOrder } from "@lib/supabase";
import { sendOrderNotification } from "@lib/email";
import { formatPrice, validatePhone } from "@utils/helpers";
import Button from "@components/common/Button";
import toast from "react-hot-toast";
import styles from "@styles/components/OrderForm.module.css";

export default function OrderForm({ onBack, onSuccess }) {
  const { t, language } = useLanguage();
  const { cart, totalPrice, clearCart, closeCart } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = true;
    }
    if (!formData.phone.trim() || !validatePhone(formData.phone)) {
      newErrors.phone = true;
    }
    if (!formData.address.trim()) {
      newErrors.address = true;
    }
    if (!formData.city.trim()) {
      newErrors.city = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        customer_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        note: formData.note || null,
        total: totalPrice,
        status: "new",
      };

      // Prepare order items
      const items = cart.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        size: item.size,
      }));

      // Create order in database
      const order = await createOrder(orderData, items);

      // Send email notification
      sendOrderNotification(order, items).catch((err) =>
        console.error("Email failed:", err),
      );

      setSuccess(true);

      // Clear cart and close after delay
      setTimeout(() => {
        clearCart();
        closeCart();
        onSuccess?.();
      }, 3000);
    } catch (error) {
      console.error("Order error:", error);
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>
          <CheckCircle size={48} />
        </div>
        <h3>{t("orderSuccess")}</h3>
        <p>{t("orderSuccessMessage")}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        <ArrowLeft size={18} />
        {t("yourCart")}
      </button>

      <h3 className={styles.title}>{t("orderDetails")}</h3>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <input
            type="text"
            name="name"
            placeholder={`${t("fullName")} *`}
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? styles.error : ""}
          />
        </div>

        <div className={styles.field}>
          <input
            type="tel"
            name="phone"
            placeholder={`${t("phone")} *`}
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? styles.error : ""}
          />
        </div>

        <div className={styles.field}>
          <input
            type="text"
            name="city"
            placeholder={`${t("city")} *`}
            value={formData.city}
            onChange={handleChange}
            className={errors.city ? styles.error : ""}
          />
        </div>

        <div className={styles.field}>
          <textarea
            name="address"
            placeholder={`${t("address")} *`}
            rows={2}
            value={formData.address}
            onChange={handleChange}
            className={errors.address ? styles.error : ""}
          />
        </div>

        <div className={styles.field}>
          <textarea
            name="note"
            placeholder={t("note")}
            rows={2}
            value={formData.note}
            onChange={handleChange}
          />
        </div>

        <p className={styles.notice}>{t("paymentOnDelivery")}</p>

        <div className={styles.summary}>
          <span>{t("total")}</span>
          <span className={styles.totalPrice}>{formatPrice(totalPrice)}</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          loading={loading}
        >
          {t("placeOrder")}
        </Button>
      </form>
    </div>
  );
}
