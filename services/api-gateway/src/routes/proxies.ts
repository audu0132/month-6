import express, { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authLimiter } from '../middleware/security';

const router = express.Router();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4002';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4003';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:4004';

// Helper for proxy error handling
const handleProxyError = (serviceName: string) => {
  return (err: any, req: Request, res: Response) => {
    console.error(`[GATEWAY] Error proxying to ${serviceName}:`, err.message);
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: `${serviceName} is temporarily unavailable. Circuit breaker fallback activated.`,
        service: serviceName,
        timestamp: new Date().toISOString(),
      });
    }
  };
};

// ==========================================
// 1. Auth Service Routes
// ==========================================
router.use(
  '/auth',
  authLimiter,
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/auth' },
    onError: handleProxyError('Auth Service'),
  })
);

// ==========================================
// 2. User Service Routes
// ==========================================
router.use(
  '/users',
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/users' },
    onError: handleProxyError('User Service'),
  })
);

// ==========================================
// 3. Product Service Routes
// ==========================================
router.use(
  '/products',
  createProxyMiddleware({
    target: PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/products': '/products' },
    onError: handleProxyError('Product Service'),
  })
);

// ==========================================
// 4. Order Service Routes
// ==========================================
router.use(
  '/orders',
  createProxyMiddleware({
    target: ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '/orders' },
    onError: handleProxyError('Order Service'),
  })
);

export default router;
