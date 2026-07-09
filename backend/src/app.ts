import Fastify, { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';
import authPlugin from './plugins/authenticate';
import userRoutes from './routes/user.routes';

// KOMENTARI DULU KARENA FILE-FILE INI BELUM ADA DI FOLDER 'routes'
// import assetRoutes from './routes/asset.routes';
// import warehouseRoutes from './routes/warehouse.routes';
// import maintenanceRoutes from './routes/maintenance.routes';
// import issueRoutes from './routes/issue.routes';
// import dashboardRoutes from './routes/dashboard.routes';
// import reportRoutes from './routes/report.routes';

export async function buildApp() {
  const app = Fastify({ 
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: false,
        },
      },
    },
  });

  // Register plugins
  await app.register(cors, { 
    origin: process.env.CORS_ORIGIN || true, 
    credentials: true 
  });

  await app.register(jwt, { 
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
    sign: {
      expiresIn: '24h',
    },
  });

  await app.register(authPlugin);

  // Swagger Documentation
  await app.register(swagger, {
    openapi: {
      info: { 
        title: 'Asset Management API', 
        version: '1.0.0',
        description: 'Complete Asset Management System API',
      },
      servers: [
        { url: `http://localhost:${process.env.PORT || 3000}`, description: 'Development' },
      ],
      components: {
        securitySchemes: { 
          bearerAuth: { 
            type: 'http', 
            scheme: 'bearer', 
            bearerFormat: 'JWT' 
          } 
        }
      }
    }
  });

  await app.register(swaggerUi, { 
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Routes Registration - HANYA NYALAKAN USER/AUTH ROUTES
  await app.register(userRoutes, { prefix: '/api/auth' });
  
  // KOMENTARI REGISTRASI RUTE YANG BELUM ADA
  // await app.register(assetRoutes, { prefix: '/api/assets' });
  // await app.register(warehouseRoutes, { prefix: '/api/warehouse' });
  // await app.register(maintenanceRoutes, { prefix: '/api/maintenance' });
  // await app.register(issueRoutes, { prefix: '/api/issues' });
  // await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
  // await app.register(reportRoutes, { prefix: '/api/reports' });

  // Health Check
  app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Root endpoint
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      name: 'Asset Management API',
      version: '1.0.0',
      docs: '/docs',
      health: '/health',
    };
  });

  // Global error handler
  app.setErrorHandler(
    async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      app.log.error({
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode || 500,
        url: request.url,
        method: request.method,
      });

      if (error.statusCode === 400) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error.message,
        });
      }

      if (error.statusCode === 401) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid token or missing authentication',
        });
      }

      if (error.statusCode === 404) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Resource not found',
        });
      }

      return reply.status(error.statusCode || 500).send({
        statusCode: error.statusCode || 500,
        error: error.name || 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal Server Error' 
          : error.message,
      });
    }
  );

  // Not found handler
  app.setNotFoundHandler(
    (request: FastifyRequest, reply: FastifyReply) => {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: `Route ${request.method} ${request.url} not found`,
      });
    }
  );

  return app;
}