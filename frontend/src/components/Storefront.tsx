import React, { useState, useEffect } from 'react';
import { ApiClient, ProductItem } from '../services/api';
import { Search, ShoppingBag, Star, CheckCircle, Shield, Cpu, Tag } from 'lucide-react';

interface StorefrontProps {
  onAddToCart: (p: ProductItem) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ onAddToCart }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All', 'Hardware', 'Workspace', 'Security', 'Software', 'Audio']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadCatalog();
  }, [selectedCategory]);

  const loadCatalog = async () => {
    setLoading(true);
    const cat = selectedCategory === 'All' ? undefined : selectedCategory;
    const items = await ApiClient.getProducts(cat, searchQuery);
    setProducts(items);
    setLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCatalog();
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
      {/* Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '36px 32px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
        }}
      >
        <div style={{ maxWidth: 650, position: 'relative', zIndex: 2 }}>
          <span className="badge badge-primary">Enterprise Developer Gear & Cloud Appliances</span>
          <h1 style={{ fontSize: '2.5rem', lineHeight: 1.15, marginTop: 12, marginBottom: 12 }}>
            Engineered for <span className="gradient-text">High-Throughput</span> Engineering Teams
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 20 }}>
            Procure enterprise hardware, zero-trust FIDO2 keys, and distributed infrastructure appliances backed by automated microservices inventory.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: 20 }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, minWidth: 280 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search appliances, keys, monitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ padding: '8px 14px' }}>
            Filter
          </button>
        </form>
      </div>

      {/* Product Catalog Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div className="pulse-indicator" style={{ fontSize: '1.2rem', marginBottom: 8 }}>
            Connecting to Product Microservice (Port 4003)...
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {products.map((product) => (
            <div
              key={product.id}
              className="glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {/* Product Image */}
              <div style={{ height: 200, width: '100%', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--accent-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {product.category}
                </span>

                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    color: '#fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Star size={12} fill="#fcd34d" color="#fcd34d" />
                  {product.rating}
                </span>
              </div>

              {/* Product Details */}
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>
                    {product.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
                    {product.description}
                  </p>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {product.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '0.7rem',
                          background: 'rgba(255,255,255,0.04)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          color: 'var(--text-dim)',
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Add to Cart */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      In Stock: {product.stock} units
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                      ${product.price.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart(product)}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <ShoppingBag size={15} /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
