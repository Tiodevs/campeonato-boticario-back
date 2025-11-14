import express from 'express';
import cors from 'cors';

// Rotas
import routes from './routes/routes';
import { envs } from './config/env';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument, swaggerUiOptions } from './docs/swagger';

const app = express();

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para CORS
app.use(cors({
  origin: envs.server.host,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Documentação Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo ao backend da Foco Total!',
    version: '1.0.0',
    description: 'API para gerenciar tarefas',
    endpoints: {
      tasks: '/api/tasks',
      users: '/api/users'
    }
  });
});


// Registrar as rotas
app.use('/api', routes);


export default app; 