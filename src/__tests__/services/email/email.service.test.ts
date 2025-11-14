describe('EmailService - validações de configuração', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('deve lançar erro quando RESEND_API_KEY não está configurada', () => {
    jest.doMock('../../../config/env', () => ({
      envs: {
        server: {
          port: 4000,
          host: 'http://localhost:3000'
        },
        auth: {
          jwtSecret: 'your-secret-key-change-in-production'
        },
        database: {
          url: 'test-database-url'
        },
        resend: {
          apiKey: '   ',
          sender: 'test@focototal.com'
        }
      }
    }));

    jest.doMock('resend', () => ({
      Resend: jest.fn()
    }));

    const { EmailService } = require('../../../services/email/email.service');

    expect(() => new EmailService()).toThrow(
      'Resend API key não configurada. Defina RESEND_API_KEY no arquivo .env.'
    );
  });

  test('deve retornar erro ao tentar enviar email quando remetente não está configurado', async () => {
    const mockSend = jest.fn();

    jest.doMock('../../../config/env', () => ({
      envs: {
        server: {
          port: 4000,
          host: 'http://localhost:3000'
        },
        auth: {
          jwtSecret: 'your-secret-key-change-in-production'
        },
        database: {
          url: 'test-database-url'
        },
        resend: {
          apiKey: 'test-api-key',
          sender: '   '
        }
      }
    }));

    jest.doMock('resend', () => ({
      Resend: jest.fn().mockImplementation(() => ({
        emails: {
          send: mockSend
        }
      }))
    }));

    const { EmailService } = require('../../../services/email/email.service');
    const emailService = new EmailService();

    const resultado = await emailService.enviarEmailBoasVindas('Usuário Teste', 'teste@email.com');

    expect(resultado).toEqual({
      success: false,
      message: 'Não foi possível enviar o email de boas-vindas'
    });
    expect(mockSend).not.toHaveBeenCalled();
  });
});

