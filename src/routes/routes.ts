import { Router, Request, Response } from "express";

// Rotas
import authRoutes from "./auth.routes";

const router = Router();

// Registrar as rotas individuais
router.use('/auth', authRoutes);

// Rota para criação de tarefas
// router.use('/tasks', taskRoutes);

// Rota de health check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok'
  });
});

export default router; 