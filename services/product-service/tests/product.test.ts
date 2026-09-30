import request from 'supertest';
import app from '../src/server';

describe('Product Service Suite', () => {
  it('GET /health should return UP status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('product-service');
  });

  it('GET /products should list catalog items', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(5);
  });

  it('GET /products/categories should return available categories', async () => {
    const res = await request(app).get('/products/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toContain('Hardware');
  });

  it('POST /products/reserve should deduct inventory when sufficient', async () => {
    const res = await request(app)
      .post('/products/reserve')
      .send({
        items: [{ productId: 'prod_ent_001', quantity: 2 }],
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
