import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useLanguage } from '@context/LanguageContext';
import Button from '@components/common/Button';
import toast from 'react-hot-toast';
import styles from '@styles/components/AdminLogin.module.css';

export default function AdminLogin() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { success, error } = await login(email, password);

    if (success) {
      toast.success('Dobrodošli!');
      navigate('/admin');
    } else {
      toast.error(error || 'Pogrešan email ili lozinka');
    }

    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.logo}>Fashion White</h1>
          <span className={styles.adminBadge}>Admin</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
          >
            {t('loginButton')}
          </Button>
        </form>
      </div>
    </div>
  );
}
