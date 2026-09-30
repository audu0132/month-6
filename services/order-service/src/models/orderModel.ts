export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentDetails?: {
    transactionId: string;
    provider: string;
    paidAt: string;
    status: string;
  };
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

class OrderRepository {
  private orders: Map<string, Order> = new Map();

  constructor() {
    this.seedOrders();
  }

  private seedOrders() {
    const seed: Order[] = [
      {
        id: 'ord_1001',
        userId: 'usr_cust_003',
        customerName: 'Jane Customer',
        customerEmail: 'jane@enterprise.io',
        items: [
          {
            productId: 'prod_ent_003',
            name: 'Enterprise Cloud Security Hardware Key (2-Pack)',
            price: 89.95,
            quantity: 2,
            total: 179.9,
          },
        ],
        subtotal: 179.9,
        tax: 14.39,
        shippingFee: 0,
        totalAmount: 194.29,
        currency: 'USD',
        status: 'DELIVERED',
        shippingAddress: {
          street: '456 Market St',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          country: 'USA',
        },
        paymentDetails: {
          transactionId: 'txn_mock_992144',
          provider: 'Stripe Enterprise',
          paidAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          status: 'SUCCESS',
        },
        statusHistory: [
          { status: 'PENDING', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
          { status: 'PAID', timestamp: new Date(Date.now() - 86400000 * 3 + 120000).toISOString() },
          { status: 'SHIPPED', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
          { status: 'DELIVERED', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
        ],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'ord_1002',
        userId: 'usr_admin_001',
        customerName: 'Enterprise Admin',
        customerEmail: 'admin@enterprise.io',
        items: [
          {
            productId: 'prod_ent_001',
            name: 'Enterprise Kubernetes Cluster Node',
            price: 1299.99,
            quantity: 1,
            total: 1299.99,
          },
          {
            productId: 'prod_ent_004',
            name: 'Ergonomic Split Mechanical Keyboard',
            price: 249.5,
            quantity: 1,
            total: 249.5,
          },
        ],
        subtotal: 1549.49,
        tax: 123.96,
        shippingFee: 0,
        totalAmount: 1673.45,
        currency: 'USD',
        status: 'PROCESSING',
        shippingAddress: {
          street: '100 Silicon Way',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94107',
          country: 'USA',
        },
        paymentDetails: {
          transactionId: 'txn_mock_881290',
          provider: 'Enterprise Purchase Order',
          paidAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          status: 'SUCCESS',
        },
        statusHistory: [
          { status: 'PENDING', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
          { status: 'PAID', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
          { status: 'PROCESSING', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
        ],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ];

    seed.forEach((o) => this.orders.set(o.id, o));
  }

  async getAll(filter?: { userId?: string; status?: OrderStatus }): Promise<Order[]> {
    let list = Array.from(this.orders.values());
    if (filter?.userId) {
      list = list.filter((o) => o.userId === filter.userId);
    }
    if (filter?.status) {
      list = list.filter((o) => o.status === filter.status);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Promise<Order> {
    const id = `ord_${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...order,
      id,
      statusHistory: [{ status: order.status, timestamp: now, note: 'Order initialized' }],
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateStatus(id: string, newStatus: OrderStatus, note?: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const now = new Date().toISOString();
    order.status = newStatus;
    order.updatedAt = now;
    order.statusHistory.push({
      status: newStatus,
      timestamp: now,
      note: note || `Status updated to ${newStatus}`,
    });
    this.orders.set(id, order);
    return order;
  }

  async getMetrics() {
    const all = Array.from(this.orders.values());
    const totalRevenue = all
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const counts: Record<string, number> = {};
    all.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });

    return {
      totalOrders: all.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      statusBreakdown: counts,
    };
  }
}

export const orderRepository = new OrderRepository();
