import { FastifyInstance } from 'fastify';
import { loginHandler, forgotPasswordHandler } from '../../controllers/auth/auth.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  // Endpoint login: POST http://localhost:3000/api/auth/login
  fastify.post('/login', loginHandler);

  // Endpoint lupa password: POST http://localhost:3000/api/auth/forgot-password
  fastify.post('/forgot-password', forgotPasswordHandler);
}