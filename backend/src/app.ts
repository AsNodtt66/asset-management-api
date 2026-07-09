import Fastify, { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import authPlugin from './plugins/authenticate';
import userRoutes from './routes/user.routes';

// Di-comment sementara agar project bisa di-build tanpa error file missing
// import swagger from '@fastify/swagger';
// import swaggerUi from '@fastify/swagger-ui';
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

  // ====== REGISTER ROUTES ======

  // Registrasi route authentication dengan prefix URL
  await app.register(import('./routes/auth/auth.routes'), { prefix: '/api/auth' });
  
  // Register User Routes bawaan
  await app.register(userRoutes, { prefix: '/api/users' });

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