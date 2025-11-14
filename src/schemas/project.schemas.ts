import { z } from 'zod';

// Enum para prioridade
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

// Schema para criar projeto
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome do projeto é obrigatório')
    .min(2, 'Nome do projeto deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do projeto deve ter no máximo 100 caracteres')
    .trim(),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .optional()
    .nullable(),
});

// Schema para atualizar projeto
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome do projeto deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do projeto deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .optional()
    .nullable(),
});

// Schema para listar projetos (query params)
export const listProjectsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Página deve ser maior que 0'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, 'Limit deve estar entre 1 e 100'),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Tipos TypeScript derivados dos schemas
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsInput = z.infer<typeof listProjectsSchema>;

