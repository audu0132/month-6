import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Microservice health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'product-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/products', productRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[PRODUCT-SERVICE] Listening on port ${PORT}`);
    console.log(`[PRODUCT-SERVICE] Health check: http://localhost:${PORT}/health`);
  });
}

export default app;
