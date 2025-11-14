import { EmailService } from '../../../services/email/email.service';

const mockSendEmail = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSendEmail
    }
  }))
}));

jest.mock('../../../config/env', () => ({
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
      sender: 'test@aspasnote.com'
    }
  }
}));

describe('SendWelcomeEmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    jest.clearAllMocks();

    emailService = new EmailService();
  });

  test('deve criar uma instância do EmailService', () => {
    expect(emailService).toBeInstanceOf(EmailService);
  });

  test('deve ter o método enviarEmailBoasVindas', () => {
    expect(typeof emailService.enviarEmailBoasVindas).toBe('function');
  });

  test('deve enviar email de boas-vindas com sucesso', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailBoasVindas('João Silva', 'joao@email.com');

    expect(resultado).toEqual({
      success: true,
      message: 'Email de boas-vindas enviado com sucesso'
    });

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Foco Total <test@aspasnote.com>',
        to: 'joao@email.com',
        subject: 'Bem-vindo à Foco Total!',
        html: expect.stringContaining('João Silva')
      })
    );

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });

  test('deve falhar quando o envio de email retorna erro', async () => {
    const erroSimulado = new Error('Erro de conexão SMTP');
    mockSendEmail.mockRejectedValue(erroSimulado);

    const resultado = await emailService.enviarEmailBoasVindas('João Silva', 'joao@email.com');

    expect(resultado).toEqual({
      success: false,
      message: 'Não foi possível enviar o email de boas-vindas'
    });
  });

  test('deve lidar com nomes com caracteres especiais', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailBoasVindas('José Antônio da Côrte', 'jose@email.com');

    expect(resultado.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('José Antônio da Côrte')
      })
    );
  });

  test('deve lidar com emails com caracteres especiais', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailBoasVindas('Usuário', 'usuario+teste@email.com');

    expect(resultado.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'usuario+teste@email.com'
      })
    );
  });

  test('deve incluir template HTML correto', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    await emailService.enviarEmailBoasVindas('Teste', 'teste@email.com');

    const callArgs = mockSendEmail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('Bem-vindo à Foco Total!');
    expect(callArgs.html).toContain('Teste');
    expect(callArgs.html).toContain('font-family: Arial, sans-serif');
    expect(callArgs.html).toContain('max-width: 600px');
  });

  test('deve lidar com nome vazio', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailBoasVindas('', 'teste@email.com');

    expect(resultado.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Olá ,')
      })
    );
  });

  test('deve lidar com email inválido', async () => {
    mockSendEmail.mockRejectedValue(new Error('Invalid email address'));

    const resultado = await emailService.enviarEmailBoasVindas('Teste', 'email-invalido');

    expect(resultado.success).toBe(false);
    expect(resultado.message).toBe('Não foi possível enviar o email de boas-vindas');
  });
}); 