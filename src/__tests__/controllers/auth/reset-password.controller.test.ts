import { Request, Response } from 'express';

const mockResetPassword = jest.fn();

import { AuthController } from '../../../controllers/auth.controller';

jest.mock('../../../services/auth/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => {
      return {
        resetPassword: mockResetPassword
      };
    })
  };
});

describe('ResetPasswordController', () => {
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
      json: mockJson,
    };
  });

  test('deve retornar 200 quando senha é redefinida com sucesso', async () => {
    mockReq = {
      body: {
        token: 'token-valido-123',
        novaSenha: 'NovaSenha123'
      }
    };

    const resultado = {
      message: 'Senha redefinida com sucesso',
      userId: 'user-123'
    };

    mockResetPassword.mockResolvedValue(resultado);

    await authController.resetPassword(mockReq as Request, mockRes as Response);

    expect(mockJson).toHaveBeenCalledWith(resultado);
    expect(mockResetPassword).toHaveBeenCalledWith('token-valido-123', 'NovaSenha123');
  });

  test('deve retornar 400 quando token é inválido', async () => {
    mockReq = {
      body: {
        token: 'token-invalido',
        novaSenha: 'NovaSenha123'
      }
    };

    mockResetPassword.mockRejectedValue(new Error('TOKEN_INVALIDO'));

    await authController.resetPassword(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  });

  test('deve retornar 400 quando token já foi usado', async () => {
    mockReq = {
      body: {
        token: 'token-usado',
        novaSenha: 'NovaSenha123'
      }
    };

    mockResetPassword.mockRejectedValue(new Error('TOKEN_JA_USADO'));

    await authController.resetPassword(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Este token já foi utilizado. Por favor, solicite um novo token de recuperação.',
      code: 'TOKEN_ALREADY_USED'
    });
  });

  test('deve retornar 400 quando token expirou', async () => {
    mockReq = {
      body: {
        token: 'token-expirado',
        novaSenha: 'NovaSenha123'
      }
    };

    mockResetPassword.mockRejectedValue(new Error('TOKEN_EXPIRADO'));

    await authController.resetPassword(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Este token expirou. Por favor, solicite um novo token de recuperação.',
      code: 'TOKEN_EXPIRED'
    });
  });

  test('deve retornar 500 quando ocorre erro interno', async () => {
    mockReq = {
      body: {
        token: 'token-valido-123',
        novaSenha: 'NovaSenha123'
      }
    };

    mockResetPassword.mockRejectedValue(new Error('Erro interno do servidor'));

    await authController.resetPassword(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  });

}); 