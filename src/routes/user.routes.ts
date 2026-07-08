import { FastifyInstance } from 'fastify';
import * as userController from '../controllers/user.controller';

export default async function (app: FastifyInstance) {
  // Public routes
  app.post('/register', {
    schema: {
      description: 'Register a new user',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string' },
        },
      },
      response: {
        201: { description: 'User registered successfully' },
        400: { description: 'Bad request' },
      },
    },
  }, userController.register);

  app.post('/login', {
    schema: {
      description: 'Login user',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      response: {
        200: { description: 'Login successful' },
        401: { description: 'Invalid credentials' },
      },
    },
  }, userController.login);

  // Protected routes
  app.post('/logout', { 
    preHandler: [app.authenticate],
    schema: {
      description: 'Logout user',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
    },
  }, userController.logout);

  // Role management (admin only)
  app.post('/roles', { 
    preHandler: [app.authenticate],
    schema: {
      description: 'Create a new role (admin only)',
      tags: ['Roles'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
        },
      },
    },
  }, userController.createRole);

  app.get('/roles', { 
    preHandler: [app.authenticate],
    schema: {
      description: 'Get all roles',
      tags: ['Roles'],
      security: [{ bearerAuth: [] }],
    },
  }, userController.getRoles);

  // User management (admin)
  app.get('/users', { 
    preHandler: [app.authenticate],
    schema: {
      description: 'Get all users',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
    },
  }, userController.getUsers);

  app.put('/users/:id/role', { 
    preHandler: [app.authenticate],
    schema: {
      description: 'Update user role (admin only)',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['roleId'],
        properties: {
          roleId: { type: 'number' },
        },
      },
    },
  }, userController.updateUserRole);
}