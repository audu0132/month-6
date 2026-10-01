import React, { useState, useEffect } from 'react';
import { ApiClient, OrderRecord, UserSession } from '../services/api';
import { Package, Clock, CheckCircle2, CreditCard, ChevronRight, Truck, AlertCircle } from 'lucide-react';

interface OrdersViewProps {
  currentUser: UserSession;
  activeOrder?: any;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ currentUser, activeOrder }) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [activeOrder]);

  const loadOrders = async () => {
    setLoading(true);
    const data = await ApiClient.getOrders();
    // If activeOrder was just created, ensure it's at top
    if (activeOrder && !data.some((o) => o.id === activeOrder.id)) {
      setOrders([activeOrder, ...data]);
    } else {
      setOrders(data);
    }
    setLoading(false);
  };

  const handlePayNow = async (orderId: string) => {
    setPayingId(orderId);
    const res = await ApiClient.payOrder(orderId);
    if (res.ok && res.data?.data) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data.data : o)));
    } else {
      // Offline fallback update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'PAID' } : o))
      );
    }
    setPayingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-emerald">Delivered</span>;
      case 'SHIPPED':
        return <span className="badge badge-primary">Shipped</span>;
      case 'PROCESSING':
        return <span className="badge badge-purple">Processing</span>;
      case 'PAID':
        return <span className="badge badge-emerald">Paid / Confirmed</span>;
      case 'PENDING':
        return <span className="badge badge-amber">Awaiting Payment</span>;
      default:
        return <span className="badge badge-rose">{status}</span>;
    }
  };

  const steps = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 60px' }}>
      <div style={{ marginBottom: 28 }}>
        <span className="badge badge-primary">Procurement Lifecycle Tracker</span>
        <h1 style={{ fontSize: '2rem', marginTop: 8 }}>
          Enterprise <span className="gradient-text">Order Management</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Live order state machine tracking with payment orchestration and delivery verification.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div className="pulse-indicator">Fetching orders from Order Service (Port 4004)...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Package size={36} color="var(--text-dim)" style={{ marginBottom: 12 }} />
          <h3>No Orders Found</h3>
          <p style={{ marginTop: 6 }}>You haven't placed any procurement orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orders.map((order) => {
            const currentStepIdx = steps.indexOf(order.status);

            return (
              <div key={order.id} className="glass-panel" style={{ padding: 24, borderRadius: 'var(--radius-md)' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', color: '#fff' }}>
                        {order.id}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Placed by <strong>{order.customerName}</strong> ({order.customerEmail}) on{' '}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      Total Amount
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-secondary)', fontFamily: 'var(--font-display)' }}>
                      ${order.totalAmount.toFixed(2)} {order.currency}
                    </div>
                  </div>
                </div>

                {/* Progress Track */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 20px', borderRadius: 10, marginBottom: 20, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {steps.map((st, i) => {
                      const isCompleted = currentStepIdx >= i;
                      const isCurrent = currentStepIdx === i;

                      return (
                        <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: isCompleted ? 'var(--accent-emerald)' : '#1e293b',
                              border: isCurrent ? '2px solid #fff' : '1px solid var(--border-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isCompleted ? '#0f172a' : '#94a3b8',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              boxShadow: isCurrent ? '0 0 12px rgba(16, 185, 129, 0.6)' : 'none',
                            }}
                          >
                            {isCompleted ? <CheckCircle2 size={16} /> : i + 1}
                          </div>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              marginTop: 6,
                              color: isCurrent ? '#fff' : isCompleted ? 'var(--accent-emerald)' : 'var(--text-dim)',
                            }}
                          >
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Items & Shipping Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {/* Items */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                      Line Items ({order.items.length})
                    </div>
                    {order.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                        <span style={{ color: '#cbd5e1' }}>
                          {it.name} <strong style={{ color: 'var(--accent-secondary)' }}>x{it.quantity}</strong>
                        </span>
                        <span style={{ fontWeight: 600 }}>${(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Destination */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                      Destination Address
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      {order.shippingAddress.street}
                      <br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.country}
                    </div>
                  </div>
                </div>

                {/* Action button: Pay Now if PENDING */}
                {order.status === 'PENDING' && (
                  <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handlePayNow(order.id)}
                      disabled={payingId === order.id}
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                    >
                      <CreditCard size={16} />
                      {payingId === order.id ? 'Processing Payment...' : 'Pay Now via Stripe Gateway'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
