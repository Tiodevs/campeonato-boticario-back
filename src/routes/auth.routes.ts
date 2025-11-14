import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schemas';
import { authenticateToken } from '../middlewares/auth.middleware';
import { loginRateLimiter, loginEmailRateLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();
const authController = new AuthController();

// Rota para autenticação (login) com rate limiting
router.post('/login', 
    loginRateLimiter, // Rate limiting por IP
    loginEmailRateLimiter, // Rate limiting por email
    validate(loginSchema), 
    authController.login
);

// Rota para criar um novo usuário (registro) - pública
router.post('/registro', validate(registerSchema), authController.register);

// Rotas para recuperação de senha - públicas
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// Rota para redefinir senha
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Rota para obter dados do usuário atual - protegida
router.get('/me', authenticateToken, authController.me);

export default router; 