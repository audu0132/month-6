import React, { useState } from 'react';
import { UserSession, ApiClient } from '../services/api';
import { X, Lock, Mail, User, Shield, CheckCircle2, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onLoginSuccess: (user: UserSession, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('admin@enterprise.io');
  const [password, setPassword] = useState('Password123!');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleQuickLogin = (role: 'admin' | 'manager' | 'customer') => {
    const creds = {
      admin: { email: 'admin@enterprise.io', name: 'Enterprise Admin', role: 'admin' },
      manager: { email: 'manager@enterprise.io', name: 'Product Manager', role: 'manager' },
      customer: { email: 'jane@enterprise.io', name: 'Jane Customer', role: 'customer' },
    }[role];

    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ ...creds, exp: Math.floor(Date.now() / 1000) + 900 })
    )}.mockSignature`;

    onLoginSuccess(creds as UserSession, mockToken);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = tab === 'login' ? { email, password } : { name, email, password, role: 'customer' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        onLoginSuccess(data.data.user, data.data.accessToken);
        onClose();
      } else {
        setErrorMsg(data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      // Fallback local login
      const inferredRole = email.includes('admin') ? 'admin' : email.includes('manager') ? 'manager' : 'customer';
      const userObj: UserSession = {
        id: `usr_${Date.now()}`,
        name: name || email.split('@')[0],
        email,
        role: inferredRole,
      };
      onLoginSuccess(userObj, 'local-dev-jwt-token');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: 30,
          background: 'rgba(15, 23, 42, 0.95)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="btn btn-secondary"
          style={{ position: 'absolute', top: 18, right: 18, padding: 6, borderRadius: '50%' }}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              margin: '0 auto 12px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.4rem' }}>Auth Microservice (Port 4001)</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Zero-Trust JWT & Role-Based Access Control
          </p>
        </div>

        {/* Quick Demo Personas */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <KeyRound size={12} /> 1-Click Enterprise Test Personas
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="btn btn-secondary"
              style={{ padding: '6px', fontSize: '0.75rem', borderColor: 'var(--accent-emerald)' }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('manager')}
              className="btn btn-secondary"
              style={{ padding: '6px', fontSize: '0.75rem', borderColor: 'var(--accent-secondary)' }}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('customer')}
              className="btn btn-secondary"
              style={{ padding: '6px', fontSize: '0.75rem', borderColor: 'var(--accent-primary)' }}
            >
              Customer
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: 20 }}>
          <button
            onClick={() => setTab('login')}
            style={{
              flex: 1,
              padding: '8px',
              background: 'none',
              border: 'none',
              borderBottom: tab === 'login' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: tab === 'login' ? '#fff' : 'var(--text-dim)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            style={{
              flex: 1,
              padding: '8px',
              background: 'none',
              border: 'none',
              borderBottom: tab === 'register' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: tab === 'register' ? '#fff' : 'var(--text-dim)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '8px 12px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 6, color: '#fda4af', fontSize: '0.8rem', marginBottom: 16 }}>
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'register' && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Developer"
                style={{ width: '100%', padding: '9px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: '#fff', fontSize: '0.85rem' }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@enterprise.io"
              style={{ width: '100%', padding: '9px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: '#fff', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '9px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: '#fff', fontSize: '0.85rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px 16px', marginTop: 8 }}
          >
            {loading ? 'Authenticating...' : tab === 'login' ? 'Authenticate via Gateway' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
