import { FastifyInstance } from 'fastify';
import { loginHandler, forgetPasswordHandler } from '../../controllers/auth/auth.controller';
import * as userController from '../../controllers/user.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /api/auth/register
  fastify.post('/register', {
    schema: {
      description: 'Pendaftaran akun pengguna baru',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string' }
        }
      }
    } as any
  }, userController.register);

  // POST /api/auth/login
  fastify.post('/login', {
    schema: {
      description: 'Masuk log pengguna ke sistem',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    } as any
  }, loginHandler);

  // POST /api/auth/forget-password
  fastify.post('/forget-password', {
    schema: {
      description: 'Permintaan reset kata sandi',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' }
        }
      }
    } as any
  }, forgetPasswordHandler);
}