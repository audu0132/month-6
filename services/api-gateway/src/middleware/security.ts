import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Enterprise Helmet security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "https://*"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'same-origin' },
});

// Standard API Rate Limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 min for gateway throughput
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict Auth endpoints rate limiter (anti-brute-force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 requests per 15 minutes for login/register attempts
  message: {
    success: false,
    message: 'Too many authentication attempts, please wait 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
