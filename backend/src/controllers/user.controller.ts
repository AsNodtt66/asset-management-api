import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

// ✅ PERBAIKAN: 1. Registrasi User Baru (IMPROVED)
export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password, name} = request.body as any;
    const roleId = 2;
    // ✅ Validasi input
    if (!email || !password || !name) {
      return reply.status(400).send({ 
        error: 'Missing required fields: email, password, name' 
      });
    }

    if (password.length < 6) {
      return reply.status(400).send({ 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Validasi apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      return reply.status(409).send({ 
        error: 'Email already registered' 
      });
    }

    // Validasi roleId jika dikirim
    const role = await prisma.role.findUnique({ 
      where: { id: Number(roleId) } 
    });
    
    if (!role) {
      return reply.status(400).send({ 
        error: 'Invalid roleId. Role does not exist.' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name, 
        roleId: Number(roleId) 
      },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: { 
          select: { id: true, name: true } 
        },
        createdAt: true
      }
    });

    return reply.status(201).send({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    return reply.status(500).send({ 
      error: 'Internal server error during registration' 
    });
  }
}

// ✅ PERBAIKAN: 2. Login User (IMPROVED)
export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password } = request.body as any;

    // ✅ Validasi input
    if (!email || !password) {
      return reply.status(400).send({ 
        error: 'Missing required fields: email, password' 
      });
    }
    
    // Cari user dengan role-nya
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { role: true }
    });

    // ✅ Validasi user exists
    if (!user) {
      return reply.status(401).send({ 
        error: 'Invalid email or password' 
      });
    }

    // ✅ Validasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return reply.status(401).send({ 
        error: 'Invalid email or password' 
      });
    }

    // ✅ Generate JWT token dengan payload yang sesuai
    const token = await reply.jwtSign({ 
      userId: user.id, 
      email: user.email,
      role: user.role.name 
    });
    
    return reply.send({ 
      message: 'Login successful',
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role.name,
        createdAt: user.createdAt
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return reply.status(500).send({ 
      error: 'Internal server error during login' 
    });
  }
}

// ✅ PERBAIKAN: 3. Logout User
export async function logout(_request: FastifyRequest, reply: FastifyReply) {
  try {
    // ✅ Logout hanya clear token di client-side, server-side tidak perlu do anything
    return reply.send({ 
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout error:', error);
    return reply.status(500).send({ 
      error: 'Internal server error during logout' 
    });
  }
}

// ✅ PERBAIKAN: 4. Get Current User Profile (Diubah menjadi getMe)
export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any)?.userId;

    if (!userId) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'User data not found in token'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        email: true,
        name: true,
        role: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User profile no longer exists'
      });
    }

    return reply.send({
      message: 'Fetch current profile successful',
      user
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// ✅ PERBAIKAN: 5. Membuat Role Baru (Admin Only)
export async function createRole(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { name } = request.body as any;

    // ✅ Validasi input
    if (!name || typeof name !== 'string') {
      return reply.status(400).send({ 
        error: 'Role name is required and must be a string' 
      });
    }

    // Normalize nama role ke uppercase
    const normalizedName = name.toUpperCase().trim();

    if (normalizedName.length === 0) {
      return reply.status(400).send({ 
        error: 'Role name cannot be empty' 
      });
    }

    // Cek duplikasi nama role
    const existingRole = await prisma.role.findUnique({ 
      where: { name: normalizedName } 
    });

    if (existingRole) {
      return reply.status(409).send({ 
        error: 'Role already exists' 
      });
    }

    // Create role
    const role = await prisma.role.create({
      data: { name: normalizedName }
    });
    
    return reply.status(201).send({
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    console.error('Create role error:', error);
    return reply.status(500).send({ 
      error: 'Internal server error creating role' 
    });
  }
}

// ✅ PERBAIKAN: 6. Mengambil Semua Daftar Role
export async function getRoles(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { users: true }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: { id: 'asc' }
    });

    return reply.send({
      total: roles.length,
      roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    return reply.status(500).send({ 
      error: 'Internal server error fetching roles' 
    });
  }
}

// ✅ PERBAIKAN: 7. Mengambil Semua Daftar User (Admin Only)
export async function getUsers(request: FastifyRequest, reply: FastifyReply) {
  try {
    // ✅ Optional: Pagination
    const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
    const skip = ((page || 1) - 1) * (limit || 10);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: {
            select: { id: true, name: true }
          },
          createdAt: true,
          updatedAt: true
        },
        orderBy: { id: 'asc' },
        skip: skip,
        take: limit || 10
      }),
      prisma.user.count()
    ]);

    return reply.send({
      total,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil(total / (limit || 10)),
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    return reply.status(500).send({ 
      error: 'Internal server error fetching users' 
    });
  }
}

// ✅ PERBAIKAN: 8. Mengubah Role User (Admin Only)
export async function updateUserRole(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const { roleId } = request.body as { roleId: number };

    // ✅ Validasi input
    if (!id || !roleId) {
      return reply.status(400).send({ 
        error: 'Missing required fields: id, roleId' 
      });
    }

    // Validasi target role exists
    const targetRole = await prisma.role.findUnique({
      where: { id: Number(roleId) }
    });

    if (!targetRole) {
      return reply.status(404).send({ 
        error: 'Target role not found' 
      });
    }

    // Convert string id ke number dan update user role
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) }, 
      data: { roleId: Number(roleId) },
      select: {
        id: true,
        email: true,
        name: true,
        role: {
          select: { id: true, name: true }
        },
        updatedAt: true
      }
    });

    return reply.send({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    // ✅ Handle Prisma specific errors
    if (error.code === 'P2025') {
      return reply.status(404).send({ 
        error: 'User not found' 
      });
    }
    
    console.error('Update user role error:', error);
    return reply.status(500).send({ 
      error: 'Internal server error updating user role' 
    });
  }
}
