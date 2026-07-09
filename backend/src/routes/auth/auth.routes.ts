import { FastifyInstance } from 'fastify';
import { loginHandler, forgetPasswordHandler } from '../../controllers/auth/auth.controller';
import * as userController from '../../controllers/user.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  // Endpoint pendaftaran: POST http://localhost:3000/api/auth/register
  fastify.post('/register', userController.register);

  // Endpoint login: POST http://localhost:3000/api/auth/login
  fastify.post('/login', loginHandler);

  // Endpoint lupa password: POST http://localhost:3000/api/auth/forget-password
  fastify.post('/forget-password', forgetPasswordHandler);
}