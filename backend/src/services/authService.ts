import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/userRepository.js';
import { customerRepository } from '../repositories/customerRepository.js';

const BCRYPT_COST = 10;

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'], issuer: 'boxmotor' };
  return jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role },
    env.JWT_SECRET,
    options
  );
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, { issuer: 'boxmotor' }) as TokenPayload;
  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string | null;
    address?: string | null;
  }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      const err: any = new Error('Email ya registrado');
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await hashPassword(data.password);
    // El registro publico siempre crea CLIENT. Los demas roles los crea un ADMIN por el endpoint de usuarios.
    const role = 'CLIENT' as const;
    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      role,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    await customerRepository.create({
      userId: user.id,
      phone: data.phone ?? null,
      address: data.address ?? null,
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return {
      user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name },
      token,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmail(data.email);
    if (!user || !user.active) {
      const err: any = new Error('Credenciales invalidas');
      err.statusCode = 401;
      throw err;
    }

    const valid = await comparePassword(data.password, user.password_hash);
    if (!valid) {
      const err: any = new Error('Credenciales invalidas');
      err.statusCode = 401;
      throw err;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return {
      user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name },
      token,
    };
  }
}

export const authService = new AuthService();

