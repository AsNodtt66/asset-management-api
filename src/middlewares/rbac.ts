import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../utils/prisma';

export function authorize(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { role: true }
    });
    if (!userWithRole || !allowedRoles.includes(userWithRole.role.name)) {
      reply.status(403).send({ error: 'Forbidden' });
    }
  };
}