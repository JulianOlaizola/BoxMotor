import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService.js';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    const err: any = new Error('Token de autenticacion requerido');
    err.statusCode = 401;
    return next(err);
  }
  const token = header.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    const err: any = new Error('Token invalido o expirado');
    err.statusCode = 401;
    next(err);
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const err: any = new Error('Autenticacion requerida');
      err.statusCode = 401;
      return next(err);
    }
    if (!roles.includes(req.user.role)) {
      const err: any = new Error('Permiso insuficiente');
      err.statusCode = 403;
      return next(err);
    }
    next();
  };
}

