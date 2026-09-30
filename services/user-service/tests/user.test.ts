import request from 'supertest';
import app from '../src/server';

describe('User Service Suite', () => {
  it('GET /health should return UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('user-service');
  });

  it('GET /users should list seeded users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(3);
  });

  it('GET /users/:id should return specific user profile', async () => {
    const res = await request(app).get('/users/usr_admin_001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('admin@enterprise.io');
  });
});
