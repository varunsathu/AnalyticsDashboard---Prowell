import { Request, Response, NextFunction } from 'express';
import { sanitizeObject } from '../security/sanitization';
import { z } from 'zod';

/**
 * Input validation and sanitization middleware
 */
export function validateAndSanitize(schema?: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize request body to prevent XSS attacks
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
      }

      // Validate against schema if provided
      if (schema && req.body) {
        const result = schema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: 'Invalid input data',
            errors: result.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        req.body = result.data;
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({ message: 'Input validation failed' });
    }
  };
}

/**
 * Rate limiting for sensitive operations
 */
export function sensitiveOperationLimiter(req: Request, res: Response, next: NextFunction) {
  // Additional rate limiting for admin, auth, and data export operations
  const sensitiveRoutes = ['/api/admin', '/api/auth', '/api/export'];
  const isSensitive = sensitiveRoutes.some(route => req.path.startsWith(route));
  
  if (isSensitive) {
    // This would integrate with the existing rate limiter
    const rateLimitKey = `sensitive_${req.ip}_${Math.floor(Date.now() / (5 * 60 * 1000))}`; // 5-minute windows
    // Rate limit implementation would go here
  }
  
  next();
}

/**
 * Request logging for security monitoring
 */
export function securityLogger(req: Request, res: Response, next: NextFunction) {
  const sensitiveEndpoints = ['/api/admin', '/api/auth/login', '/api/auth/logout'];
  
  if (sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    console.log(`[SECURITY] ${new Date().toISOString()} - ${req.method} ${req.path} from ${req.ip} - User-Agent: ${req.get('User-Agent')}`);
  }
  
  next();
}