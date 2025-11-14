import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({ path: resolve(__dirname, '../../.env') });

export const envs = {
    server: {
        port: process.env.PORT || 4000,
        host: process.env.FRONTEND_URL || "http://localhost:3000",
    },
    api: {
        baseUrl: process.env.API_BASE_URL || "http://localhost:4000"
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production"
    },
    database: {
        url: process.env.DATABASE_URL || " "
    },
    resend: {
        apiKey: process.env.RESEND_API_KEY || " ",
        sender: process.env.EMAIL_SENDER || " "
    },
    rateLimit: {
        login: {
            windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos por padrão
            maxAttemptsPerIP: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_IP || '5'), // 5 tentativas por IP
            maxAttemptsPerEmail: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_EMAIL || '3'), // 3 tentativas por email
            emailWindowMs: parseInt(process.env.LOGIN_RATE_LIMIT_EMAIL_WINDOW_MS || '3600000') // 1 hora por padrão
        }
    }
}