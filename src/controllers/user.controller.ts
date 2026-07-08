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

// ... implementasi createRole, getRoles, getUsers, updateUserRole menggunakan Prisma