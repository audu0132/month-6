export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  stock: number;
  sku: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class ProductRepository {
  private products: Map<string, Product> = new Map();

  constructor() {
    this.seedProducts();
  }

  private seedProducts() {
    const catalog: Product[] = [
      {
        id: 'prod_ent_001',
        name: 'Enterprise Kubernetes Cluster Node',
        slug: 'enterprise-k8s-cluster-node',
        description: 'Dedicated bare-metal edge appliance engineered for zero-latency microservices orchestration and local AI inference.',
        price: 1299.99,
        currency: 'USD',
        category: 'Hardware',
        stock: 45,
        sku: 'HW-K8S-001',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500',
        rating: 4.9,
        reviewCount: 38,
        tags: ['kubernetes', 'server', 'edge', 'enterprise'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_ent_002',
        name: 'UltraWide Curved Developer Monitor 49"',
        slug: 'ultrawide-developer-monitor-49',
        description: 'Dual-QHD 5120x1440 ergonomic curved workspace display with 99% sRGB, KVM switch, and 90W USB-C power delivery.',
        price: 949.00,
        currency: 'USD',
        category: 'Workspace',
        stock: 28,
        sku: 'MON-DEV-49',
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
        rating: 4.8,
        reviewCount: 94,
        tags: ['monitor', 'ergonomic', 'workspace', 'display'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_ent_003',
        name: 'Enterprise Cloud Security Hardware Key (2-Pack)',
        slug: 'security-hardware-key-fido2',
        description: 'FIDO2 and WebAuthn certified physical multi-factor authenticator with NFC and USB-C for zero-trust compliance.',
        price: 89.95,
        currency: 'USD',
        category: 'Security',
        stock: 150,
        sku: 'SEC-FIDO2-02',
        imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500',
        rating: 5.0,
        reviewCount: 215,
        tags: ['security', 'fido2', '2fa', 'hardware-key'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_ent_004',
        name: 'Ergonomic Split Mechanical Keyboard',
        slug: 'ergonomic-split-keyboard',
        description: 'Hot-swappable custom ortholinear split mechanical keyboard with OLED telemetry screen and per-key RGB backlighting.',
        price: 249.50,
        currency: 'USD',
        category: 'Workspace',
        stock: 60,
        sku: 'KB-SPLIT-HOTSWAP',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
        rating: 4.7,
        reviewCount: 72,
        tags: ['keyboard', 'mechanical', 'ergonomic', 'coding'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_ent_005',
        name: 'Enterprise Observability & APM Suite License',
        slug: 'observability-apm-suite-license',
        description: 'Yearly commercial enterprise license for distributed tracing, real-time metrics telemetry, and automated root cause analysis.',
        price: 499.00,
        currency: 'USD',
        category: 'Software',
        stock: 999,
        sku: 'SW-APM-ENT-1Y',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500',
        rating: 4.9,
        reviewCount: 160,
        tags: ['apm', 'observability', 'metrics', 'tracing'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_ent_006',
        name: 'Noise-Cancelling Studio Reference Headphones',
        slug: 'anc-studio-reference-headphones',
        description: 'Audiophile planar magnetic studio headphones with hybrid active noise cancellation for deep focus developer sprint sessions.',
        price: 349.99,
        currency: 'USD',
        category: 'Audio',
        stock: 40,
        sku: 'AUD-ANC-PLANAR',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        rating: 4.8,
        reviewCount: 110,
        tags: ['audio', 'headphones', 'anc', 'focus'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    catalog.forEach((p) => this.products.set(p.id, p));
  }

  async getAll(query: { category?: string; search?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]> {
    let list = Array.from(this.products.values()).filter((p) => p.isActive);

    if (query.category) {
      list = list.filter((p) => p.category.toLowerCase() === query.category?.toLowerCase());
    }

    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (query.minPrice !== undefined) {
      list = list.filter((p) => p.price >= query.minPrice!);
    }

    if (query.maxPrice !== undefined) {
      list = list.filter((p) => p.price <= query.maxPrice!);
    }

    return list;
  }

  async getById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async reserveStock(id: string, quantity: number): Promise<{ success: boolean; product?: Product; error?: string }> {
    const product = this.products.get(id);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    if (product.stock < quantity) {
      return {
        success: false,
        error: `Insufficient inventory for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`,
      };
    }

    product.stock -= quantity;
    product.updatedAt = new Date().toISOString();
    this.products.set(id, product);
    return { success: true, product };
  }

  async replenishStock(id: string, quantity: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    product.stock += quantity;
    product.updatedAt = new Date().toISOString();
    this.products.set(id, product);
    return product;
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = `prod_${Date.now()}`;
    const newProduct: Product = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async getCategories(): Promise<string[]> {
    const categories = new Set<string>();
    for (const p of this.products.values()) {
      categories.add(p.category);
    }
    return Array.from(categories);
  }
}

export const productRepository = new ProductRepository();
