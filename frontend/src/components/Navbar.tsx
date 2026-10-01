import React from 'react';
import { UserSession } from '../services/api';
import { ShoppingCart, Server, Shield, Layers, User, LayoutDashboard, Terminal } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserSession;
  setCurrentUser: (u: UserSession) => void;
  cartCount: number;
  openCart: () => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  setCurrentUser,
  cartCount,
  openCart,
  openAuthModal,
}) => {
  const switchRole = (role: 'admin' | 'manager' | 'customer') => {
    const names = {
      admin: 'Enterprise Admin',
      manager: 'Product Manager',
      customer: 'Jane Customer',
    };
    setCurrentUser({
      ...currentUser,
      role,
      name: names[role],
      email: `${role}@enterprise.io`,
    });
  };

  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50, position: 'sticky', top: 16 }}>
      {/* Brand Logo & Architecture Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
          <Layers size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              NEXUS<span style={{ color: 'var(--accent-secondary)' }}>MESH</span>
            </span>
            <span className="badge badge-primary">Enterprise v1.0</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>
            PORT 4000 • 5 MICROSERVICES ACTIVE
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => setCurrentTab('store')}
          className={`btn ${currentTab === 'store' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Layers size={16} /> Catalog & Store
        </button>

        <button
          onClick={() => setCurrentTab('orders')}
          className={`btn ${currentTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <ShoppingCart size={16} /> My Orders
        </button>

        <button
          onClick={() => setCurrentTab('telemetry')}
          className={`btn ${currentTab === 'telemetry' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Server size={16} /> Service Mesh Radar
        </button>

        {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`btn ${currentTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <LayoutDashboard size={16} /> Admin Operations
          </button>
        )}
      </nav>

      {/* Right Controls: Role Switcher, Cart, Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Quick Role Switcher Pill */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 3, border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => switchRole('customer')}
            style={{
              background: currentUser.role === 'customer' ? 'var(--accent-primary)' : 'transparent',
              color: '#fff',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 16,
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Customer
          </button>
          <button
            onClick={() => switchRole('manager')}
            style={{
              background: currentUser.role === 'manager' ? 'var(--accent-secondary)' : 'transparent',
              color: currentUser.role === 'manager' ? '#0f172a' : '#fff',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 16,
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Manager
          </button>
          <button
            onClick={() => switchRole('admin')}
            style={{
              background: currentUser.role === 'admin' ? 'var(--accent-emerald)' : 'transparent',
              color: currentUser.role === 'admin' ? '#0f172a' : '#fff',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 16,
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Admin
          </button>
        </div>

        {/* Cart Button */}
        <button
          onClick={openCart}
          className="btn btn-secondary"
          style={{ position: 'relative', padding: '8px 14px' }}
          aria-label="Shopping Cart"
        >
          <ShoppingCart size={18} />
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                background: 'var(--accent-rose)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(244, 63, 94, 0.6)',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>

        {/* User Identity / Login */}
        <button
          onClick={openAuthModal}
          className="btn btn-secondary"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <User size={16} color="var(--accent-secondary)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{currentUser.name.split(' ')[0]}</span>
          <span className={`badge ${currentUser.role === 'admin' ? 'badge-emerald' : currentUser.role === 'manager' ? 'badge-primary' : 'badge-amber'}`} style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
            {currentUser.role}
          </span>
        </button>
      </div>
    </header>
  );
};
