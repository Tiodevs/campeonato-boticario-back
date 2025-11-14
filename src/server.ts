import app from './app';
import { envs } from './config/env';

const PORT = envs.server.port;

// Inicia o servidor em todos os ambientes
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Servidor Express rodando na porta ${PORT}`);
    console.log(`📝 Foco Total Backend - Pronto para salvar frases famosas!`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`📚 Documentação: http://localhost:${PORT}/docs`);
  } else {
    console.log(`🚀 Servidor Express rodando na porta ${PORT}`);
    console.log(`📝 Foco Total Backend - Pronto para salvar frases famosas!`);
    console.log(`🌐 Servidor em produção`);
    console.log(`📚 Documentação disponível em /docs`);
  }
});

// Export único para ambos os ambientes
export default app; 