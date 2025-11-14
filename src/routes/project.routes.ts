import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { validate, validateQuery } from '../middlewares/validation.middleware';
import { createProjectSchema, updateProjectSchema, listProjectsSchema } from '../schemas/project.schemas';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const projectController = new ProjectController();

// Todas as rotas de projetos requerem autenticação
router.use(authenticateToken);

// Criar novo projeto
router.post(
  '/',
  validate(createProjectSchema),
  projectController.create
);

// Listar projetos com paginação, pesquisa e filtros
router.get(
  '/',
  validateQuery(listProjectsSchema),
  projectController.list
);

// Obter projeto por ID
router.get(
  '/:id',
  projectController.getById
);

// Atualizar projeto
router.put(
  '/:id',
  validate(updateProjectSchema),
  projectController.update
);

// Deletar projeto
router.delete(
  '/:id',
  projectController.delete
);

export default router;

