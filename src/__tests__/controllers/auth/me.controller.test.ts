import { Request, Response } from 'express';
const mockGetUserById = jest.fn();

import { AuthController } from '../../../controllers/auth.controller';

jest.mock('../../../services/auth/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({
      getUserById: mockGetUserById
    }))
  };
});

describe('MeController', () => {
  let authController: AuthController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    authController = new AuthController();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRes = {
      status: mockStatus,
      json: mockJson
    };
  });

  test('deve retornar dados do usuário quando userId está presente', async () => {
    const userId = 'user-123';
    const usuario = {
      id: userId,
      name: 'Usuário Teste',
      email: 'teste@email.com',
      role: 'FREE',
      createdAt: new Date()
    };

    mockReq = {
      user: {
        userId
      }
    } as any;

    mockGetUserById.mockResolvedValue(usuario);

    await authController.me(mockReq as Request, mockRes as Response);

    expect(mockGetUserById).toHaveBeenCalledWith(userId);
    expect(mockJson).toHaveBeenCalledWith({ user: usuario });
    expect(mockStatus).not.toHaveBeenCalled();
  });

  test('deve retornar 401 quando userId não está presente', async () => {
    mockReq = {};

    await authController.me(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Token inválido ou expirado',
      code: 'INVALID_TOKEN'
    });
    expect(mockGetUserById).not.toHaveBeenCalled();
  });

  test('deve retornar 404 quando usuário não é encontrado', async () => {
    const userId = 'user-inexistente';

    mockReq = {
      user: {
        userId
      }
    } as any;

    mockGetUserById.mockRejectedValue(new Error('Usuário não encontrado'));

    await authController.me(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Usuário não encontrado',
      code: 'USER_NOT_FOUND'
    });
  });

  test('deve retornar 500 quando ocorre erro inesperado ao buscar usuário', async () => {
    const userId = 'user-erro';

    mockReq = {
      user: {
        userId
      }
    } as any;

    mockGetUserById.mockRejectedValue(new Error('Erro desconhecido'));

    await authController.me(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  });
});

