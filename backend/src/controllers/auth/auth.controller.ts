import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../../utils/prisma';

export const loginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = request.body as any;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Email atau password yang Anda masukkan salah',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Email atau password yang Anda masukkan salah',
      });
    }

    const token = await reply.jwtSign({
      userId: user.id,
      email: user.email,
      role: user.role.name,
    });

    return reply.status(200).send({
      statusCode: 200,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
        },
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan pada server saat login',
    });
  }
};

export const forgetPasswordHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email } = request.body as any;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return reply.status(200).send({
        statusCode: 200,
        message: 'Jika email terdaftar di sistem kami, instruksi reset password akan dikirimkan.',
      });
    }

    // Menggunakan crypto yang aman (Secure Cryptography)
    const mockResetToken = 'rst-' + crypto.randomBytes(16).toString('hex');
    const expiryTime = new Date(Date.now() + 3600000); // 1 Jam

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: mockResetToken,
        resetPasswordExp: expiryTime,
      },
    });

    console.log(`[SIMULASI EMAIL] Kirim link ke ${email}: http://localhost:3000/api/auth/reset-password?token=${mockResetToken}`);

    return reply.status(200).send({
      statusCode: 200,
      message: 'Jika email terdaftar di sistem kami, instruksi reset password akan dikirimkan.',
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan saat memproses reset password',
    });
  }
};