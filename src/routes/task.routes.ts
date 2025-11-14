import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { validate, validateQuery } from '../middlewares/validation.middleware';
import { createTaskSchema, updateTaskSchema, listTasksSchema } from '../schemas/task.schemas';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const taskController = new TaskController();

// Todas as rotas de tarefas requerem autenticação
router.use(authenticateToken);

// Criar nova tarefa
router.post(
  '/',
  validate(createTaskSchema),
  taskController.create
);

// Listar tarefas com paginação e pesquisa
router.get(
  '/',
  validateQuery(listTasksSchema),
  taskController.list
);

// Obter tarefa por ID
router.get(
  '/:id',
  taskController.getById
);

// Atualizar tarefa
router.put(
  '/:id',
  validate(updateTaskSchema),
  taskController.update
);

// Deletar tarefa
router.delete(
  '/:id',
  taskController.delete
);

export default router;

