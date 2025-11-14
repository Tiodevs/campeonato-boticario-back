import { TaskService } from '../../../services/task/task.service';
import { Priority } from '../../../schemas/project.schemas';

// Mock do Prisma
jest.mock('../../../prisma/client', () => ({
  __esModule: true,
  default: {
    project: {
      findFirst: jest.fn(),
    },
    task: {
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

const mockProjectFindFirst = (mockPrisma as any).project.findFirst;
const mockTaskCreate = (mockPrisma as any).task.create;
const mockTaskFindMany = (mockPrisma as any).task.findMany;
const mockTaskFindFirst = (mockPrisma as any).task.findFirst;
const mockTaskUpdate = (mockPrisma as any).task.update;
const mockTaskDelete = (mockPrisma as any).task.delete;
const mockTaskCount = (mockPrisma as any).task.count;

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    jest.clearAllMocks();
    taskService = new TaskService();
  });

  describe('createTask', () => {
    test('deve criar tarefa com sucesso', async () => {
      const userId = 'user-123';
      const data = {
        title: 'Minha Tarefa',
        description: 'Descrição',
        projectId: 'project-123',
        priority: Priority.HIGH,
        completed: false,
        dueDate: null,
      };

      const mockProject = {
        id: 'project-123',
        name: 'Meu Projeto',
        userId,
      };

      const mockTask = {
        id: 'task-123',
        ...data,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: mockProject.id,
          name: mockProject.name,
          color: null,
        },
      };

      mockProjectFindFirst.mockResolvedValue(mockProject);
      mockTaskCreate.mockResolvedValue(mockTask);

      const result = await taskService.createTask(userId, data);

      expect(mockProjectFindFirst).toHaveBeenCalledWith({
        where: {
          id: data.projectId,
          userId,
        },
      });
      expect(result).toEqual(mockTask);
    });

    test('deve lançar erro quando projeto não é encontrado', async () => {
      const userId = 'user-123';
      const data = {
        title: 'Minha Tarefa',
        projectId: 'project-invalid',
        priority: Priority.MEDIUM,
        completed: false,
        dueDate: null,
      };

      mockProjectFindFirst.mockResolvedValue(null);

      await expect(taskService.createTask(userId, data))
        .rejects.toThrow('PROJECT_NOT_FOUND');
    });

    test('deve lançar erro quando prisma.create falha', async () => {
      const userId = 'user-123';
      const data = {
        title: 'Minha Tarefa',
        projectId: 'project-123',
        priority: Priority.HIGH,
        completed: false,
        dueDate: null,
      };

      const mockProject = {
        id: 'project-123',
        name: 'Meu Projeto',
        userId,
      };

      mockProjectFindFirst.mockResolvedValue(mockProject);
      mockTaskCreate.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(taskService.createTask(userId, data))
        .rejects.toThrow('Erro ao criar tarefa');
    });
  });

  describe('listTasks', () => {
    test('deve listar tarefas com paginação', async () => {
      const userId = 'user-123';
      const filters = {
        page: 1,
        limit: 10,
        search: undefined,
        completed: undefined,
        priority: undefined,
        projectId: undefined,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };

      const mockTasks = [];
      const mockTotal = 0;

      mockTaskFindMany.mockResolvedValue(mockTasks);
      mockTaskCount.mockResolvedValue(mockTotal);

      const result = await taskService.listTasks(userId, filters);

      expect(result).toEqual({
        tasks: mockTasks,
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

    test('deve filtrar tarefas por pesquisa', async () => {
      const userId = 'user-123';
      const filters = {
        page: 1,
        limit: 10,
        search: 'tarefa',
        completed: undefined,
        priority: undefined,
        projectId: undefined,
        sortBy: 'title' as const,
        sortOrder: 'asc' as const,
      };

      const mockTasks = [];
      const mockTotal = 0;

      mockTaskFindMany.mockResolvedValue(mockTasks);
      mockTaskCount.mockResolvedValue(mockTotal);

      await taskService.listTasks(userId, filters);

      expect(mockTaskFindMany).toHaveBeenCalledWith({
        where: {
          userId,
          title: {
            contains: 'tarefa',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: {
          title: 'asc',
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });
    });

    test('deve filtrar tarefas por status de conclusão', async () => {
      const userId = 'user-123';
      const filters = {
        page: 1,
        limit: 10,
        search: undefined,
        completed: true,
        priority: undefined,
        projectId: undefined,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };

      const mockTasks = [];
      const mockTotal = 0;

      mockTaskFindMany.mockResolvedValue(mockTasks);
      mockTaskCount.mockResolvedValue(mockTotal);

      await taskService.listTasks(userId, filters);

      expect(mockTaskFindMany).toHaveBeenCalledWith({
        where: {
          userId,
          completed: true,
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });
    });

    test('deve filtrar tarefas por prioridade', async () => {
      const userId = 'user-123';
      const filters = {
        page: 1,
        limit: 10,
        search: undefined,
        completed: undefined,
        priority: Priority.HIGH,
        projectId: undefined,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };

      const mockTasks = [];
      const mockTotal = 0;

      mockTaskFindMany.mockResolvedValue(mockTasks);
      mockTaskCount.mockResolvedValue(mockTotal);

      await taskService.listTasks(userId, filters);

      expect(mockTaskFindMany).toHaveBeenCalledWith({
        where: {
          userId,
          priority: Priority.HIGH,
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });
    });

    test('deve filtrar tarefas por projeto', async () => {
      const userId = 'user-123';
      const filters = {
        page: 1,
        limit: 10,
        search: undefined,
        completed: undefined,
        priority: undefined,
        projectId: 'project-123',
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };

      const mockProject = {
        id: 'project-123',
        name: 'Meu Projeto',
        userId,
      };

      const mockTasks = [];
      const mockTotal = 0;

      mockProjectFindFirst.mockResolvedValue(mockProject);
      mockTaskFindMany.mockResolvedValue(mockTasks);
      mockTaskCount.mockResolvedValue(mockTotal);

      await taskService.listTasks(userId, filters);

      expect(mockProjectFindFirst).toHaveBeenCalledWith({
        where: {
          id: filters.projectId,
          userId,
        },
      });
    });

    test('deve lançar erro quando projeto não é encontrado no filtro', async () => {
      const userId = 'user-123';
      const filters = {
        page: 1,
        limit: 10,
        search: undefined,
        completed: undefined,
        priority: undefined,
        projectId: 'project-invalid',
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };

      mockProjectFindFirst.mockResolvedValue(null);

      await expect(taskService.listTasks(userId, filters))
        .rejects.toThrow('PROJECT_NOT_FOUND');
    });

    test('deve lançar erro quando prisma.findMany ou count falha', async () => {
      const userId = 'user-123';
      const filters = {
        page: 1,
        limit: 10,
        search: undefined,
        completed: undefined,
        priority: undefined,
        projectId: undefined,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };

      mockTaskFindMany.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(taskService.listTasks(userId, filters))
        .rejects.toThrow('Erro ao listar tarefas');
    });
  });

  describe('getTaskById', () => {
    test('deve retornar tarefa quando encontrada', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';

      const mockTask = {
        id: taskId,
        title: 'Minha Tarefa',
        completed: false,
        projectId: 'project-123',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-123',
          name: 'Meu Projeto',
          color: null,
        },
      };

      mockTaskFindFirst.mockResolvedValue(mockTask);

      const result = await taskService.getTaskById(userId, taskId);

      expect(result).toEqual(mockTask);
    });

    test('deve lançar erro quando tarefa não é encontrada', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';

      mockTaskFindFirst.mockResolvedValue(null);

      await expect(taskService.getTaskById(userId, taskId))
        .rejects.toThrow('TASK_NOT_FOUND');
    });

    test('deve lançar erro quando prisma.findFirst falha', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';

      mockTaskFindFirst.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(taskService.getTaskById(userId, taskId))
        .rejects.toThrow('Erro ao buscar tarefa');
    });
  });

  describe('updateTask', () => {
    test('deve atualizar tarefa com sucesso', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';
      const data = {
        title: 'Tarefa Atualizada',
        completed: true,
      };

      const existingTask = {
        id: taskId,
        title: 'Minha Tarefa',
        completed: false,
        projectId: 'project-123',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-123',
          name: 'Meu Projeto',
          color: null,
        },
      };

      const updatedTask = {
        ...existingTask,
        ...data,
        updatedAt: new Date(),
      };

      mockTaskFindFirst.mockResolvedValue(existingTask);
      mockTaskUpdate.mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(userId, taskId, data);

      expect(result).toEqual(updatedTask);
    });

    test('deve verificar projeto quando projectId é alterado', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';
      const data = {
        projectId: 'project-456',
      };

      const existingTask = {
        id: taskId,
        title: 'Minha Tarefa',
        completed: false,
        projectId: 'project-123',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-123',
          name: 'Meu Projeto',
          color: null,
        },
      };

      const newProject = {
        id: 'project-456',
        name: 'Novo Projeto',
        userId,
      };

      const updatedTask = {
        ...existingTask,
        ...data,
        updatedAt: new Date(),
      };

      mockTaskFindFirst.mockResolvedValue(existingTask);
      mockProjectFindFirst.mockResolvedValue(newProject);
      mockTaskUpdate.mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(userId, taskId, data);

      expect(mockProjectFindFirst).toHaveBeenCalledWith({
        where: {
          id: 'project-456',
          userId,
        },
      });
      expect(result).toEqual(updatedTask);
    });

    test('deve lançar erro quando novo projeto não é encontrado', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';
      const data = {
        projectId: 'project-invalid',
      };

      const existingTask = {
        id: taskId,
        title: 'Minha Tarefa',
        completed: false,
        projectId: 'project-123',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-123',
          name: 'Meu Projeto',
          color: null,
        },
      };

      mockTaskFindFirst.mockResolvedValue(existingTask);
      mockProjectFindFirst.mockResolvedValue(null);

      await expect(taskService.updateTask(userId, taskId, data))
        .rejects.toThrow('PROJECT_NOT_FOUND');
    });

    test('deve lançar erro quando prisma.update falha', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';
      const data = {
        title: 'Tarefa Atualizada',
      };

      const existingTask = {
        id: taskId,
        title: 'Minha Tarefa',
        completed: false,
        projectId: 'project-123',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-123',
          name: 'Meu Projeto',
          color: null,
        },
      };

      mockTaskFindFirst.mockResolvedValue(existingTask);
      mockTaskUpdate.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(taskService.updateTask(userId, taskId, data))
        .rejects.toThrow('Erro ao atualizar tarefa');
    });
  });

  describe('deleteTask', () => {
    test('deve deletar tarefa com sucesso', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';

      const existingTask = {
        id: taskId,
        title: 'Minha Tarefa',
        completed: false,
        projectId: 'project-123',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-123',
          name: 'Meu Projeto',
          color: null,
        },
      };

      mockTaskFindFirst.mockResolvedValue(existingTask);
      mockTaskDelete.mockResolvedValue(existingTask);

      const result = await taskService.deleteTask(userId, taskId);

      expect(result).toEqual({ message: 'Tarefa deletada com sucesso' });
    });

    test('deve lançar erro quando prisma.delete falha', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';

      const existingTask = {
        id: taskId,
        title: 'Minha Tarefa',
        completed: false,
        projectId: 'project-123',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-123',
          name: 'Meu Projeto',
          color: null,
        },
      };

      mockTaskFindFirst.mockResolvedValue(existingTask);
      mockTaskDelete.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(taskService.deleteTask(userId, taskId))
        .rejects.toThrow('Erro ao deletar tarefa');
    });
  });
});

