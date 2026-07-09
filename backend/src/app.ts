import Fastify, { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import authPlugin from './plugins/authenticate';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

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

  // ====== REGISTER PLUGINS ======

  // JWT Plugin (Wajib berada di atas agar decorator token siap digunakan)
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'super-secret-key'
  });

  // Custom Authentication Plugin
  await app.register(authPlugin);
  
  // CORS Plugin
  await app.register(cors, { 
    origin: process.env.CORS_ORIGIN || '*' 
  });

  // Swagger Plugin
  await app.register(swagger, {
    swagger: {
      info: {
        title: 'Asset Management System',
        description: 'API documentation for Asset Management System',
        version: '1.0.0',
      },
      host: `localhost:${process.env.PORT || 3000}`,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Users', description: 'User management' },
        { name: 'Roles', description: 'Role management' },
      ],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Enter JWT token with Bearer prefix (e.g. "Bearer <token>")',
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // ====== REGISTER ROUTES ======

  // Registrasi route dengan prefix URL secara konsisten
  await app.register(import('./routes/auth/auth.routes'), { prefix: '/api/auth' });
  await app.register(import('./routes/user.routes'), { prefix: '/api/users' });
  
  // NOTE: Jika file role.routes.ts sudah ada, daftarkan di sini:
  // await app.register(import('./routes/role.routes'), { prefix: '/roles' });

  // ====== GLOBAL ERROR HANDLER ======
  app.setErrorHandler(
    async (error: FastifyError, _request: FastifyRequest, reply: FastifyReply) => {
      app.log.error(error);

      if (error.validation) {
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

      if (error.statusCode === 403) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to access this resource',
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

  // ====== NOT FOUND HANDLER ======
  app.setNotFoundHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Resource not found',
    });
  });
 return app;
}