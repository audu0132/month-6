import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { Server, Activity, ShieldCheck, Database, RefreshCw, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ServiceTelemetry: React.FC = () => {
  const [servicesStatus, setServicesStatus] = useState<Record<string, { status: 'ONLINE' | 'STANDBY'; latency: number; port: number }>>({});
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>('');

  const refreshHealth = async () => {
    setLoading(true);
    const health = await ApiClient.checkMicroserviceHealth();
    setServicesStatus(health);
    setLastCheck(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const serviceSpecs = [
    {
      name: 'API Gateway',
      key: 'API Gateway',
      port: 4000,
      protocol: 'HTTP/2 • Reverse Proxy',
      tech: 'Express • Helmet • RateLimiter',
      desc: 'Central entry point handling SSL termination, rate limiting, and routing.',
      endpoints: ['/api/auth/*', '/api/users/*', '/api/products/*', '/api/orders/*'],
    },
    {
      name: 'Auth Service',
      key: 'Auth Service',
      port: 4001,
      protocol: 'REST • JWT • OAuth2',
      tech: 'Bcrypt • Access/Refresh Rotation',
      desc: 'Issues short-lived JWT access tokens and cryptographically secure refresh pairs.',
      endpoints: ['POST /auth/login', 'POST /auth/register', 'POST /auth/refresh'],
    },
    {
      name: 'User Service',
      key: 'User Service',
      port: 4002,
      protocol: 'REST • JSON',
      tech: 'RBAC Profile Store',
      desc: 'Maintains user profile metadata, enterprise roles, and auditing logs.',
      endpoints: ['GET /users', 'GET /users/profile', 'PUT /users/profile'],
    },
    {
      name: 'Product Service',
      key: 'Product Service',
      port: 4003,
      protocol: 'REST • Cache-Control',
      tech: 'Catalog Indexing & Stock Control',
      desc: 'Provides low-latency catalog search and atomic stock reservation.',
      endpoints: ['GET /products', 'GET /products/:id', 'POST /products/reserve'],
    },
    {
      name: 'Order Service',
      key: 'Order Service',
      port: 4004,
      protocol: 'Saga Pattern • HTTP Client',
      tech: 'Order Lifecycle State Machine',
      desc: 'Coordinates checkout, inter-service inventory deduction, and payment capture.',
      endpoints: ['POST /orders', 'GET /orders', 'POST /orders/:id/pay'],
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <span className="badge badge-primary">Distributed System Observability</span>
          <h1 style={{ fontSize: '2rem', marginTop: 8 }}>
            Microservices <span className="gradient-text">Architecture Mesh</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Live health telemetry, inter-service contracts, and container port telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Updated: {lastCheck || 'Checking...'}
          </span>
          <button
            onClick={refreshHealth}
            disabled={loading}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} className={loading ? 'pulse-indicator' : ''} />
            {loading ? 'Probing...' : 'Refresh Status'}
          </button>
        </div>
      </div>

      {/* Grid of Microservices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {serviceSpecs.map((svc) => {
          const statusObj = servicesStatus[svc.key];
          const isOnline = statusObj?.status === 'ONLINE';

          return (
            <div key={svc.name} className="glass-panel" style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: 4 }}>{svc.name}</h3>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>
                      PORT {svc.port} • {svc.protocol}
                    </span>
                  </div>
                  <span className={`badge ${isOnline ? 'badge-emerald' : 'badge-amber'}`}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: isOnline ? '#10b981' : '#f59e0b',
                        display: 'inline-block',
                      }}
                    />
                    {isOnline ? `ONLINE (${statusObj.latency}ms)` : 'STANDBY (LOCAL)'}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                  {svc.desc}
                </p>

                {/* Tech Stack Badge */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Technology & Security
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {svc.tech}
                  </div>
                </div>

                {/* Service Endpoints */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 6 }}>
                    Public Service Contracts
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {svc.endpoints.map((ep) => (
                      <span
                        key={ep}
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#a5b4fc',
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {ep}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer specs */}
              <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Kubernetes Replica: <strong style={{ color: '#fff' }}>2 Pods</strong>
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>
                  Zero-Downtime Ready
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture Flow Banner */}
      <div className="glass-panel" style={{ marginTop: 28, padding: 24, background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={18} color="var(--accent-secondary)" />
          Enterprise Microservices Topology & Request Path
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
          1. Clients query <strong>API Gateway (Port 4000)</strong> with Rate Limiting and Helmet Headers.
          <br />
          2. Gateway validates incoming JWT signature and injects <code>x-user-id</code>, <code>x-user-role</code>, and <code>x-correlation-id</code>.
          <br />
          3. Downstream services (Auth, User, Product, Order) run independently in Docker containers / Kubernetes pods with database isolation.
          <br />
          4. When an order is placed, <strong>Order Service</strong> makes a resilient synchronous inter-service HTTP call to <strong>Product Service</strong> to reserve stock before confirming checkout.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span className="badge badge-primary">Docker Compose Ready</span>
          <span className="badge badge-emerald">Kubernetes Manifests Ready</span>
          <span className="badge badge-purple">GitHub Actions CI/CD Pipeline</span>
          <span className="badge badge-amber">OpenTelemetry Correlation ID</span>
        </div>
      </div>
    </div>
  );
};
