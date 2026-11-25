import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function validate(
  schema: any,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req[source]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const e: any = new Error('Validacion fallida');
        e.statusCode = 400;
        e.details = err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next(e);
      }
      next(err);
    }
  };
}

