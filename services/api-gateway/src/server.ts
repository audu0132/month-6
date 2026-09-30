import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityHeaders, apiLimiter } from './middleware/security';
import { correlationMiddleware } from './middleware/logger';
import proxyRoutes from './routes/proxies';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security & observability middleware
app.use(securityHeaders);
app.use(correlationMiddleware);
app.use(apiLimiter);

// CORS configuration for enterprise client
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  })
);

// Health check endpoint for Kubernetes Liveness & Readiness Probes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Gateway info & service catalog endpoint
app.get('/gateway/status', (req: Request, res: Response) => {
  res.status(200).json({
    gateway: 'Enterprise API Gateway v1.0',
    services: {
      auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
      users: process.env.USER_SERVICE_URL || 'http://localhost:4002',
      products: process.env.PRODUCT_SERVICE_URL || 'http://localhost:4003',
      orders: process.env.ORDER_SERVICE_URL || 'http://localhost:4004',
    },
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// Proxy routes mapped under /api
app.use('/api', proxyRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on API Gateway: ${req.method} ${req.originalUrl}`,
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[API-GATEWAY] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[API-GATEWAY] Health endpoint: http://localhost:${PORT}/health`);
    console.log(`[API-GATEWAY] Service catalog: http://localhost:${PORT}/gateway/status`);
  });
}

export default app;
