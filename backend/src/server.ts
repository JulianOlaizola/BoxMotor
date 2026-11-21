import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`BoxMotor backend escuchando en puerto ${env.PORT} (${env.NODE_ENV})`);
});

export { server, app };

// Manejo graceful de cierre
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => process.exit(0));
});

