import { FastifyInstance } from 'fastify';
import * as userController from '../controllers/user.controller';
import { authorize } from '../middlewares/rbac';

export default async function (app: FastifyInstance) {
  // ====== ROLE MANAGEMENT (ADMIN ONLY) ======
  app.get('/roles', { 
    preHandler: [app.authenticate, authorize('ADMIN')],
    schema: {
      description: 'Get all roles',
      tags: ['Roles'],
      security: [{ bearerAuth: [] }],
    } as any,
  }, userController.getRoles);

  // ====== USER MANAGEMENT ======
  app.get('/', { 
    preHandler: [app.authenticate],
    schema: {
      description: 'Get all users',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
    } as any,
  }, userController.getUsers);

  app.get('/me', { 
    preHandler: [app.authenticate],
    schema: {
      description: 'Get current user profile',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
    } as any,
  }, userController.getMe);

  app.put('/:id/role', { 
    preHandler: [app.authenticate, authorize('ADMIN')],
    schema: {
      description: 'Update user role (admin only)',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        required: ['roleId'],
        properties: { roleId: { type: 'number' } },
      },
    } as any,
  }, userController.updateUserRole);
}