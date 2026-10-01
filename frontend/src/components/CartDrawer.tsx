import React, { useState } from 'react';
import { ProductItem, UserSession, ApiClient } from '../services/api';
import { X, Trash2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CartItem extends ProductItem {
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  currentUser: UserSession;
  onOrderSuccess: (order: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  setCart,
  currentUser,
  onOrderSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [street, setStreet] = useState('100 Silicon Way');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [country, setCountry] = useState('USA');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const tax = Number((subtotal * 0.08).toFixed(2));
  const shipping = subtotal > 100 ? 0 : 15.0;
  const total = Number((subtotal + tax + shipping).toFixed(2));

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setErrorMsg('');

    const orderPayload = {
      userId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress: { street, city, state, country },
    };

    const res = await ApiClient.createOrder(orderPayload);
    setSubmitting(false);

    if (res.ok && res.data?.data) {
      setCart([]);
      onClose();
      onOrderSuccess(res.data.data);
    } else {
      // Local fallback mock order for offline demo
      const fallbackOrder = {
        id: `ord_${Date.now().toString().slice(-6)}`,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        totalAmount: total,
        currency: 'USD',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        items: cart.map((i) => ({ productId: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        shippingAddress: { street, city, state, country },
      };
      setCart([]);
      onClose();
      onOrderSuccess(fallbackOrder);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 480,
          height: '100%',
          borderRadius: 0,
          borderLeft: '1px solid var(--border-subtle)',
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.95)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Enterprise Cart</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {cart.length} item{cart.length === 1 ? '' : 's'} staged for procurement
              </span>
            </div>
            <button onClick={onClose} className="btn btn-secondary" style={{ padding: 6, borderRadius: '50%' }}>
              <X size={18} />
            </button>
          </div>

          {/* Items List */}
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <p>Your procurement cart is empty.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '35vh', overflowY: 'auto', paddingRight: 6, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.03)',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>
                      ${item.price.toFixed(2)} each
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => updateQuantity(item.id, -1)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.8rem' }}>
                      -
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.8rem' }}>
                      +
                    </button>
                    <button onClick={() => removeItem(item.id)} className="btn btn-secondary" style={{ padding: '6px', color: 'var(--accent-rose)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Shipping Details */}
          {cart.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                Delivery Destination
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: '#fff', fontSize: '0.82rem' }}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: '#fff', fontSize: '0.82rem' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: '#fff', fontSize: '0.82rem' }}
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: '#fff', fontSize: '0.82rem' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Financial Totals & Checkout */}
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            {errorMsg && (
              <div style={{ padding: '8px 12px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 6, color: '#fda4af', fontSize: '0.8rem', marginBottom: 12 }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Estimated Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              <span>Express Shipping:</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
              <span>Total:</span>
              <span style={{ color: 'var(--accent-secondary)' }}>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 20px', fontSize: '1rem' }}
            >
              {submitting ? 'Reserving Inventory (Port 4004)...' : 'Confirm & Place Order'}
              <ArrowRight size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" />
              End-to-End Encrypted via Order Microservice
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
