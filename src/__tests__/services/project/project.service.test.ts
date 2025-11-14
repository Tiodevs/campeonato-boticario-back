import { ProjectService } from '../../../services/project/project.service';

// Mock do Prisma
jest.mock('../../../prisma/client', () => ({
  __esModule: true,
  default: {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import mockPrisma from '../../../prisma/client';

const mockProjectCreate = (mockPrisma as any).project.create;
const mockProjectFindMany = (mockPrisma as any).project.findMany;
const mockProjectFindFirst = (mockPrisma as any).project.findFirst;
const mockProjectUpdate = (mockPrisma as any).project.update;
const mockProjectDelete = (mockPrisma as any).project.delete;
const mockProjectCount = (mockPrisma as any).project.count;

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeEach(() => {
    jest.clearAllMocks();
    projectService = new ProjectService();
  });

  describe('createProject', () => {
    test('deve criar projeto com sucesso', async () => {
      const userId = 'user-123';
      const data = {
        name: 'Meu Projeto',
        description: 'Descrição',
        color: '#FF5733'
      };

      const mockProject = {
        id: 'project-123',
        ...data,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { tasks: 0 }
      };

      mockProjectCreate.mockResolvedValue(mockProject);

      const result = await projectService.createProject(userId, data);

      expect(mockProjectCreate).toHaveBeenCalledWith({
        data: {
          ...data,
          userId,
        },
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });
      expect(result).toEqual(mockProject);
    });

    test('deve lançar erro quando prisma.create falha', async () => {
      const userId = 'user-123';
      const data = {
        name: 'Meu Projeto',
        description: 'Descrição',
        color: '#FF5733'
      };

      mockProjectCreate.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(projectService.createProject(userId, data))
        .rejects.toThrow('Erro ao criar projeto');
    });
  });

  describe('listProjects', () => {
    test('deve listar projetos com paginação', async () => {
      const userId = 'user-123';
      const filters = {
        page: 1,
        limit: 10,
        search: undefined,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };

      const mockProjects = [];
      const mockTotal = 0;

      mockProjectFindMany.mockResolvedValue(mockProjects);
      mockProjectCount.mockResolvedValue(mockTotal);

      const result = await projectService.listProjects(userId, filters);

      expect(result).toEqual({
        projects: mockProjects,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    test('deve filtrar projetos por pesquisa', async () => {
      const userId = 'user-123';
      const filters = {
        page: 1,
        limit: 10,
        search: 'teste',
        sortBy: 'name' as const,
        sortOrder: 'asc' as const,
      };

      const mockProjects = [];
      const mockTotal = 0;

      mockProjectFindMany.mockResolvedValue(mockProjects);
      mockProjectCount.mockResolvedValue(mockTotal);

      await projectService.listProjects(userId, filters);

      expect(mockProjectFindMany).toHaveBeenCalledWith({
        where: {
          userId,
          name: {
            contains: 'teste',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: {
          name: 'asc',
        },
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });
    });

    test('deve lançar erro quando prisma.findMany ou count falha', async () => {
      const userId = 'user-123';
      const filters = {
        page: 1,
        limit: 10,
        search: undefined,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };

      mockProjectFindMany.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(projectService.listProjects(userId, filters))
        .rejects.toThrow('Erro ao listar projetos');
    });
  });

  describe('getProjectById', () => {
    test('deve retornar projeto quando encontrado', async () => {
      const userId = 'user-123';
      const projectId = 'project-123';

      const mockProject = {
        id: projectId,
        name: 'Meu Projeto',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { tasks: 0 }
      };

      mockProjectFindFirst.mockResolvedValue(mockProject);

      const result = await projectService.getProjectById(userId, projectId);

      expect(result).toEqual(mockProject);
    });

    test('deve lançar erro quando projeto não é encontrado', async () => {
      const userId = 'user-123';
      const projectId = 'project-123';

      mockProjectFindFirst.mockResolvedValue(null);

      await expect(projectService.getProjectById(userId, projectId))
        .rejects.toThrow('PROJECT_NOT_FOUND');
    });

    test('deve lançar erro quando prisma.findFirst falha', async () => {
      const userId = 'user-123';
      const projectId = 'project-123';

      mockProjectFindFirst.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(projectService.getProjectById(userId, projectId))
        .rejects.toThrow('Erro ao buscar projeto');
    });
  });

  describe('updateProject', () => {
    test('deve atualizar projeto com sucesso', async () => {
      const userId = 'user-123';
      const projectId = 'project-123';
      const data = {
        name: 'Projeto Atualizado'
      };

      const existingProject = {
        id: projectId,
        name: 'Meu Projeto',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { tasks: 0 }
      };

      const updatedProject = {
        ...existingProject,
        ...data,
        updatedAt: new Date(),
      };

      mockProjectFindFirst.mockResolvedValue(existingProject);
      mockProjectUpdate.mockResolvedValue(updatedProject);

      const result = await projectService.updateProject(userId, projectId, data);

      expect(result).toEqual(updatedProject);
    });

    test('deve lançar erro quando prisma.update falha', async () => {
      const userId = 'user-123';
      const projectId = 'project-123';
      const data = {
        name: 'Projeto Atualizado'
      };

      const existingProject = {
        id: projectId,
        name: 'Meu Projeto',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { tasks: 0 }
      };

      mockProjectFindFirst.mockResolvedValue(existingProject);
      mockProjectUpdate.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(projectService.updateProject(userId, projectId, data))
        .rejects.toThrow('Erro ao atualizar projeto');
    });
  });

  describe('deleteProject', () => {
    test('deve deletar projeto com sucesso', async () => {
      const userId = 'user-123';
      const projectId = 'project-123';

      const existingProject = {
        id: projectId,
        name: 'Meu Projeto',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { tasks: 0 }
      };

      mockProjectFindFirst.mockResolvedValue(existingProject);
      mockProjectDelete.mockResolvedValue(existingProject);

      const result = await projectService.deleteProject(userId, projectId);

      expect(result).toEqual({ message: 'Projeto deletado com sucesso' });
    });

    test('deve lançar erro quando prisma.delete falha', async () => {
      const userId = 'user-123';
      const projectId = 'project-123';

      const existingProject = {
        id: projectId,
        name: 'Meu Projeto',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { tasks: 0 }
      };

      mockProjectFindFirst.mockResolvedValue(existingProject);
      mockProjectDelete.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(projectService.deleteProject(userId, projectId))
        .rejects.toThrow('Erro ao deletar projeto');
    });
  });
});

