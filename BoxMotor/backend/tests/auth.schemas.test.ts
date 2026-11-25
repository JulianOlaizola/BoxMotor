import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  authRegisterSchema,
  authLoginSchema,
} from '../src/validators/index.js';

describe('authRegisterSchema', () => {
  it('acepta un registro valido', () => {
    const result = authRegisterSchema.safeParse({
      email: 'cliente@boxmotor.demo',
      password: 'Cliente123',
      firstName: 'Juan',
      lastName: 'Perez',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza email invalido', () => {
    const result = authRegisterSchema.safeParse({
      email: 'no-es-un-email',
      password: 'Cliente123',
      firstName: 'Juan',
      lastName: 'Perez',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('rechacha contrasena corta (menos de 8)', () => {
    const result = authRegisterSchema.safeParse({
      email: 'cliente@boxmotor.demo',
      password: 'corto',
      firstName: 'Juan',
      lastName: 'Perez',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password');
    }
  });

  it('rechaza nombre vacio', () => {
    const result = authRegisterSchema.safeParse({
      email: 'cliente@boxmotor.demo',
      password: 'Cliente123',
      firstName: '',
      lastName: 'Perez',
    });
    expect(result.success).toBe(false);
  });
});

describe('authLoginSchema', () => {
  it('acepta credenciales validas', () => {
    const result = authLoginSchema.safeParse({
      email: 'cliente@boxmotor.demo',
      password: 'Cliente123',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza email vacio en login', () => {
    const result = authLoginSchema.safeParse({
      email: '',
      password: 'Cliente123',
    });
    expect(result.success).toBe(false);
  });
});
