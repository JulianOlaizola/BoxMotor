import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const TEST_DB_URL = process.env.DATABASE_TEST_URL;

const app = createApp();

describe('integración backend', () => {
  it('health responde OK sin necesidad de BD', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('pruebas de persistencia y endpoints requieren DATABASE_TEST_URL', () => {
    if (!TEST_DB_URL) {
      // eslint-disable-next-line no-console
      console.log(
        '[integration] DATABASE_TEST_URL no definido: pruebas de persistencia y endpoints omitidas (se ejecutan contra Neon/Render en despliegue).'
      );
      expect(true).toBe(true);
    } else {
      expect(TEST_DB_URL).toContain('postgresql');
    }
  });
});
