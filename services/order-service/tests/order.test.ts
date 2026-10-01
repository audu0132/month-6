import request from 'supertest';
import app from '../src/server';

describe('Order Service Suite', () => {
  it('GET /health should return UP status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('order-service');
  });

  it('GET /orders should return seeded order list', async () => {
    const res = await request(app).get('/orders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(2);
  });

  it('GET /orders/analytics/metrics should return financial analytics', async () => {
    const res = await request(app).get('/orders/analytics/metrics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalRevenue');
    expect(res.body.data).toHaveProperty('statusBreakdown');
  });

  it('POST /orders/:id/pay should mark pending order as paid', async () => {
    // Create new order first
    const createRes = await request(app)
      .post('/orders')
      .send({
        items: [{ productId: 'prod_ent_001', name: 'Cluster Node', price: 1299.99, quantity: 1 }],
      });
    expect(createRes.status).toBe(201);
    const orderId = createRes.body.data.id;

    // Pay
    const payRes = await request(app).post(`/orders/${orderId}/pay`);
    expect(payRes.status).toBe(200);
    expect(payRes.body.data.status).toBe('PAID');
    expect(payRes.body.data.paymentDetails.status).toBe('SUCCESS');
  });
});
