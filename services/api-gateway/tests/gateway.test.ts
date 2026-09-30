import request from 'supertest';
import app from '../src/server';

describe('API Gateway Core Suite', () => {
  it('GET /health should return 200 and UP status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('api-gateway');
  });

  it('GET /gateway/status should return configured services map', async () => {
    const res = await request(app).get('/gateway/status');
    expect(res.status).toBe(200);
    expect(res.body.gateway).toBeDefined();
    expect(res.body.services).toHaveProperty('auth');
    expect(res.body.services).toHaveProperty('products');
    expect(res.body.services).toHaveProperty('orders');
  });

  it('GET /api/unknown-endpoint should return 404', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
