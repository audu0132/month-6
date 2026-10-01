import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Storefront } from './components/Storefront';
import { OrdersView } from './components/OrdersView';
import { ServiceTelemetry } from './components/ServiceTelemetry';
import { AdminDashboard } from './components/AdminDashboard';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { ApiClient, ProductItem, UserSession } from './services/api';
import { CheckCircle2 } from 'lucide-react';

interface CartItem extends ProductItem {
  quantity: number;
}

export function App() {
  const [currentTab, setCurrentTab] = useState<'store' | 'orders' | 'telemetry' | 'admin'>('store');
  const [currentUser, setCurrentUser] = useState<UserSession>(ApiClient.getStoredUser());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added "${product.name}" to cart`);
  };

  const handleOrderSuccess = (order: any) => {
    setActiveOrder(order);
    setCurrentTab('orders');
    showToast(`Order ${order.id} placed successfully!`);
  };

  const handleLoginSuccess = (user: UserSession, token: string) => {
    ApiClient.saveSession(user, token);
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name} (${user.role.toUpperCase()})`);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 200,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--accent-primary)',
            boxShadow: 'var(--shadow-glow)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.9rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle2 size={18} color="var(--accent-emerald)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab: string) => setCurrentTab(tab as any)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        openAuthModal={() => setIsAuthOpen(true)}
      />

      {/* Views */}
      <main style={{ flex: 1 }}>
        {currentTab === 'store' && <Storefront onAddToCart={handleAddToCart} />}
        {currentTab === 'orders' && <OrdersView currentUser={currentUser} activeOrder={activeOrder} />}
        {currentTab === 'telemetry' && <ServiceTelemetry />}
        {currentTab === 'admin' && <AdminDashboard currentUser={currentUser} />}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.8rem',
          background: 'rgba(10, 13, 20, 0.8)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <strong>Enterprise Masterpiece Platform</strong> • Month 6 Portfolio Project
          </div>
          <div style={{ fontFamily: 'var(--font-mono)' }}>
            Architecture: Microservices • Gateway (4000) • Auth (4001) • User (4002) • Product (4003) • Order (4004)
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
