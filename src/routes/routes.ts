import { Router, Request, Response } from "express";

// Rotas
import authRoutes from "./auth.routes";
import projectRoutes from "./project.routes";
import taskRoutes from "./task.routes";

const router = Router();

// Registrar as rotas individuais
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);

// Rota de health check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok'
  });
});

export default router; 