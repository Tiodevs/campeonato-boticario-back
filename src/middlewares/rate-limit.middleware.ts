import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { envs } from '../config/env';

/**
 * Rate limiter base para tentativas de login por IP
 * Limita tentativas por endereço IP (configurável via variáveis de ambiente)
 */
export const loginRateLimiter = rateLimit({
    windowMs: envs.rateLimit.login.windowMs, // Configurável (padrão: 15 minutos)
    max: envs.rateLimit.login.maxAttemptsPerIP, // Configurável (padrão: 5 tentativas por IP)
    // Função para obter o identificador único (IP do cliente)
    keyGenerator: (req: Request): string => {
        // Tenta obter o IP real mesmo atrás de um proxy/load balancer
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded 
            ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim())
            : req.ip || req.socket.remoteAddress || 'unknown';
        return ip;
    },
    // Handler customizado para quando o limite é excedido
    handler: (req: Request, res: Response) => {
        const retryAfterMinutes = Math.ceil(envs.rateLimit.login.windowMs / 60000);
        res.status(429).json({
            error: `Muitas tentativas de login. Por favor, tente novamente em ${retryAfterMinutes} minutos.`,
            code: 'TOO_MANY_LOGIN_ATTEMPTS',
            retryAfter: `${retryAfterMinutes} minutos`
        });
    },
    // Pula o rate limiting se a requisição for bem-sucedida (login válido)
    skipSuccessfulRequests: false, // Não pular - queremos contar todas as tentativas
});

/**
 * Store em memória para rastrear tentativas de login por email
 * Em produção, considere usar Redis para persistência e escalabilidade
 */
interface EmailAttempt {
    count: number;
    resetTime: number;
}

const emailAttemptsStore = new Map<string, EmailAttempt>();

/**
 * Limpa tentativas expiradas do store de email
 * Executa a cada 5 minutos
 */
setInterval(() => {
    const now = Date.now();
    for (const [email, attempt] of emailAttemptsStore.entries()) {
        if (attempt.resetTime < now) {
            emailAttemptsStore.delete(email);
        }
    }
}, 5 * 60 * 1000); // Limpa a cada 5 minutos

/**
 * Middleware para limitar tentativas de login por email
 * Limita tentativas por email (configurável via variáveis de ambiente)
 */
export const loginEmailRateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const email = req.body?.email?.toLowerCase()?.trim();
    
    // Se não houver email na requisição, passa adiante (será validado pelo schema)
    if (!email) {
        return next();
    }

    const now = Date.now();
    const windowMs = envs.rateLimit.login.emailWindowMs; // Configurável (padrão: 1 hora)
    const maxAttempts = envs.rateLimit.login.maxAttemptsPerEmail; // Configurável (padrão: 3 tentativas por email)

    const attempt = emailAttemptsStore.get(email);

    if (!attempt) {
        // Primeira tentativa para este email
        emailAttemptsStore.set(email, {
            count: 1,
            resetTime: now + windowMs
        });
        return next();
    }

    // Verifica se a janela de tempo expirou
    if (attempt.resetTime < now) {
        // Reset do contador
        emailAttemptsStore.set(email, {
            count: 1,
            resetTime: now + windowMs
        });
        return next();
    }

    // Verifica se excedeu o limite
    if (attempt.count >= maxAttempts) {
        const remainingTime = Math.ceil((attempt.resetTime - now) / 1000 / 60); // minutos restantes
        return res.status(429).json({
            error: `Muitas tentativas de login para este email. Por favor, tente novamente em ${remainingTime} minutos.`,
            code: 'TOO_MANY_LOGIN_ATTEMPTS_EMAIL',
            retryAfter: `${remainingTime} minutos`
        });
    }

    // Incrementa o contador
    attempt.count++;
    emailAttemptsStore.set(email, attempt);
    next();
};

/**
 * Função para resetar tentativas de login por email (útil após login bem-sucedido)
 */
export const resetEmailLoginAttempts = (email: string) => {
    const normalizedEmail = email?.toLowerCase()?.trim();
    if (normalizedEmail) {
        emailAttemptsStore.delete(normalizedEmail);
    }
};

