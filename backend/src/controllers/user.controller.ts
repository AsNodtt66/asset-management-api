import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { email, password, name, roleId } = request.body as any;
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, name, roleId },
    select: { id: true, email: true, name: true, role: true }
  });
  reply.send(user);
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as any;
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }
  const token = await reply.jwtSign({ userId: user.id, role: user.role.name });
  reply.send({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role.name } });
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  // Simple logout: client harus hapus token. Bisa tambahkan blacklist di Redis.
  reply.send({ message: 'Logged out successfully' });
}
// Tambahkan di bagian bawah user.controller.ts

export async function createRole(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { name } = request.body as { name: string };
    
    // Validasi apakah role sudah ada
    const existingRole = await prisma.role.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } } // Case-insensitive check
    });

    if (existingRole) {
      return reply.status(400).send({ error: 'Role already exists' });
    }

    const newRole = await prisma.role.create({
      data: { name }
    });

    return reply.status(201).send(newRole);
  } catch (error) {
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function getRoles(request: FastifyRequest, reply: FastifyReply) {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' }
    });
    return reply.send(roles);
  } catch (error) {
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function getUsers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: {
          select: {
            name: true
          }
        },
        createdAt: true // Asumsi field ini ada di skema Anda
      },
      orderBy: { name: 'asc' }
    });
    return reply.send(users);
  } catch (error) {
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function updateUserRole(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const { roleId } = request.body as { roleId: number };

    // Validasi apakah role target valid dan ada di database
    const targetRole = await prisma.role.findUnique({
      where: { id: Number(roleId) }
    });

    if (!targetRole) {
      return reply.status(404).send({ error: 'Target role not found' });
    }

    // Update role user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { roleId: Number(roleId) },
      select: {
        id: true,
        email: true,
        name: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });

    return reply.send({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    // Menangani error jika ID user tidak ditemukan di database (P2025)
    if (error.code === 'P2025') {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.status(500).send({ error: 'Internal server error' });
  }
}