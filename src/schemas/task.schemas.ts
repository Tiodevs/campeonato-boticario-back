import { z } from 'zod';
import { Priority } from './project.schemas';

// Schema para criar tarefa
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Título da tarefa é obrigatório')
    .min(2, 'Título deve ter pelo menos 2 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .trim(),
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
  completed: z.boolean().optional().default(false),
  dueDate: z
    .string()
    .datetime('Data inválida. Use o formato ISO 8601')
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  priority: z
    .nativeEnum(Priority)
    .optional()
    .default(Priority.MEDIUM),
  projectId: z
    .string()
    .min(1, 'ID do projeto é obrigatório'),
});

// Schema para atualizar tarefa
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(2, 'Título deve ter pelo menos 2 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
  completed: z.boolean().optional(),
  dueDate: z
    .string()
    .datetime('Data inválida. Use o formato ISO 8601')
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  priority: z
    .nativeEnum(Priority)
    .optional(),
  projectId: z
    .string()
    .min(1, 'ID do projeto é obrigatório')
    .optional(),
});

// Schema para listar tarefas (query params)
export const listTasksSchema = z.object({
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
  completed: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  priority: z.nativeEnum(Priority).optional(),
  projectId: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'dueDate', 'priority']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Tipos TypeScript derivados dos schemas
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksInput = z.infer<typeof listTasksSchema>;

