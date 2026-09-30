import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityHeaders, apiLimiter } from './middleware/security';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middlewares
app.use(securityHeaders);
app.use(apiLimiter);
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Auth Routes mounted under /auth
app.use('/auth', authRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[AUTH-SERVICE ERROR]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error in Auth Service',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[AUTH-SERVICE] Listening on port ${PORT}`);
    console.log(`[AUTH-SERVICE] Health check: http://localhost:${PORT}/health`);
  });
}

export default app;
