import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodIssue } from 'zod';

// Middleware de validação para req.body
export const validate = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida e transforma os dados
      req.body = schema.parse(req.body) as z.infer<T>;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          error: 'Dados inválidos',
          details: errors,
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      // Erro inesperado
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// Middleware de validação para req.params
export const validateParams = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida e transforma os parâmetros
      const parsed = schema.parse(req.params) as z.infer<T>;
      req.params = parsed as typeof req.params;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          error: 'Parâmetros inválidos',
          details: errors,
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      // Erro inesperado
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// Middleware de validação para req.query
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida e transforma os query parameters
      const parsed = schema.parse(req.query) as z.infer<T>;
      req.query = parsed as typeof req.query;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          error: 'Query parameters inválidos',
          details: errors,
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      // Erro inesperado
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
}; 