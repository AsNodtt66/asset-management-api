import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import prisma from '../../utils/prisma';

export const loginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  // 1. Ambil input email dan password dari user
  const { email, password } = request.body as any;

  try {
    // 2. Cari pengguna di database berdasarkan email, sekaligus ambil data nama Role-nya
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // 3. Jika user tidak ditemukan, kirim error kredensial salah
    if (!user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Email atau password yang Anda masukkan salah',
      });
    }

    // 4. Cocokkan password input dengan password yang ter-hash di database menggunakan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Email atau password yang Anda masukkan salah',
      });
    }

    // 5. Jika password benar, buat token JWT. Isi payload JWT sesuai ekstensi tipe di 'authenticate.ts'
    const token = request.server.jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role.name, // Menyimpan string nama Role seperti 'ADMIN' atau 'USER'
    }, {
      expiresIn: '1d' // Token hangus dalam waktu 1 hari
    });

    // 6. Kembalikan respons sukses beserta tokennya
    return reply.status(200).send({
      statusCode: 200,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
        },
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Terjadi masalah pada server saat memproses login',
    });
  }
};

export const forgetPasswordHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email } = request.body as any;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Untuk keamanan, disarankan jangan memberi tahu jika email tidak terdaftar
    if (!user) {
      return reply.status(200).send({
        statusCode: 200,
        message: 'Jika email terdaftar di sistem kami, instruksi reset password akan dikirimkan.',
      });
    }

    // Pembuatan token reset tiruan untuk simulasi (atau gunakan crypto bawaan node)
    const mockResetToken = 'rst-' + Math.random().toString(36).substring(2, 15);
    const expiryTime = new Date(Date.now() + 3600000); // Aktif selama 1 jam

    // Simpan token ke database user sesuai model skema baru kita
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: mockResetToken,
        resetPasswordExp: expiryTime,
      },
    });

    // TODO: Di sinilah tempat kamu menaruh logika pengiriman email asli (misal pakai nodemailer)
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
      message: 'Gagal memproses permintaan lupa password',
    });
  }
};