import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const correlationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      correlationId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };
    if (res.statusCode >= 400) {
      console.error(`[GATEWAY-WARN] ${JSON.stringify(logData)}`);
    } else {
      console.log(`[GATEWAY-INFO] ${JSON.stringify(logData)}`);
    }
  });

  next();
};
