import { Request, Response } from 'express';

const mockCreateTask = jest.fn();
const mockListTasks = jest.fn();
const mockGetTaskById = jest.fn();
const mockUpdateTask = jest.fn();
const mockDeleteTask = jest.fn();

import { TaskController } from '../../controllers/task.controller';

jest.mock('../../services/task/task.service', () => {
  return {
    TaskService: jest.fn().mockImplementation(() => {
      return {
        createTask: mockCreateTask,
        listTasks: mockListTasks,
        getTaskById: mockGetTaskById,
        updateTask: mockUpdateTask,
        deleteTask: mockDeleteTask,
      };
    })
  };
});

describe('TaskController', () => {
  let taskController: TaskController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    taskController = new TaskController();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('create', () => {
    test('deve retornar 201 quando tarefa é criada com sucesso', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        body: {
          title: 'Minha Tarefa',
          description: 'Descrição da tarefa',
          projectId: 'project-123',
          priority: 'HIGH'
        }
      };

      const mockTask = {
        id: 'task-123',
        title: 'Minha Tarefa',
        description: 'Descrição da tarefa',
        completed: false,
        priority: 'HIGH',
        projectId: 'project-123',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-123',
          name: 'Meu Projeto',
          color: '#FF5733'
        }
      };

      mockCreateTask.mockResolvedValue(mockTask);

      await taskController.create(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Tarefa criada com sucesso',
        task: mockTask
      });
    });

    test('deve retornar 401 quando token é inválido', async () => {
      mockReq = {
        body: {
          title: 'Minha Tarefa',
          projectId: 'project-123'
        }
      };

      await taskController.create(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    });

    test('deve retornar 404 quando projeto não é encontrado', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        body: {
          title: 'Minha Tarefa',
          projectId: 'project-invalid'
        }
      };

      mockCreateTask.mockRejectedValue(new Error('PROJECT_NOT_FOUND'));

      await taskController.create(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Projeto não encontrado',
        code: 'PROJECT_NOT_FOUND'
      });
    });

    test('deve retornar 500 quando ocorre erro interno', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        body: {
          title: 'Minha Tarefa',
          projectId: 'project-123'
        }
      };

      mockCreateTask.mockRejectedValue(new Error('Erro interno do servidor'));

      await taskController.create(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('list', () => {
    test('deve retornar 200 com lista de tarefas', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        query: {
          page: '1',
          limit: '10'
        }
      };

      const mockResult = {
        tasks: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };

      mockListTasks.mockResolvedValue(mockResult);

      await taskController.list(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    test('deve retornar 401 quando token é inválido', async () => {
      mockReq = {
        query: {
          page: '1',
          limit: '10'
        }
      };

      await taskController.list(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    });

    test('deve retornar 404 quando projeto não é encontrado', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        query: {
          page: '1',
          limit: '10',
          projectId: 'project-invalid'
        }
      };

      mockListTasks.mockRejectedValue(new Error('PROJECT_NOT_FOUND'));

      await taskController.list(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Projeto não encontrado',
        code: 'PROJECT_NOT_FOUND'
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

      mockListTasks.mockRejectedValue(new Error('Erro interno do servidor'));

      await taskController.list(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('getById', () => {
    test('deve retornar 200 quando tarefa é encontrada', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'task-123' }
      };

      const mockTask = {
        id: 'task-123',
        title: 'Minha Tarefa',
        completed: false,
        projectId: 'project-123',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-123',
          name: 'Meu Projeto',
          color: '#FF5733'
        }
      };

      mockGetTaskById.mockResolvedValue(mockTask);

      await taskController.getById(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({ task: mockTask });
    });

    test('deve retornar 401 quando token é inválido', async () => {
      mockReq = {
        params: { id: 'task-123' }
      };

      await taskController.getById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    });

    test('deve retornar 404 quando tarefa não é encontrada', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'task-123' }
      };

      mockGetTaskById.mockRejectedValue(new Error('TASK_NOT_FOUND'));

      await taskController.getById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Tarefa não encontrada',
        code: 'TASK_NOT_FOUND'
      });
    });

    test('deve retornar 500 quando ocorre erro interno', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'task-123' }
      };

      mockGetTaskById.mockRejectedValue(new Error('Erro interno do servidor'));

      await taskController.getById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('update', () => {
    test('deve retornar 200 quando tarefa é atualizada com sucesso', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'task-123' },
        body: {
          title: 'Tarefa Atualizada',
          completed: true
        }
      };

      const mockTask = {
        id: 'task-123',
        title: 'Tarefa Atualizada',
        completed: true,
        projectId: 'project-123',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-123',
          name: 'Meu Projeto',
          color: '#FF5733'
        }
      };

      mockUpdateTask.mockResolvedValue(mockTask);

      await taskController.update(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({
        message: 'Tarefa atualizada com sucesso',
        task: mockTask
      });
    });

    test('deve retornar 401 quando token é inválido', async () => {
      mockReq = {
        params: { id: 'task-123' },
        body: {
          title: 'Tarefa Atualizada'
        }
      };

      await taskController.update(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    });

    test('deve retornar 404 quando tarefa não é encontrada', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'task-123' },
        body: {
          title: 'Tarefa Atualizada'
        }
      };

      mockUpdateTask.mockRejectedValue(new Error('TASK_NOT_FOUND'));

      await taskController.update(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Tarefa não encontrada',
        code: 'TASK_NOT_FOUND'
      });
    });

    test('deve retornar 404 quando projeto não é encontrado', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'task-123' },
        body: {
          projectId: 'project-invalid'
        }
      };

      mockUpdateTask.mockRejectedValue(new Error('PROJECT_NOT_FOUND'));

      await taskController.update(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Projeto não encontrado',
        code: 'PROJECT_NOT_FOUND'
      });
    });

    test('deve retornar 500 quando ocorre erro interno', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'task-123' },
        body: {
          title: 'Tarefa Atualizada'
        }
      };

      mockUpdateTask.mockRejectedValue(new Error('Erro interno do servidor'));

      await taskController.update(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('delete', () => {
    test('deve retornar 200 quando tarefa é deletada com sucesso', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'task-123' }
      };

      const mockResult = { message: 'Tarefa deletada com sucesso' };

      mockDeleteTask.mockResolvedValue(mockResult);

      await taskController.delete(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    test('deve retornar 401 quando token é inválido', async () => {
      mockReq = {
        params: { id: 'task-123' }
      };

      await taskController.delete(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    });

    test('deve retornar 404 quando tarefa não é encontrada', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'task-123' }
      };

      mockDeleteTask.mockRejectedValue(new Error('TASK_NOT_FOUND'));

      await taskController.delete(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Tarefa não encontrada',
        code: 'TASK_NOT_FOUND'
      });
    });

    test('deve retornar 500 quando ocorre erro interno', async () => {
      mockReq = {
        user: { userId: 'user-123', email: 'test@email.com', role: 'FREE' },
        params: { id: 'task-123' }
      };

      mockDeleteTask.mockRejectedValue(new Error('Erro interno do servidor'));

      await taskController.delete(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });
});

