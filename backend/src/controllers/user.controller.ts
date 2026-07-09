import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

// 1. Registrasi User Baru (Melalui endpoint /auth/register)
export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password, name } = request.body as any;
    const defaultRoleId = 2; // Default role: USER sesuai Database Seeding

    if (!email || !password || !name) {
      return reply.status(400).send({ 
        statusCode: 400,
        error: 'Bad Request',
        message: 'Field email, password, dan name wajib diisi' 
      });
    }

    if (password.length < 6) {
      return reply.status(400).send({ 
        statusCode: 400,
        error: 'Bad Request',
        message: 'Password minimal harus 6 karakter' 
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.status(409).send({ 
        statusCode: 409,
        error: 'Conflict',
        message: 'Email sudah terdaftar di sistem' 
      });
    }

    const roleExists = await prisma.role.findUnique({ where: { id: defaultRoleId } });
    if (!roleExists) {
      return reply.status(500).send({ 
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Konfigurasi role default database tidak ditemukan' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name, 
        roleId: defaultRoleId 
      },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: { select: { id: true, name: true } },
        createdAt: true
      }
    });

    return reply.status(201).send({
      statusCode: 201,
      message: 'Registrasi pengguna berhasil',
      data: { user }
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ 
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan saat melakukan registrasi' 
    });
  }
}

// 2. Mendapatkan Profil Diri Sendiri (Me)
export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any)?.userId;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        email: true,
        name: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Profil pengguna tidak ditemukan'
      });
    }

    return reply.status(200).send({
      statusCode: 200,
      message: 'Berhasil mengambil profil data diri',
      data: { user }
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan saat mengambil data profil'
    });
  }
}

// 3. Mendapatkan Semua Daftar Pengguna (Admin Only)
export async function getUsers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const query = request.query as { page?: string; limit?: string };
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, parseInt(query.limit || '10', 10));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: { select: { id: true, name: true } },
          createdAt: true,
        },
        orderBy: { id: 'asc' },
        skip,
        take: limit
      }),
      prisma.user.count()
    ]);

    return reply.status(200).send({
      statusCode: 200,
      message: 'Berhasil mengambil daftar semua pengguna',
      data: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        users
      }
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ 
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan saat mengambil daftar pengguna' 
    });
  }
}

// 4. Mendapatkan Semua Daftar Roles (Admin Only)
export async function getRoles(request: FastifyRequest, reply: FastifyReply) {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    });

    return reply.status(200).send({
      statusCode: 200,
      message: 'Berhasil mengambil seluruh data role',
      data: { roles }
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ 
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan saat mengambil daftar role' 
    });
  }
}

// 5. Mengubah Hak Akses / Role Pengguna (Admin Only)
export async function updateUserRole(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const { roleId } = request.body as { roleId: number };

    if (!id || !roleId) {
      return reply.status(400).send({ 
        statusCode: 400,
        error: 'Bad Request',
        message: 'Parameter ID dan body roleId wajib disertakan' 
      });
    }

    const targetRole = await prisma.role.findUnique({
      where: { id: Number(roleId) }
    });

    if (!targetRole) {
      return reply.status(404).send({ 
        statusCode: 404,
        error: 'Not Found',
        message: 'Role target tidak ditemukan di database' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) }, 
      data: { roleId: Number(roleId) },
      select: {
        id: true,
        email: true,
        name: true,
        role: { select: { id: true, name: true } },
        updatedAt: true
      }
    });

    return reply.status(200).send({
      statusCode: 200,
      message: 'Role pengguna berhasil diperbarui',
      data: { user: updatedUser }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return reply.status(404).send({ 
        statusCode: 404,
        error: 'Not Found',
        message: 'Pengguna tidak ditemukan' 
      });
    }
    
    request.log.error(error);
    return reply.status(500).send({ 
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan server saat memperbarui role pengguna' 
    });
  }
}