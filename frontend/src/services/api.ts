// Enterprise API Service Layer
// Communicates with API Gateway (Port 4000)

const API_BASE = '/api';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'customer';
  accessToken?: string;
  refreshToken?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  rating: number;
  tags: string[];
}

export interface OrderRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  items: Array<{ productId: string; name: string; price: number; quantity: number }>;
  shippingAddress: { street: string; city: string; state: string; country: string };
  statusHistory?: Array<{ status: string; timestamp: string }>;
}

export class ApiClient {
  private static tokenKey = 'enterprise_auth_token';
  private static userKey = 'enterprise_auth_user';

  static getStoredToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static getStoredUser(): UserSession {
    const raw = localStorage.getItem(this.userKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    // Default demo customer
    return {
      id: 'usr_cust_003',
      name: 'Jane Customer',
      email: 'jane@enterprise.io',
      role: 'customer',
    };
  }

  static saveSession(user: UserSession, token?: string) {
    if (token) localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  static clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getStoredToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-correlation-id': `fe-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err: any) {
      console.warn(`[API] Network error requesting ${endpoint}:`, err.message);
      return { ok: false, status: 503, error: err.message, data: null };
    }
  }

  // --- Products ---
  static async getProducts(category?: string, search?: string) {
    let url = '/products';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await this.request(url);
    if (res.ok && res.data?.data) {
      return res.data.data as ProductItem[];
    }
    // Fallback seed products
    return this.getFallbackProducts();
  }

  // --- Orders ---
  static async getOrders(): Promise<OrderRecord[]> {
    const res = await this.request('/orders');
    if (res.ok && res.data?.data) {
      return res.data.data as OrderRecord[];
    }
    return this.getFallbackOrders();
  }

  static async createOrder(orderPayload: any) {
    const res = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
    return res;
  }

  static async payOrder(orderId: string) {
    const res = await this.request(`/orders/${orderId}/pay`, {
      method: 'POST',
    });
    return res;
  }

  static async updateOrderStatus(orderId: string, status: string, note?: string) {
    const res = await this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
    return res;
  }

  static async getMetrics() {
    const res = await this.request('/orders/analytics/metrics');
    if (res.ok && res.data?.data) {
      return res.data.data;
    }
    return {
      totalOrders: 2,
      totalRevenue: 1867.74,
      statusBreakdown: { DELIVERED: 1, PROCESSING: 1 },
    };
  }

  // --- Microservices Telemetry ---
  static async checkMicroserviceHealth(): Promise<Record<string, { status: 'ONLINE' | 'STANDBY'; latency: number; port: number }>> {
    const services = [
      { name: 'API Gateway', url: 'http://localhost:4000/health', port: 4000 },
      { name: 'Auth Service', url: 'http://localhost:4001/health', port: 4001 },
      { name: 'User Service', url: 'http://localhost:4002/health', port: 4002 },
      { name: 'Product Service', url: 'http://localhost:4003/health', port: 4003 },
      { name: 'Order Service', url: 'http://localhost:4004/health', port: 4004 },
    ];

    const results: Record<string, { status: 'ONLINE' | 'STANDBY'; latency: number; port: number }> = {};

    await Promise.all(
      services.map(async (s) => {
        const start = performance.now();
        try {
          const res = await fetch(s.url, { signal: AbortSignal.timeout(1200) });
          const latency = Math.round(performance.now() - start);
          results[s.name] = {
            status: res.ok ? 'ONLINE' : 'STANDBY',
            latency: res.ok ? latency : 0,
            port: s.port,
          };
        } catch {
          results[s.name] = {
            status: 'STANDBY',
            latency: 0,
            port: s.port,
          };
        }
      })
    );

    return results;
  }

  private static getFallbackProducts(): ProductItem[] {
    return [
      {
        id: 'prod_ent_001',
        name: 'Enterprise Kubernetes Cluster Node',
        description: 'Dedicated bare-metal edge appliance engineered for zero-latency microservices orchestration.',
        price: 1299.99,
        category: 'Hardware',
        stock: 45,
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500',
        rating: 4.9,
        tags: ['kubernetes', 'server', 'edge'],
      },
      {
        id: 'prod_ent_002',
        name: 'UltraWide Curved Developer Monitor 49"',
        description: 'Dual-QHD 5120x1440 ergonomic curved workspace display with 99% sRGB, KVM switch.',
        price: 949.0,
        category: 'Workspace',
        stock: 28,
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
        rating: 4.8,
        tags: ['monitor', 'ergonomic', 'display'],
      },
      {
        id: 'prod_ent_003',
        name: 'Enterprise Cloud Security Hardware Key (2-Pack)',
        description: 'FIDO2 and WebAuthn certified physical multi-factor authenticator with NFC and USB-C.',
        price: 89.95,
        category: 'Security',
        stock: 150,
        imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500',
        rating: 5.0,
        tags: ['security', 'fido2', '2fa'],
      },
      {
        id: 'prod_ent_004',
        name: 'Ergonomic Split Mechanical Keyboard',
        description: 'Hot-swappable custom ortholinear split mechanical keyboard with OLED telemetry screen.',
        price: 249.5,
        category: 'Workspace',
        stock: 60,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
        rating: 4.7,
        tags: ['keyboard', 'mechanical', 'ergonomic'],
      },
      {
        id: 'prod_ent_005',
        name: 'Enterprise Observability & APM Suite License',
        description: 'Yearly commercial enterprise license for distributed tracing and real-time metrics telemetry.',
        price: 499.0,
        category: 'Software',
        stock: 999,
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500',
        rating: 4.9,
        tags: ['apm', 'observability', 'metrics'],
      },
      {
        id: 'prod_ent_006',
        name: 'Noise-Cancelling Studio Reference Headphones',
        description: 'Audiophile planar magnetic studio headphones with hybrid active noise cancellation.',
        price: 349.99,
        category: 'Audio',
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        rating: 4.8,
        tags: ['audio', 'headphones', 'anc'],
      },
    ];
  }

  private static getFallbackOrders(): OrderRecord[] {
    return [
      {
        id: 'ord_1001',
        customerName: 'Jane Customer',
        customerEmail: 'jane@enterprise.io',
        totalAmount: 194.29,
        currency: 'USD',
        status: 'DELIVERED',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        items: [{ productId: 'prod_ent_003', name: 'Security Hardware Key (2-Pack)', price: 89.95, quantity: 2 }],
        shippingAddress: { street: '456 Market St', city: 'Seattle', state: 'WA', country: 'USA' },
      },
      {
        id: 'ord_1002',
        customerName: 'Enterprise Admin',
        customerEmail: 'admin@enterprise.io',
        totalAmount: 1673.45,
        currency: 'USD',
        status: 'PROCESSING',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        items: [
          { productId: 'prod_ent_001', name: 'Kubernetes Cluster Node', price: 1299.99, quantity: 1 },
          { productId: 'prod_ent_004', name: 'Split Mechanical Keyboard', price: 249.5, quantity: 1 },
        ],
        shippingAddress: { street: '100 Silicon Way', city: 'San Francisco', state: 'CA', country: 'USA' },
      },
    ];
  }
}
