import { OpenAPIV3 } from 'openapi-types';
import { envs } from '../config/env';

const defaultServerUrl = envs.api.baseUrl;

export const swaggerDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Foco Total - API',
    version: '1.0.0',
    description:
      'Documentação da API do Foco Total para gerenciamento de tarefas, autenticação de usuários e operações relacionadas.',
    contact: {
      name: 'Time Backend - Foco Total',
      email: 'backend@focototal.com'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: defaultServerUrl,
      description: 'Servidor de desenvolvimento'
    }
  ],
  tags: [
    {
      name: 'Status',
      description: 'Rotas de monitoramento e informações gerais da API'
    },
    {
      name: 'Auth',
      description: 'Endpoints de autenticação, cadastro e gerenciamento de credenciais'
    },
    {
      name: 'Projects',
      description: 'Endpoints para gerenciamento de projetos'
    },
    {
      name: 'Tasks',
      description: 'Endpoints para gerenciamento de tarefas'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Informe o token JWT no formato `Bearer {token}`'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Mensagem resumida do erro'
          },
          code: {
            type: 'string',
            description: 'Código interno para identificação do erro'
          }
        },
        required: ['error', 'code']
      } as OpenAPIV3.SchemaObject,
      ValidationErrorDetail: {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            description: 'Campo que apresentou erro de validação'
          },
          message: {
            type: 'string',
            description: 'Descrição detalhada do erro'
          }
        },
        required: ['field', 'message']
      } as OpenAPIV3.SchemaObject,
      ValidationErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              details: {
                type: 'array',
                items: { $ref: '#/components/schemas/ValidationErrorDetail' }
              }
            },
            required: ['details']
          }
        ]
      } as OpenAPIV3.SchemaObject,
      MessageResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Mensagem descritiva sobre o resultado da operação'
          }
        },
        required: ['message']
      } as OpenAPIV3.SchemaObject,
      AuthenticatedUser: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Identificador do usuário'
          },
          nome: {
            type: 'string',
            nullable: true,
            description: 'Nome completo do usuário'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email do usuário autenticado'
          },
          role: {
            type: 'string',
            enum: ['ADMIN', 'FREE', 'PRO'],
            description: 'Perfil de acesso do usuário'
          }
        },
        required: ['id', 'email', 'role']
      } as OpenAPIV3.SchemaObject,
      AuthResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'Token JWT gerado para o usuário autenticado'
          },
          user: {
            $ref: '#/components/schemas/AuthenticatedUser'
          }
        },
        required: ['token', 'user']
      } as OpenAPIV3.SchemaObject,
      RegisteredUser: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          email: {
            type: 'string',
            format: 'email'
          },
          username: {
            type: 'string'
          },
          name: {
            type: 'string',
            nullable: true
          },
          role: {
            type: 'string',
            enum: ['ADMIN', 'FREE', 'PRO']
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedBy: {
            type: 'string',
            nullable: true
          }
        },
        required: ['id', 'email', 'username', 'role', 'createdAt', 'updatedAt']
      } as OpenAPIV3.SchemaObject,
      RegisterResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Usuário criado com sucesso'
          },
          user: {
            $ref: '#/components/schemas/RegisteredUser'
          }
        },
        required: ['message', 'user']
      } as OpenAPIV3.SchemaObject,
      LoginRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'usuario@focototal.com'
          },
          senha: {
            type: 'string',
            minLength: 8,
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$',
            description: 'Senha com no mínimo 8 caracteres',
            example: 'SenhaForte123'
          }
        },
        required: ['email', 'senha']
      } as OpenAPIV3.SchemaObject,
      RegisterRequest: {
        type: 'object',
        properties: {
          nome: {
            type: 'string',
            example: 'Maria Silva'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'maria@focototal.com'
          },
          senha: {
            type: 'string',
            minLength: 8,
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$',
            description: 'Senha com no mínimo 8 caracteres, contendo pelo menos uma letra maiúscula, uma minúscula e um número',
            example: 'SenhaForte123'
          },
          role: {
            type: 'string',
            enum: ['ADMIN', 'FREE', 'PRO'],
            default: 'FREE',
            example: 'FREE'
          }
        },
        required: ['nome', 'email', 'senha']
      } as OpenAPIV3.SchemaObject,
      ForgotPasswordRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'usuario@focototal.com'
          }
        },
        required: ['email']
      } as OpenAPIV3.SchemaObject,
      ResetPasswordRequest: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'Token de recuperação de senha enviado por email. O token expira em 1 hora e só pode ser usado uma vez.',
            example: 'ab12cd34ef56'
          },
          novaSenha: {
            type: 'string',
            minLength: 8,
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$',
            description: 'Nova senha com no mínimo 8 caracteres, contendo pelo menos uma letra maiúscula, uma minúscula e um número',
            example: 'NovaSenhaSegura789'
          }
        },
        required: ['token', 'novaSenha']
      } as OpenAPIV3.SchemaObject,
      MeResponse: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid'
              },
              name: {
                type: 'string',
                nullable: true
              },
              email: {
                type: 'string',
                format: 'email'
              },
              role: {
                type: 'string',
                enum: ['ADMIN', 'FREE', 'PRO']
              },
              createdAt: {
                type: 'string',
                format: 'date-time'
              }
            },
            required: ['id', 'email', 'role', 'createdAt']
          }
        },
        required: ['user']
      } as OpenAPIV3.SchemaObject,
      RootResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          version: { type: 'string' },
          description: { type: 'string' },
          endpoints: {
            type: 'object',
            additionalProperties: { type: 'string' }
          }
        },
        required: ['message', 'version', 'description', 'endpoints']
      } as OpenAPIV3.SchemaObject,
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'ok'
          }
        },
        required: ['status']
      } as OpenAPIV3.SchemaObject,
      Project: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          name: {
            type: 'string',
            example: 'Meu Projeto'
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Descrição do projeto'
          },
          color: {
            type: 'string',
            nullable: true,
            example: '#FF5733'
          },
          userId: {
            type: 'string',
            format: 'uuid'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          },
          _count: {
            type: 'object',
            properties: {
              tasks: {
                type: 'number'
              }
            }
          }
        },
        required: ['id', 'name', 'userId', 'createdAt', 'updatedAt']
      } as OpenAPIV3.SchemaObject,
      CreateProjectRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'Meu Projeto'
          },
          description: {
            type: 'string',
            maxLength: 500,
            nullable: true,
            example: 'Descrição do projeto'
          },
          color: {
            type: 'string',
            pattern: '^#[0-9A-F]{6}$',
            nullable: true,
            example: '#FF5733'
          }
        },
        required: ['name']
      } as OpenAPIV3.SchemaObject,
      UpdateProjectRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'Meu Projeto Atualizado'
          },
          description: {
            type: 'string',
            maxLength: 500,
            nullable: true,
            example: 'Nova descrição'
          },
          color: {
            type: 'string',
            pattern: '^#[0-9A-F]{6}$',
            nullable: true,
            example: '#33FF57'
          }
        }
      } as OpenAPIV3.SchemaObject,
      ProjectListResponse: {
        type: 'object',
        properties: {
          projects: {
            type: 'array',
            items: { $ref: '#/components/schemas/Project' }
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
              hasNextPage: { type: 'boolean' },
              hasPreviousPage: { type: 'boolean' }
            }
          }
        },
        required: ['projects', 'pagination']
      } as OpenAPIV3.SchemaObject,
      Task: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          title: {
            type: 'string',
            example: 'Minha Tarefa'
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Descrição da tarefa'
          },
          completed: {
            type: 'boolean',
            default: false
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            nullable: true
          },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            default: 'MEDIUM'
          },
          projectId: {
            type: 'string',
            format: 'uuid'
          },
          userId: {
            type: 'string',
            format: 'uuid'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          },
          project: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              color: { type: 'string', nullable: true }
            }
          }
        },
        required: ['id', 'title', 'completed', 'projectId', 'userId', 'createdAt', 'updatedAt']
      } as OpenAPIV3.SchemaObject,
      CreateTaskRequest: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 2,
            maxLength: 200,
            example: 'Minha Tarefa'
          },
          description: {
            type: 'string',
            maxLength: 1000,
            nullable: true,
            example: 'Descrição da tarefa'
          },
          completed: {
            type: 'boolean',
            default: false
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2024-12-31T23:59:59Z'
          },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            default: 'MEDIUM'
          },
          projectId: {
            type: 'string',
            format: 'uuid',
            example: 'clx1234567890'
          }
        },
        required: ['title', 'projectId']
      } as OpenAPIV3.SchemaObject,
      UpdateTaskRequest: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 2,
            maxLength: 200,
            example: 'Tarefa Atualizada'
          },
          description: {
            type: 'string',
            maxLength: 1000,
            nullable: true
          },
          completed: {
            type: 'boolean'
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            nullable: true
          },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH']
          },
          projectId: {
            type: 'string',
            format: 'uuid'
          }
        }
      } as OpenAPIV3.SchemaObject,
      TaskListResponse: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            items: { $ref: '#/components/schemas/Task' }
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
              hasNextPage: { type: 'boolean' },
              hasPreviousPage: { type: 'boolean' }
            }
          }
        },
        required: ['tasks', 'pagination']
      } as OpenAPIV3.SchemaObject
    }
  },
  paths: {
    '/': {
      get: {
        tags: ['Status'],
        summary: 'Informações iniciais da API',
        description: 'Retorna detalhes sobre a API e endpoints principais.',
        responses: {
          200: {
            description: 'Informações retornadas com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RootResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/health': {
      get: {
        tags: ['Status'],
        summary: 'Health check',
        description: 'Verifica a disponibilidade da API.',
        responses: {
          200: {
            description: 'API saudável',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autenticar usuário',
        description: 'Realiza login com email e senha, retornando token JWT e dados do usuário.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Autenticação realizada com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse'
                }
              }
            }
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse'
                }
              }
            }
          },
          401: {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ErrorResponse' }
                  ],
                  example: {
                    error: 'Email ou senha incorretos',
                    code: 'INVALID_CREDENTIALS'
                  }
                }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/registro': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar novo usuário',
        description: 'Cria um novo usuário com as credenciais fornecidas.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Usuário criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisterResponse'
                }
              }
            }
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse'
                }
              }
            }
          },
          409: {
            description: 'Conflito com dados já cadastrados',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ErrorResponse' }
                  ]
                },
                examples: {
                  email: {
                    value: {
                      error: 'Este email já está em uso',
                      code: 'EMAIL_ALREADY_EXISTS'
                    }
                  },
                  username: {
                    value: {
                      error: 'Este nome de usuário já está em uso',
                      code: 'USERNAME_ALREADY_EXISTS'
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Solicitar recuperação de senha',
        description: 'Envia instruções de recuperação de senha para o email informado, caso esteja cadastrado.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ForgotPasswordRequest'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Solicitação processada',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse'
                }
              }
            }
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse'
                }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Redefinir senha com token',
        description: 'Atualiza a senha do usuário a partir de um token válido enviado por email.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ResetPasswordRequest'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Senha redefinida com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse'
                }
              }
            }
          },
          400: {
            description: 'Erro ao redefinir senha - Token inválido, já usado ou expirado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                },
                examples: {
                  invalidToken: {
                    summary: 'Token inválido',
                    value: {
                      error: 'Token inválido',
                      code: 'INVALID_TOKEN'
                    }
                  },
                  tokenAlreadyUsed: {
                    summary: 'Token já foi utilizado',
                    value: {
                      error: 'Este token já foi utilizado. Por favor, solicite um novo token de recuperação.',
                      code: 'TOKEN_ALREADY_USED'
                    }
                  },
                  tokenExpired: {
                    summary: 'Token expirado',
                    value: {
                      error: 'Este token expirou. Por favor, solicite um novo token de recuperação.',
                      code: 'TOKEN_EXPIRED'
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Obter dados do usuário autenticado',
        description: 'Retorna os dados básicos do usuário associado ao token informado.',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Dados retornados com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MeResponse'
                }
              }
            }
          },
          401: {
            description: 'Token ausente, expirado ou inválido',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ErrorResponse' }
                  ]
                },
                examples: {
                  missing: {
                    value: {
                      error: 'Token de acesso não fornecido',
                      code: 'MISSING_TOKEN'
                    }
                  },
                  expired: {
                    value: {
                      error: 'Token expirado',
                      code: 'TOKEN_EXPIRED'
                    }
                  },
                  invalid: {
                    value: {
                      error: 'Token inválido',
                      code: 'INVALID_TOKEN'
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'Usuário não encontrado',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ErrorResponse' }
                  ],
                  example: {
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                  }
                }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/projects': {
      post: {
        tags: ['Projects'],
        summary: 'Criar novo projeto',
        description: 'Cria um novo projeto para o usuário autenticado.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProjectRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Projeto criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    project: { $ref: '#/components/schemas/Project' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
              }
            }
          },
          401: {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      get: {
        tags: ['Projects'],
        summary: 'Listar projetos',
        description: 'Lista projetos do usuário autenticado com paginação, pesquisa e filtros.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1, minimum: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 }
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Buscar por nome do projeto'
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['name', 'createdAt', 'updatedAt'], default: 'createdAt' }
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
          }
        ],
        responses: {
          200: {
            description: 'Lista de projetos retornada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProjectListResponse' }
              }
            }
          },
          401: {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Obter projeto por ID',
        description: 'Retorna os detalhes de um projeto específico.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          200: {
            description: 'Projeto retornado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    project: { $ref: '#/components/schemas/Project' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Projeto não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Projects'],
        summary: 'Atualizar projeto',
        description: 'Atualiza os dados de um projeto existente.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProjectRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Projeto atualizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    project: { $ref: '#/components/schemas/Project' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
              }
            }
          },
          401: {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Projeto não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Projects'],
        summary: 'Deletar projeto',
        description: 'Deleta um projeto e todas as suas tarefas associadas.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          200: {
            description: 'Projeto deletado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' }
              }
            }
          },
          401: {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Projeto não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Criar nova tarefa',
        description: 'Cria uma nova tarefa associada a um projeto.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTaskRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Tarefa criada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    task: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
              }
            }
          },
          401: {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Projeto não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      get: {
        tags: ['Tasks'],
        summary: 'Listar tarefas',
        description: 'Lista tarefas do usuário autenticado com paginação, pesquisa e filtros.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1, minimum: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 }
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Buscar por título da tarefa'
          },
          {
            name: 'completed',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filtrar por status de conclusão'
          },
          {
            name: 'priority',
            in: 'query',
            schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] }
          },
          {
            name: 'projectId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Filtrar por projeto'
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['title', 'createdAt', 'updatedAt', 'dueDate', 'priority'], default: 'createdAt' }
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
          }
        ],
        responses: {
          200: {
            description: 'Lista de tarefas retornada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskListResponse' }
              }
            }
          },
          401: {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Projeto não encontrado (quando filtrado por projectId)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Obter tarefa por ID',
        description: 'Retorna os detalhes de uma tarefa específica.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          200: {
            description: 'Tarefa retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Tarefa não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Tasks'],
        summary: 'Atualizar tarefa',
        description: 'Atualiza os dados de uma tarefa existente.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTaskRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Tarefa atualizada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    task: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
              }
            }
          },
          401: {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Tarefa ou projeto não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Deletar tarefa',
        description: 'Deleta uma tarefa específica.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          200: {
            description: 'Tarefa deletada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' }
              }
            }
          },
          401: {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Tarefa não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    }
  }
};

export const swaggerUiOptions = {
  customSiteTitle: 'Foco Total - Documentação da API',
  explorer: true
};

