/// <reference types="../@types/express" />
import { Request, Response } from 'express';
import { TaskService } from '../services/task/task.service';
import { CreateTaskInput, UpdateTaskInput, ListTasksInput } from '../schemas/task.schemas';

const taskService = new TaskService();

export class TaskController {
  // Criar nova tarefa
  create = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Token inválido ou expirado',
          code: 'INVALID_TOKEN'
        });
        return;
      }

      const data: CreateTaskInput = req.body;
      const task = await taskService.createTask(userId, data);

      res.status(201).json({
        message: 'Tarefa criada com sucesso',
        task
      });
    } catch (error: unknown) {
      console.error('Erro ao criar tarefa:', error);

      if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
        res.status(404).json({
          error: 'Projeto não encontrado',
          code: 'PROJECT_NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };

  // Listar tarefas
  list = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Token inválido ou expirado',
          code: 'INVALID_TOKEN'
        });
        return;
      }

      const filters: ListTasksInput = req.query as any;
      const result = await taskService.listTasks(userId, filters);

      res.json(result);
    } catch (error: unknown) {
      console.error('Erro ao listar tarefas:', error);

      if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
        res.status(404).json({
          error: 'Projeto não encontrado',
          code: 'PROJECT_NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };

  // Obter tarefa por ID
  getById = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Token inválido ou expirado',
          code: 'INVALID_TOKEN'
        });
        return;
      }

      const { id } = req.params;
      const task = await taskService.getTaskById(userId, id);

      res.json({ task });
    } catch (error: unknown) {
      console.error('Erro ao buscar tarefa:', error);

      if (error instanceof Error && error.message === 'TASK_NOT_FOUND') {
        res.status(404).json({
          error: 'Tarefa não encontrada',
          code: 'TASK_NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };

  // Atualizar tarefa
  update = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Token inválido ou expirado',
          code: 'INVALID_TOKEN'
        });
        return;
      }

      const { id } = req.params;
      const data: UpdateTaskInput = req.body;
      const task = await taskService.updateTask(userId, id, data);

      res.json({
        message: 'Tarefa atualizada com sucesso',
        task
      });
    } catch (error: unknown) {
      console.error('Erro ao atualizar tarefa:', error);

      if (error instanceof Error) {
        if (error.message === 'TASK_NOT_FOUND') {
          res.status(404).json({
            error: 'Tarefa não encontrada',
            code: 'TASK_NOT_FOUND'
          });
          return;
        }

        if (error.message === 'PROJECT_NOT_FOUND') {
          res.status(404).json({
            error: 'Projeto não encontrado',
            code: 'PROJECT_NOT_FOUND'
          });
          return;
        }
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };

  // Deletar tarefa
  delete = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Token inválido ou expirado',
          code: 'INVALID_TOKEN'
        });
        return;
      }

      const { id } = req.params;
      const result = await taskService.deleteTask(userId, id);

      res.json(result);
    } catch (error: unknown) {
      console.error('Erro ao deletar tarefa:', error);

      if (error instanceof Error && error.message === 'TASK_NOT_FOUND') {
        res.status(404).json({
          error: 'Tarefa não encontrada',
          code: 'TASK_NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
}

