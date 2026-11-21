import { Request, Response, NextFunction } from 'express';

/**
 * Middleware centralizado de errores (R-043).
 * Responde siempre JSON con codigo y mensaje, sin filtrar detalles internos.
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Restriccion de unicidad de PostgreSQL (email, plate_norm, parts.code, etc.)
  if (err.code === '23505') {
    res.status(409).json({ code: 409, message: 'Conflicto: valor duplicado' });
    return;
  }
  // Restriccion CHECK (stock >= 0, kilometraje, duracion, precios)
  if (err.code === '23514') {
    res.status(409).json({ code: 409, message: 'Conflicto: restriccion de integridad' });
    return;
  }
  // Violacion de clave foranea
  if (err.code === '23503') {
    res.status(400).json({ code: 400, message: 'Referencia invalida' });
    return;
  }

  res.status(statusCode).json({ code: statusCode, message });
}

