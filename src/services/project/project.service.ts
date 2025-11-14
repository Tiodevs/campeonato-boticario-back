import prisma from '../../prisma/client';
import { CreateProjectInput, UpdateProjectInput, ListProjectsInput } from '../../schemas/project.schemas';

export class ProjectService {
  // Criar novo projeto
  async createProject(userId: string, data: CreateProjectInput) {
    try {
      const project = await prisma.project.create({
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

      return project;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw new Error('Erro ao criar projeto');
    }
  }

  // Listar projetos com paginação, pesquisa e filtros
  async listProjects(userId: string, filters: ListProjectsInput) {
    try {
      const { page, limit, search, sortBy, sortOrder } = filters;
      const skip = (page - 1) * limit;

      // Construir condições de busca
      const where: any = {
        userId,
      };

      // Adicionar pesquisa por nome
      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      // Executar query com contagem total
      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
          include: {
            _count: {
              select: {
                tasks: true,
              },
            },
          },
        }),
        prisma.project.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        projects,
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
      console.error('Erro ao listar projetos:', error);
      throw new Error('Erro ao listar projetos');
    }
  }

  // Obter projeto por ID
  async getProjectById(userId: string, projectId: string) {
    try {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
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

      if (!project) {
        throw new Error('PROJECT_NOT_FOUND');
      }

      return project;
    } catch (error) {
      if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
        throw error;
      }
      console.error('Erro ao buscar projeto:', error);
      throw new Error('Erro ao buscar projeto');
    }
  }

  // Atualizar projeto
  async updateProject(userId: string, projectId: string, data: UpdateProjectInput) {
    try {
      // Verificar se o projeto existe e pertence ao usuário
      const existingProject = await this.getProjectById(userId, projectId);

      // Atualizar projeto
      const project = await prisma.project.update({
        where: {
          id: projectId,
        },
        data: {
          ...data,
        },
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      return project;
    } catch (error) {
      if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
        throw error;
      }
      console.error('Erro ao atualizar projeto:', error);
      throw new Error('Erro ao atualizar projeto');
    }
  }

  // Deletar projeto
  async deleteProject(userId: string, projectId: string) {
    try {
      // Verificar se o projeto existe e pertence ao usuário
      await this.getProjectById(userId, projectId);

      // Deletar projeto (as tarefas serão deletadas em cascade)
      await prisma.project.delete({
        where: {
          id: projectId,
        },
      });

      return { message: 'Projeto deletado com sucesso' };
    } catch (error) {
      if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
        throw error;
      }
      console.error('Erro ao deletar projeto:', error);
      throw new Error('Erro ao deletar projeto');
    }
  }
}

