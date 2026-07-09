import { FastifyInstance } from 'fastify';
import * as userController from '../controllers/user.controller';
import { authorize } from '../middlewares/rbac';

export default async function (app: FastifyInstance) {
  // Semua rute di file ini membutuhkan autentikasi token JWT global
  app.addHook('preHandler', app.authenticate);

  // ====== ROLE MANAGEMENT (ADMIN ONLY) ======
  app.get('/roles', { 
    preHandler: [authorize('ADMIN')],
    schema: {
      description: 'Mendapatkan semua daftar role yang tersedia (Admin Only)',
      tags: ['Roles'],
      security: [{ bearerAuth: [] }],
    } as any,
  }, userController.getRoles);

  // ====== USER MANAGEMENT ======
  
  // Ambil daftar pengguna global (Proteksi Kritis: Ditambahkan ADMIN Only)
  app.get('/', { 
    preHandler: [authorize('ADMIN')],
    schema: {
      description: 'Mendapatkan data seluruh pengguna terdaftar (Admin Only)',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 10 }
        }
      }
    } as any,
  }, userController.getUsers);

  // Ambil data profil diri sendiri (Bisa diakses oleh semua role terautentikasi)
  app.get('/me', { 
    schema: {
      description: 'Mendapatkan profil data diri pengguna saat ini',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
    } as any,
  }, userController.getMe);

  // Mengubah role user lain
  app.put('/:id/role', { 
    preHandler: [authorize('ADMIN')],
    schema: {
      description: 'Mengubah tingkat level/role hak akses pengguna lain (Admin Only)',
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