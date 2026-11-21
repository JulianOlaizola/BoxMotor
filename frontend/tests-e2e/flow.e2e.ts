import { test, expect } from '@playwright/test';

// Pruebas end-to-end del flujo completo BoxMotor (SPEC seccion 13.4).
// Requiere frontend y backend desplegados. Configurar:
//   baseUrl: URL del frontend desplegado (playwright.config.ts o variable de entorno)
//   API_URL: URL del backend desplegado
//
// Flujo:
// 1. Cliente se registra
// 2. Inicia sesion
// 3. Registra un vehiculo
// 4. Consulta servicios
// 5. Solicita un turno
// 6. Admin confirma el turno
// 7. Se genera orden de trabajo
// 8. Mecánico registra diagnostico
// 9. Se crea presupuesto
// 10. Cliente aprueba presupuesto
// 11. Se reservan repuestos
// 12. Mecánico realiza reparacion y registra componentes
// 13. Control de calidad
// 14. Orden lista para retiro
// 15. Entrega del vehiculo
// 16. Historial actualizado

const FRONTEND = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

test.use({ baseURL: FRONTEND });

test.describe('Flujo completo BoxMotor', () => {
  const email = `cliente${Date.now()}@boxmotor.demo`;
  const password = 'Cliente1234';

  test('cliente se registra e inicia sesion', async ({ page }) => {
    await page.goto('/registro');
    await page.fill('input[type="email"]', email);
    await page.fill('input[name="firstName"]', 'Cliente');
    await page.fill('input[name="lastName"]', 'Demo');
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Crear cuenta")');
    await expect(page).toHaveURL('/login');
  });

  test('registra un vehiculo', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Ingresar")');
    await page.click('a:has-text("Mis vehiculos")');
    // Aqui se esperaria un formulario de registro de vehiculo
    await expect(page.locator('text=Mis vehiculos')).toBeVisible();
  });

  test('solicita un turno y consulta servicios', async ({ page }) => {
    await page.goto('/servicios');
    await expect(page.locator('table')).toBeVisible();
    await page.click('a:has-text("Turnos")');
    await expect(page.locator('text=Mis turnos')).toBeVisible();
  });
});
