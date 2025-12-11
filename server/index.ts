import express, { type Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { securityLogger } from "./middleware/validation";

const app = express();

// Security: Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit auth attempts
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/login', authLimiter);
app.use('/api/logout', authLimiter);

// Security logging middleware
app.use(securityLogger);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Private App Access Control - Block unauthorized access to source code
app.use((req, res, next) => {
  // Only block direct access to sensitive source files, not Vite dev assets
  const blockedPaths = [
    '/server/', '/client/', '/shared/', '/.git/', '/node_modules/',
    '/.env', '/.replit', '/package.json', '/package-lock.json', '/drizzle.config.ts',
    '/tsconfig.json', '/vite.config.ts', '/tailwind.config.ts', '/postcss.config.js'
  ];
  
  const requestPath = req.path.toLowerCase();
  
  // Allow Vite development assets and API calls
  if (req.path.startsWith('/api/') || 
      req.path.startsWith('/@') || 
      req.path.startsWith('/src/') ||
      req.path.includes('vite') ||
      req.path.includes('.css') ||
      req.path.includes('.js') ||
      req.path.includes('.mjs')) {
    return next();
  }
  
  const isBlockedPath = blockedPaths.some(blocked => 
    requestPath.startsWith(blocked)
  );
  
  if (isBlockedPath) {
    log(`🔒 Blocked unauthorized access attempt to: ${req.path} from IP: ${req.ip}`, 'security');
    return res.status(403).json({ 
      error: 'Access Denied', 
      message: 'This application is private. Unauthorized access to source code is prohibited.' 
    });
  }
  
  next();
});

// Enhanced Security Headers and CSRF Protection
app.use((req, res, next) => {
  // Comprehensive security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://replit.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self';");
  
  // Private app indicator
  res.setHeader('X-App-Access', 'private');
  
  // Enhanced CSRF protection for state-changing operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    const host = req.get('Host');
    
    // Check for valid origin or referer
    if (origin) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return res.status(403).json({ message: 'Cross-origin request blocked' });
      }
    } else if (referer) {
      const refererHost = new URL(referer).host;
      if (refererHost !== host) {
        return res.status(403).json({ message: 'Cross-origin request blocked' });
      }
    } else {
      // No origin or referer - potential CSRF attempt
      return res.status(403).json({ message: 'Missing origin/referer header' });
    }
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Inject a dummy user in development mode for all requests
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    req.user = {
      id: "dev-user-id",
      email: "dev@local.test",
      firstName: "Dev",
      lastName: "User"
    };
    next();
  });
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 3000 for local development
  // this serves both the API and the client.
  const port = process.env.NODE_ENV === "development" ? 3000 : 5000;
  server.listen(
    port,
    "0.0.0.0",
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
