import request from 'supertest';
import app from '../src/server';

describe('Auth Service Suite', () => {
  it('GET /health should return status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('auth-service');
  });

  it('POST /auth/login with valid admin credentials should return JWT tokens', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@enterprise.io',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.role).toBe('admin');
  });

  it('POST /auth/login with invalid password should return 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@enterprise.io',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /auth/register should create a new user and return tokens', async () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Test Candidate',
        email: uniqueEmail,
        password: 'SecurePassword123!',
        role: 'customer',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(uniqueEmail);
  });
});
