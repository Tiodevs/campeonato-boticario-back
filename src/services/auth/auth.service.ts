import jwt from 'jsonwebtoken';
import { compare, hash } from "bcryptjs";
import prisma from '../../prisma/client';
import { EmailService } from '../email/email.service';
import { envs } from '../../config/env';
import crypto from 'crypto';
import { Role } from '../../schemas/auth.schemas';

export class AuthService {

    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    // Realizar login
    async login(email: string, senha: string) {
        try {

            // Busca o usuário pelo email
            const usuario = await prisma.user.findUnique({
                where: { email }
            });

            if (!usuario) {
                throw new Error("Email ou senha incorretos");
            }

            // Ele faz a verificação se a senha criptografada é a mesma enviada pelo user 
            const passwordMatch = await compare(senha, usuario.password);

            if (!passwordMatch) {
                throw new Error("Email ou senha incorretos");
            }

            // Cria o token JWT
            const token = jwt.sign(
                {
                    userId: usuario.id,
                    email: usuario.email,
                    role: usuario.role
                },
                envs.auth.jwtSecret,
                { expiresIn: '10d' }
            );

            if (!token) {
                throw new Error('Erro ao gerar token');
            }

            // Retorna o token e informações básicas do usuário
            return {
                token,
                user: {
                    id: usuario.id,
                    nome: usuario.name,
                    email: usuario.email,
                    role: usuario.role
                }
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro no processo de login');
        }
    }

    // Criar um novo usuário
    async createUser(username: string, email: string, password: string, role: Role) {
        try {
            // Verifica se já existe usuário com este email
            const usuarioExistente = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: email },
                        { username: username }
                    ]
                }
            });

            if (usuarioExistente) {
                if (usuarioExistente.email === email) {
                    throw new Error('Este email já está em uso.');
                }
                if (usuarioExistente.username === username) {
                    throw new Error('Este nome de usuário já está em uso.');
                }
            }

            // Cria a criptografia da senha
            const hashedPassword = await hash(password, 8);

            // Cria o novo usuário
            const novoUsuario = await prisma.user.create({
                data: {
                    username: username,
                    email,
                    password: hashedPassword,
                    role: role
                }
            });

            const user = await prisma.user.update({
                where: { id: novoUsuario.id },
                data: {
                    updatedBy: novoUsuario.email
                }
            });

            // Envio do email de boas-vindas de forma assíncrona
            this.emailService.enviarEmailBoasVindas(username, email)
                    .then(result => {
                        if (!result.success) {
                            console.warn(`Falha ao enviar email de boas-vindas para ${email}: ${result.message}`);
                        }
                    })
                    .catch(error => {
                        console.error(`Erro ao tentar enviar email de boas-vindas para ${email}:`, error);
                    });

            // Remove a senha antes de retornar
            const { password: _, ...usuarioSemSenha } = user;
            return usuarioSemSenha;

        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao criar usuário');
        }
    }

    // Limpar tokens expirados para um email específico (ou todos)
    private async cleanupExpiredTokens(email?: string) {
        try {
            const whereClause = email
                ? {
                      email: email,
                      OR: [
                          { used: true },
                          { expiresAt: { lt: new Date() } }
                      ]
                  }
                : {
                      OR: [
                          { used: true },
                          { expiresAt: { lt: new Date() } }
                      ]
                  };

            await prisma.passwordReset.deleteMany({
                where: whereClause
            });
        } catch (error) {
            // Não falha o fluxo principal se a limpeza falhar
            console.warn('Erro ao limpar tokens expirados:', error);
        }
    }

    // Solicitar recuperação de senha
    async forgotPassword(email: string) {
        try {

            const usuario = await prisma.user.findUnique({ where: { email } });

            if (!usuario) {
                return { message: 'Se esse email estiver cadastrado, você receberá instruções.' };
            }

            // Invalidar todos os tokens não usados anteriores para este email
            await prisma.passwordReset.updateMany({
                where: {
                    email: usuario.email,
                    used: false
                },
                data: {
                    used: true
                }
            });

            // Limpar tokens expirados deste email
            await this.cleanupExpiredTokens(usuario.email);

            // Gerar token aleatório
            const token = crypto.randomBytes(32).toString('hex');

            // Salvar o token com expiração de 1 hora
            const expiresAt = new Date(Date.now() + 3600000); // 1 hora


            await prisma.passwordReset.create({
                data: {
                    id: crypto.randomUUID(),
                    email: usuario.email,
                    token: token,
                    expiresAt: expiresAt,
                    used: false,
                    createdAt: new Date()
                }
            });

            // Configurar o link de recuperação
            const resetLink = `${envs.server.host}/reset-password?token=${token}`;

            // Enviar email
            const emailResult = await this.emailService.enviarEmailRecuperacaoSenha(usuario.name || '', email, resetLink);
            if (!emailResult.success) {
                console.warn(`Falha ao enviar email de recuperação para ${email}: ${emailResult.message}`);
            }

            return { message: 'Instruções de recuperação enviadas para seu email.' };
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Erro ao processar solicitação de recuperação');
        }
    }

    // Redefinir senha com token
    async resetPassword(token: string, novaSenha: string) {
        try {
            const passwordReset = await prisma.passwordReset.findFirst({
                where: {
                    token: token
                }
            });

            // Se o token não existe
            if (!passwordReset) {
                throw new Error('TOKEN_INVALIDO');
            }

            // Se o token já foi usado
            if (passwordReset.used) {
                throw new Error('TOKEN_JA_USADO');
            }

            // Se o token expirou
            if (passwordReset.expiresAt < new Date()) {
                // Marcar como usado para evitar uso futuro
                await prisma.passwordReset.update({
                    where: { id: passwordReset.id },
                    data: { used: true }
                });
                throw new Error('TOKEN_EXPIRADO');
            }

            // Criptografar nova senha
            const hashedPassword = await hash(novaSenha, 8);

            // Atualizar senha do usuário
            await prisma.user.update({
                where: { email: passwordReset.email },
                data: {
                    password: hashedPassword,
                    updatedBy: passwordReset.email
                }
            });

            // Marcar token como usado
            await prisma.passwordReset.update({
                where: { id: passwordReset.id },
                data: { used: true }
            });

            // Limpar tokens expirados deste email
            await this.cleanupExpiredTokens(passwordReset.email);

            return { message: 'Senha atualizada com sucesso' };
        } catch (error) {
            if (error instanceof Error) {
                // Propagar erros específicos
                throw error;
            }
            throw new Error('Erro ao redefinir senha');
        }
    }

    // Obter dados do usuário por ID
    async getUserById(userId: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            });

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            return user;
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao buscar dados do usuário');
        }
    }
}