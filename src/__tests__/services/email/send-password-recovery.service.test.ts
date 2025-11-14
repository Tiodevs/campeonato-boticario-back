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

describe('SendPasswordRecoveryService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    jest.clearAllMocks();

    emailService = new EmailService();
  });

  test('deve ter o método enviarEmailRecuperacaoSenha', () => {
    expect(typeof emailService.enviarEmailRecuperacaoSenha).toBe('function');
  });

  test('deve enviar email de recuperação de senha com sucesso', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      'João Silva',
      'joao@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    expect(resultado).toEqual({
      success: true,
      message: 'Email de recuperação enviado com sucesso'
    });

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Foco Total <test@aspasnote.com>',
        to: 'joao@email.com',
        subject: 'Recuperação de Senha - Foco Total',
        html: expect.stringContaining('João Silva')
      })
    );

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });

  test('deve falhar quando o envio de email retorna erro', async () => {
    const erroSimulado = new Error('Erro de conexão SMTP');
    mockSendEmail.mockRejectedValue(erroSimulado);

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      'João Silva',
      'joao@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    expect(resultado).toEqual({
      success: false,
      message: 'Não foi possível enviar o email de recuperação'
    });
  });

  test('deve incluir link de recuperação no template HTML', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resetLink = 'https://aspasnote.com/reset-password?token=abc123';
    
    await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'teste@email.com',
      resetLink
    );

    const callArgs = mockSendEmail.mock.calls[0][0];
    
    expect(callArgs.html).toContain(resetLink);
    expect(callArgs.html).toContain('Redefinir Senha');
    expect(callArgs.html).toContain('Recuperação de Senha');
  });

  test('deve incluir informações de segurança no template', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'teste@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    const callArgs = mockSendEmail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('Se você não solicitou esta alteração');
    expect(callArgs.html).toContain('O link é válido por 1 hora');
    expect(callArgs.html).toContain('Equipe Foco Total');
  });

  test('deve lidar com nomes com caracteres especiais', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      'José Antônio da Côrte',
      'jose@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    expect(resultado.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('José Antônio da Côrte')
      })
    );
  });

  test('deve lidar com links de recuperação complexos', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const linkComplexo = 'https://aspasnote.com/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDU3MTQ5MH0.signature';
    
    await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'teste@email.com',
      linkComplexo
    );

    const callArgs = mockSendEmail.mock.calls[0][0];
    expect(callArgs.html).toContain(linkComplexo);
  });

  test('deve lidar com emails com caracteres especiais', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      'Usuário',
      'usuario+teste@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    expect(resultado.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'usuario+teste@email.com'
      })
    );
  });

  test('deve incluir botão de ação no template', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'teste@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    const callArgs = mockSendEmail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('background-color: #4CAF50');
    expect(callArgs.html).toContain('color: white');
    expect(callArgs.html).toContain('border-radius: 5px');
    expect(callArgs.html).toContain('text-decoration: none');
  });

  test('deve lidar com nome vazio', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      '',
      'teste@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    expect(resultado.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Olá ,')
      })
    );
  });

  test('deve lidar com link de recuperação vazio', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'teste@email.com',
      ''
    );

    expect(resultado.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('href=""')
      })
    );
  });

  test('deve incluir estrutura HTML correta', async () => {
    mockSendEmail.mockResolvedValue({ data: { id: 'test-message-id' } });

    await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'teste@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    const callArgs = mockSendEmail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('font-family: Arial, sans-serif');
    expect(callArgs.html).toContain('max-width: 600px');
    expect(callArgs.html).toContain('margin: 0 auto');
    expect(callArgs.html).toContain('padding: 20px');
  });

  test('deve lidar com email inválido', async () => {
    mockSendEmail.mockRejectedValue(new Error('Invalid email address'));

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'email-invalido',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    expect(resultado.success).toBe(false);
    expect(resultado.message).toBe('Não foi possível enviar o email de recuperação');
  });
}); 