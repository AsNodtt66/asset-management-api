import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      userId: number;
      email: string;
      role: string; // Menyimpan nama role langsung ('ADMIN', 'USER', dll)
    }; 
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async function (fastify: FastifyInstance) {
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ 
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Token tidak valid atau telah kedaluwarsa' 
      });
    }
  });
});