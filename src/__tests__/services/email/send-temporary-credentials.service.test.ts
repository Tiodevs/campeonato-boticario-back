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

const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    FRONTEND_URL: 'http://localhost:3000'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('SendTemporaryCredentialsService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    jest.clearAllMocks();

    emailService = new EmailService();
  });

  test('deve ter o método enviarEmailCredenciaisTemporarias', () => {
    expect(typeof emailService.enviarEmailCredenciaisTemporarias).toBe('function');
  });

  test('deve enviar email de credenciais temporárias com sucesso', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailCredenciaisTemporarias(
      'João Silva',
      'joao@email.com',
      'senha123'
    );

    expect(resultado).toEqual({
      success: true,
      message: 'Email de credenciais enviado com sucesso'
    });

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"Foco Total" <test@aspasnote.com>',
        to: 'joao@email.com',
        subject: 'Suas Credenciais de Acesso - Foco Total',
        html: expect.stringContaining('João Silva')
      })
    );

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });

  test('deve falhar quando o envio de email retorna erro', async () => {
    const erroSimulado = new Error('Erro de conexão SMTP');
    mockSendEmail.mockRejectedValue(erroSimulado);

    const resultado = await emailService.enviarEmailCredenciaisTemporarias(
      'João Silva',
      'joao@email.com',
      'senha123'
    );

    expect(resultado).toEqual({
      success: false,
      message: 'Erro ao enviar email de credenciais'
    });
  });

  test('deve incluir credenciais no template HTML', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    await emailService.enviarEmailCredenciaisTemporarias(
      'Teste',
      'teste@email.com',
      'senha-temporaria-123'
    );

    const callArgs = mockSendEmail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('teste@email.com');
    expect(callArgs.html).toContain('senha-temporaria-123');
    expect(callArgs.html).toContain('Bem-vindo(a) à Foco Total! 🎉');
    expect(callArgs.html).toContain('Senha Temporária');
  });

  test('deve incluir link para login no template', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    await emailService.enviarEmailCredenciaisTemporarias(
      'Teste',
      'teste@email.com',
      'senha123'
    );

    const callArgs = mockSendEmail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('http://localhost:3000/login');
    expect(callArgs.html).toContain('Acessar Minha Conta');
  });

  test('deve lidar com nomes com caracteres especiais', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailCredenciaisTemporarias(
      'José Antônio da Côrte',
      'jose@email.com',
      'senha123'
    );

    expect(resultado.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('José Antônio da Côrte')
      })
    );
  });

  test('deve lidar com senhas complexas', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const senhaComplexa = 'Senha@123#456$789';
    
    await emailService.enviarEmailCredenciaisTemporarias(
      'Teste',
      'teste@email.com',
      senhaComplexa
    );

    const callArgs = mockSendEmail.mock.calls[0][0];
    expect(callArgs.html).toContain(senhaComplexa);
  });

  test('deve lidar com emails com caracteres especiais', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailCredenciaisTemporarias(
      'Usuário',
      'usuario+teste@email.com',
      'senha123'
    );

    expect(resultado.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'usuario+teste@email.com'
      })
    );
  });

  test('deve incluir mensagem de segurança no template', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    await emailService.enviarEmailCredenciaisTemporarias(
      'Teste',
      'teste@email.com',
      'senha123'
    );

    const callArgs = mockSendEmail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('Por questões de segurança');
    expect(callArgs.html).toContain('recomendamos que você altere sua senha');
    expect(callArgs.html).toContain('Se você não solicitou esta conta');
  });

  test('deve lidar com nome vazio', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailCredenciaisTemporarias(
      '',
      'teste@email.com',
      'senha123'
    );

    expect(resultado.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Olá ,')
      })
    );
  });

  test('deve lidar com senha vazia', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailCredenciaisTemporarias(
      'Teste',
      'teste@email.com',
      ''
    );

    expect(resultado.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Senha Temporária:</strong> ')
      })
    );
  });
}); 