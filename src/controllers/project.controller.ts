/// <reference types="../@types/express" />
import { Request, Response } from 'express';
import { ProjectService } from '../services/project/project.service';
import { CreateProjectInput, UpdateProjectInput, ListProjectsInput } from '../schemas/project.schemas';

const projectService = new ProjectService();

export class ProjectController {
  // Criar novo projeto
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

      const data: CreateProjectInput = req.body;
      const project = await projectService.createProject(userId, data);

      res.status(201).json({
        message: 'Projeto criado com sucesso',
        project
      });
    } catch (error: unknown) {
      console.error('Erro ao criar projeto:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };

  // Listar projetos
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

      const filters: ListProjectsInput = req.query as any;
      const result = await projectService.listProjects(userId, filters);

      res.json(result);
    } catch (error: unknown) {
      console.error('Erro ao listar projetos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };

  // Obter projeto por ID
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
      const project = await projectService.getProjectById(userId, id);

      res.json({ project });
    } catch (error: unknown) {
      console.error('Erro ao buscar projeto:', error);

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

  // Atualizar projeto
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
      const data: UpdateProjectInput = req.body;
      const project = await projectService.updateProject(userId, id, data);

      res.json({
        message: 'Projeto atualizado com sucesso',
        project
      });
    } catch (error: unknown) {
      console.error('Erro ao atualizar projeto:', error);

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

  // Deletar projeto
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
      const result = await projectService.deleteProject(userId, id);

      res.json(result);
    } catch (error: unknown) {
      console.error('Erro ao deletar projeto:', error);

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
}

