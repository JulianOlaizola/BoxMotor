/**
 * Setup de pruebas Vitest.
 * Provee variables de entorno mínimas para que el servidor cargue sin una
 * base de datos real. Las pruebas de persistencia requieren DATABASE_TEST_URL
 * y se documentan como pendientes en docs/TEST_REPORT.md.
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/boxmotor_test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-secret-do-not-use-in-production';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
process.env.PORT = process.env.PORT || '4000';
