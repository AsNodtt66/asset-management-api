import { FastifyRequest, FastifyReply } from 'fastify';

export function authorize(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;

    if (!user || !user.role || !allowedRoles.includes(user.role)) {
      return reply.status(403).send({ 
        statusCode: 403,
        error: 'Forbidden',
        message: 'Access denied: Anda tidak memiliki hak akses untuk halaman ini' 
      });
    }
  };
}