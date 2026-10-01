import React, { useState, useEffect } from 'react';
import { ApiClient, OrderRecord, UserSession } from '../services/api';
import { LayoutDashboard, DollarSign, Package, TrendingUp, Users, CheckCircle, RefreshCw } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: UserSession;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [metrics, setMetrics] = useState<any>({ totalRevenue: 1867.74, totalOrders: 2, statusBreakdown: {} });
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const m = await ApiClient.getMetrics();
    const o = await ApiClient.getOrders();
    setMetrics(m);
    setOrders(o);
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await ApiClient.updateOrderStatus(orderId, newStatus, `Updated by ${currentUser.name}`);
    loadData();
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <span className="badge badge-emerald">Operations & Executive Console</span>
          <h1 style={{ fontSize: '2rem', marginTop: 8 }}>
            Enterprise <span className="gradient-text">Operations Hub</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Multi-tenant revenue analytics, inventory health, and order fulfillment controls.
          </p>
        </div>

        <button onClick={loadData} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-secondary)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Gross Revenue</span>
            <DollarSign size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#fff', fontFamily: 'var(--font-display)' }}>
            ${metrics.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <TrendingUp size={12} /> +18.4% from last week
          </span>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-primary)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Orders</span>
            <Package size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#fff', fontFamily: 'var(--font-display)' }}>
            {orders.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4, display: 'block' }}>
            Across all microservices
          </span>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-purple)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Avg Order Value</span>
            <TrendingUp size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#fff', fontFamily: 'var(--font-display)' }}>
            ${orders.length ? (metrics.totalRevenue / orders.length).toFixed(2) : '0.00'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', marginTop: 4, display: 'block' }}>
            Enterprise B2B average
          </span>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Security Level</span>
            <CheckCircle size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#fff', fontFamily: 'var(--font-display)' }}>
            Tier A+
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4, display: 'block' }}>
            RBAC & Helmet HSTS active
          </span>
        </div>
      </div>

      {/* Orders Fulfillment Table */}
      <div className="glass-panel" style={{ padding: 24, overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Live Fulfillment Pipeline</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
              <th style={{ padding: '10px 12px' }}>Order ID</th>
              <th style={{ padding: '10px 12px' }}>Customer</th>
              <th style={{ padding: '10px 12px' }}>Total Amount</th>
              <th style={{ padding: '10px 12px' }}>Current Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => (
              <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>
                  {ord.id}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{ord.customerName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customerEmail}</div>
                </td>
                <td style={{ padding: '12px', fontWeight: 700, color: '#fff' }}>
                  ${ord.totalAmount.toFixed(2)}
                </td>
                <td style={{ padding: '12px' }}>
                  <span className={`badge ${ord.status === 'DELIVERED' ? 'badge-emerald' : ord.status === 'PROCESSING' ? 'badge-purple' : ord.status === 'PAID' ? 'badge-primary' : 'badge-amber'}`}>
                    {ord.status}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <select
                    value={ord.status}
                    onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      color: '#fff',
                      padding: '4px 8px',
                      fontSize: '0.8rem',
                      outline: 'none',
                    }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
