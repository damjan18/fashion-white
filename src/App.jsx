import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { LanguageProvider } from '@context/LanguageContext';
import { CartProvider } from '@context/CartContext';
import { AuthProvider, useAuth } from '@context/AuthContext';

// Layout Components
import Navbar from '@components/common/Navbar';
import Footer from '@components/common/Footer';
import Cart from '@components/shop/Cart';
import AdminLayout from '@components/admin/AdminLayout';

// Pages
import Home from '@pages/Home';
import Shop from '@pages/Shop';
import About from '@pages/About';
import Contact from '@pages/Contact';

// Admin Pages
import AdminLogin from '@pages/admin/AdminLogin';
import Dashboard from '@pages/admin/Dashboard';
import Products from '@pages/admin/Products';
import Inventory from '@pages/admin/Inventory';
import Orders from '@pages/admin/Orders';
import Brands from '@pages/admin/Brands';
import Analytics from '@pages/admin/Analytics';

// Styles
import '@styles/globals.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #f0f0f0',
          borderTopColor: '#1a1a1a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

// Public Layout (with Navbar & Footer)
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <Cart />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              } />
              <Route path="/shop" element={
                <PublicLayout>
                  <Shop />
                </PublicLayout>
              } />
              <Route path="/shop/:category" element={
                <PublicLayout>
                  <Shop />
                </PublicLayout>
              } />
              <Route path="/about" element={
                <PublicLayout>
                  <About />
                </PublicLayout>
              } />
              <Route path="/contact" element={
                <PublicLayout>
                  <Contact />
                </PublicLayout>
              } />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="orders" element={<Orders />} />
                <Route path="brands" element={<Brands />} />
                <Route path="analytics" element={<Analytics />} />
              </Route>

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '13px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
