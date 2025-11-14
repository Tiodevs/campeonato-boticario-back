import { Request, Response } from 'express';

const mockCreateProject = jest.fn();
const mockListProjects = jest.fn();
const mockGetProjectById = jest.fn();
const mockUpdateProject = jest.fn();
const mockDeleteProject = jest.fn();

import { ProjectController } from '../../controllers/project.controller';

jest.mock('../../services/project/project.service', () => {
  return {
    ProjectService: jest.fn().mockImplementation(() => {
      return {
        createProject: mockCreateProject,
        listProjects: mockListProjects,
        getProjectById: mockGetProjectById,
        updateProject: mockUpdateProject,
        deleteProject: mockDeleteProject,
      };
    })
  };
});

describe('ProjectController', () => {
  let projectController: ProjectController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    projectController = new ProjectController();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('create', () => {
    test('deve retornar 201 quando projeto é criado com sucesso', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        body: {
          name: 'Meu Projeto',
          description: 'Descrição do projeto',
          color: '#FF5733'
        }
      };

      const mockProject = {
        id: 'project-123',
        name: 'Meu Projeto',
        description: 'Descrição do projeto',
        color: '#FF5733',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { tasks: 0 }
      };

      mockCreateProject.mockResolvedValue(mockProject);

      await projectController.create(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Projeto criado com sucesso',
        project: mockProject
      });
    });

    test('deve retornar 401 quando token é inválido', async () => {
      mockReq = {
        body: {
          name: 'Meu Projeto'
        }
      };

      await projectController.create(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    });

    test('deve retornar 500 quando ocorre erro interno', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        body: {
          name: 'Meu Projeto'
        }
      };

      mockCreateProject.mockRejectedValue(new Error('Erro interno do servidor'));

      await projectController.create(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('list', () => {
    test('deve retornar 200 com lista de projetos', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        query: {
          page: '1',
          limit: '10'
        }
      };

      const mockResult = {
        projects: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };

      mockListProjects.mockResolvedValue(mockResult);

      await projectController.list(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    test('deve retornar 401 quando token é inválido', async () => {
      mockReq = {
        query: {
          page: '1',
          limit: '10'
        }
      };

      await projectController.list(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    });

    test('deve retornar 500 quando ocorre erro interno', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        query: {
          page: '1',
          limit: '10'
        }
      };

      mockListProjects.mockRejectedValue(new Error('Erro interno do servidor'));

      await projectController.list(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('getById', () => {
    test('deve retornar 200 quando projeto é encontrado', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'project-123' }
      };

      const mockProject = {
        id: 'project-123',
        name: 'Meu Projeto',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { tasks: 0 }
      };

      mockGetProjectById.mockResolvedValue(mockProject);

      await projectController.getById(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({ project: mockProject });
    });

    test('deve retornar 401 quando token é inválido', async () => {
      mockReq = {
        params: { id: 'project-123' }
      };

      await projectController.getById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    });

    test('deve retornar 404 quando projeto não é encontrado', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'project-123' }
      };

      mockGetProjectById.mockRejectedValue(new Error('PROJECT_NOT_FOUND'));

      await projectController.getById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Projeto não encontrado',
        code: 'PROJECT_NOT_FOUND'
      });
    });

    test('deve retornar 500 quando ocorre erro interno', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'project-123' }
      };

      mockGetProjectById.mockRejectedValue(new Error('Erro interno do servidor'));

      await projectController.getById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('update', () => {
    test('deve retornar 200 quando projeto é atualizado com sucesso', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'project-123' },
        body: {
          name: 'Projeto Atualizado'
        }
      };

      const mockProject = {
        id: 'project-123',
        name: 'Projeto Atualizado',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { tasks: 0 }
      };

      mockUpdateProject.mockResolvedValue(mockProject);

      await projectController.update(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({
        message: 'Projeto atualizado com sucesso',
        project: mockProject
      });
    });

    test('deve retornar 401 quando token é inválido', async () => {
      mockReq = {
        params: { id: 'project-123' },
        body: {
          name: 'Projeto Atualizado'
        }
      };

      await projectController.update(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    });

    test('deve retornar 404 quando projeto não é encontrado', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'project-123' },
        body: {
          name: 'Projeto Atualizado'
        }
      };

      mockUpdateProject.mockRejectedValue(new Error('PROJECT_NOT_FOUND'));

      await projectController.update(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Projeto não encontrado',
        code: 'PROJECT_NOT_FOUND'
      });
    });

    test('deve retornar 500 quando ocorre erro interno', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'project-123' },
        body: {
          name: 'Projeto Atualizado'
        }
      };

      mockUpdateProject.mockRejectedValue(new Error('Erro interno do servidor'));

      await projectController.update(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('delete', () => {
    test('deve retornar 200 quando projeto é deletado com sucesso', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'project-123' }
      };

      const mockResult = { message: 'Projeto deletado com sucesso' };

      mockDeleteProject.mockResolvedValue(mockResult);

      await projectController.delete(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    test('deve retornar 401 quando token é inválido', async () => {
      mockReq = {
        params: { id: 'project-123' }
      };

      await projectController.delete(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    });

    test('deve retornar 404 quando projeto não é encontrado', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'project-123' }
      };

      mockDeleteProject.mockRejectedValue(new Error('PROJECT_NOT_FOUND'));

      await projectController.delete(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Projeto não encontrado',
        code: 'PROJECT_NOT_FOUND'
      });
    });

    test('deve retornar 500 quando ocorre erro interno', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'project-123' }
      };

      mockDeleteProject.mockRejectedValue(new Error('Erro interno do servidor'));

      await projectController.delete(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });
});

