import prisma from '../../prisma/client';
import { CreateTaskInput, UpdateTaskInput, ListTasksInput } from '../../schemas/task.schemas';

export class TaskService {
  // Criar nova tarefa
  async createTask(userId: string, data: CreateTaskInput) {
    try {
      // Verificar se o projeto existe e pertence ao usuário
      const project = await prisma.project.findFirst({
        where: {
          id: data.projectId,
          userId,
        },
      });

      if (!project) {
        throw new Error('PROJECT_NOT_FOUND');
      }

      const task = await prisma.task.create({
        data: {
          ...data,
          userId,
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

      return task;
    } catch (error) {
      if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
        throw error;
      }
      console.error('Erro ao criar tarefa:', error);
      throw new Error('Erro ao criar tarefa');
    }
  }

  // Listar tarefas com paginação e pesquisa
  async listTasks(userId: string, filters: ListTasksInput) {
    try {
      const { page, limit, search, completed, priority, projectId, sortBy, sortOrder } = filters;
      const skip = (page - 1) * limit;

      // Construir condições de busca
      const where: any = {
        userId,
      };

      // Adicionar pesquisa por título
      if (search) {
        where.title = {
          contains: search,
          mode: 'insensitive',
        };
      }

      // Adicionar filtro por status de conclusão
      if (completed !== undefined) {
        where.completed = completed;
      }

      // Adicionar filtro por prioridade
      if (priority) {
        where.priority = priority;
      }

      // Adicionar filtro por projeto
      if (projectId) {
        where.projectId = projectId;
        // Verificar se o projeto pertence ao usuário
        const project = await prisma.project.findFirst({
          where: {
            id: projectId,
            userId,
          },
        });

        if (!project) {
          throw new Error('PROJECT_NOT_FOUND');
        }
      }

      // Executar query com contagem total
      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
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
        }),
        prisma.task.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
        throw error;
      }
      console.error('Erro ao listar tarefas:', error);
      throw new Error('Erro ao listar tarefas');
    }
  }

  // Obter tarefa por ID
  async getTaskById(userId: string, taskId: string) {
    try {
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          userId,
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

      if (!task) {
        throw new Error('TASK_NOT_FOUND');
      }

      return task;
    } catch (error) {
      if (error instanceof Error && error.message === 'TASK_NOT_FOUND') {
        throw error;
      }
      console.error('Erro ao buscar tarefa:', error);
      throw new Error('Erro ao buscar tarefa');
    }
  }

  // Atualizar tarefa
  async updateTask(userId: string, taskId: string, data: UpdateTaskInput) {
    try {
      // Verificar se a tarefa existe e pertence ao usuário
      const existingTask = await this.getTaskById(userId, taskId);

      // Se projectId foi fornecido, verificar se o projeto existe e pertence ao usuário
      if (data.projectId && data.projectId !== existingTask.projectId) {
        const project = await prisma.project.findFirst({
          where: {
            id: data.projectId,
            userId,
          },
        });

        if (!project) {
          throw new Error('PROJECT_NOT_FOUND');
        }
      }

      // Atualizar tarefa
      const task = await prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          ...data,
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

      return task;
    } catch (error) {
      if (error instanceof Error && (error.message === 'TASK_NOT_FOUND' || error.message === 'PROJECT_NOT_FOUND')) {
        throw error;
      }
      console.error('Erro ao atualizar tarefa:', error);
      throw new Error('Erro ao atualizar tarefa');
    }
  }

  // Deletar tarefa
  async deleteTask(userId: string, taskId: string) {
    try {
      // Verificar se a tarefa existe e pertence ao usuário
      await this.getTaskById(userId, taskId);

      // Deletar tarefa
      await prisma.task.delete({
        where: {
          id: taskId,
        },
      });

      return { message: 'Tarefa deletada com sucesso' };
    } catch (error) {
      if (error instanceof Error && error.message === 'TASK_NOT_FOUND') {
        throw error;
      }
      console.error('Erro ao deletar tarefa:', error);
      throw new Error('Erro ao deletar tarefa');
    }
  }
}

