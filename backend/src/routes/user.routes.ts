import { FastifyInstance } from 'fastify';
import * as userController from '../controllers/user.controller';
import { authorize } from '../middlewares/rbac';

export default async function (app: FastifyInstance) {
  // ====== PUBLIC ROUTES ======
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

  // ====== PROTECTED ROUTES ======
  
  // ✅ PERBAIKAN: logout hanya perlu authenticate, tidak perlu admin role
  app.post('/logout', { 
    preHandler: [app.authenticate],
    schema: {
      description: 'Logout user',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
    },
  }, userController.logout);

  // ====== ROLE MANAGEMENT (ADMIN ONLY) ======
  
  // ✅ PERBAIKAN: createRole memerlukan ADMIN authorization
  app.post('/roles', { 
    preHandler: [app.authenticate, authorize('ADMIN')],
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
    preHandler: [app.authenticate, authorize('ADMIN')],
    schema: {
      description: 'Get all roles',
      tags: ['Roles'],
      security: [{ bearerAuth: [] }],
    },
  }, userController.getRoles);

  // ====== USER MANAGEMENT (ADMIN) ======
  
  // ✅ PERBAIKAN: getUsers hanya perlu authenticate, bisa di-set untuk view user lain
  app.get('/users', { 
    preHandler: [app.authenticate],
    schema: {
      description: 'Get all users',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
    },
  }, userController.getUsers);

  // ✅ PERBAIKAN: updateUserRole memerlukan ADMIN authorization
  app.put('/users/:id/role', { 
    preHandler: [app.authenticate, authorize('ADMIN')],
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

  // ✅ TAMBAHAN: Get user profile (authenticated users)
  app.get('/me', {
    preHandler: [app.authenticate],
    schema: {
      description: 'Get current user profile',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
    },
  }, userController.getCurrentUser);
}
