# PLAN.md — BoxMotor (plan técnico)

## 1. Arquitectura general

Aplicación web full-stack separada en tres carpetas:

- `/frontend`: React + TypeScript + Vite + React Router + CSS moderno. Capa de servicios para consumir la API. Diseño responsivo y accesible.
- `/backend`: Node.js + Express + TypeScript. Capas: Routes, Controllers, Services, Repositories, Models, Middlewares, Validators, Database, Config. API REST.
- `/docs`: TEST_REPORT.md y documentación de la API.

Base de datos: PostgreSQL con migraciones versionadas, transacciones, claves foráneas, restricciones, índices, consultas parametrizadas.

## 2. Tecnologías

Frontend: React 18, TypeScript, Vite, React Router DOM, CSS (estilos propios, sin plantilla genérica).
Backend: Node.js, Express, TypeScript, pg (PostgreSQL), jsonwebtoken, bcryptjs, zod, dotenv, cors.
Testing: Vitest, Supertest, Playwright.
Despliegue objetivo: Netlify (frontend), Render (backend), Neon (PostgreSQL) — sujetos a autenticación del usuario.

## 3. Carpetas

```
/backend
  src/
    config/          # env, clock, db config
    db/              # pool de conexión, migraciones runner
    migrations/      # SQL versionadas
    models/          # definiciones de entidades (tipos)
    repositories/    # acceso a datos por entidad
    services/        # reglas de negocio
    controllers/     # manejo de request/response
    routes/          # definiciones de endpoints
    middlewares/     # auth, role, error, validation
    validators/      # esquemas Zod
    tests/           # unitarios e integración
  tests-e2e/         # Playwright (opcional en backend)
  package.json
  tsconfig.json
  .env.example
  .gitignore

/frontend
  src/
    pages/           # pantallas (públicas, cliente, mecánico, admin)
    components/      # componentes reutilizables
    hooks/           # hooks personalizados
    services/        # capa API (axios/fetch)
    types/           # tipos TypeScript
    utils/           # utilidades, validaciones, formatos
    tests/           # pruebas frontend
  package.json
  vite.config.ts
  tsconfig.json
  .env.example
  .gitignore

/docs
  TEST_REPORT.md
  API.md (contratos de endpoints)

SPEC.md
AGENTS.md
PLAN.md
TASKS.md
README.md
.gitignore
.env.example
```

## 4. Módulos del backend

- Autenticación (registro, login, logout, JWT, middleware auth/role)
- Usuarios (CRUD, roles)
- Clientes
- Vehículos (con historial de kilometraje)
- Marcas y modelos (catálogo simple)
- Servicios (catálogo de servicios del taller)
- Mecánicos (especialidades, disponibilidad, habilitación)
- Disponibilidad (horarios, boxes, slots)
- Turnos (solicitud, confirmación, cancelación, estados, superposición)
- Diagnósticos
- Órdenes de trabajo (máquina de estados, trazabilidad)
- Presupuestos (versiones, aprobación cliente, vigencia)
- Repuestos (código único, stock)
- Movimientos de stock (ingreso, consumo, ajuste, reserva, liberación)
- Reservas de repuestos
- Notificaciones (placeholder en memoria/BD)
- Auditoría (AuditLogs)
- Administración (dashboard, configuración)
- Estadísticas

## 5. Entidades y modelo relacional

Entidades mínimas:

- users (id, email, password_hash, role, first_name, last_name, active, created_at)
- customers (id, user_id, phone, address, created_at)
- vehicles (id, customer_id, brand, model, version, year, plate_norm, plate_raw, mileage, fuel, transmission, vin, observations, created_at)
- vehicle_mileage_history (id, vehicle_id, mileage, recorded_at, recorded_by)
- mechanics (id, user_id, specialties, active, created_at)
- services (id, name, description, duration_min, labor_price, active, created_at)
- mechanic_services (mechanic_id, service_id)
- workshop_hours (id, day_of_week, open_time, close_time, active)
- workshop_bays (id, name, characteristics, active)
- appointments (id, customer_id, vehicle_id, service_id, mechanic_id, bay_id, starts_at, ends_at, status, reason, problem_description, created_at)
- work_orders (id, customer_id, vehicle_id, appointment_id, mechanic_id, bay_id, mileage_in, status, problem, observations, created_at, updated_at)
- work_order_status_history (id, work_order_id, from_status, to_status, changed_by, changed_at, notes)
- diagnostics (id, work_order_id, mechanic_id, identified_problem, observations, possible_causes, recommended_repairs, priority, created_at)
- work_order_items (id, work_order_id, part_id, quantity, unit_price, subtotal)
- estimates (id, work_order_id, version, labor_total, parts_total, total, status, issued_at, expires_at, notes, customer_id)
- estimate_versions (id, estimate_id, version, total, status, issued_at)
- estimate_items (id, estimate_id, version, part_id, quantity, unit_price, subtotal)
- parts (id, code, name, description, brand, category, price, quantity_available, min_stock, active)
- inventory_movements (id, part_id, type, quantity, reference_type, reference_id, user_id, created_at)
- part_reservations (id, estimate_id, work_order_id, part_id, quantity, status, created_at, released_at)
- notifications (id, user_id, type, message, read, created_at)
- audit_logs (id, user_id, action, entity, entity_id, old_values, new_values, created_at)
- business_settings (id, key, value, description)

Relaciones: customers→vehicles (1:N), vehicles→appointments/work_orders (1:N), mechanics→work_orders (1:N), bays→appointments/work_orders (1:N), services→appointments (1:N), work_orders→diagnostics/items/estimates (1:N), parts→inventory_movements/reservations/items (1:N), users→audit_logs (1:N).

## 6. Claves primarias y foráneas

- PK: UUID o serial en cada tabla.
- FK: vehicles.customer_id → customers.id; appointments.vehicle_id → vehicles.id; work_orders.vehicle_id → vehicles.id; work_orders.mechanic_id → mechanics.id; work_orders.bay_id → workshop_bays.id; parts references; inventory_movements.part_id → parts.id; audit_logs.user_id → users.id.
- ON DELETE RESTRICT para preservar historial; ON DELETE CASCADE solo donde corresponda (ej. estimate_items→estimates).

## 7. Restricciones

- UNIQUE(users.email), UNIQUE(vehicles.plate_norm), UNIQUE(parts.code)
- CHECK(stock >= 0), CHECK(mileage >= 0), CHECK(duration_min > 0), CHECK(price >= 0)
- FK válidas.

## 8. Índices

- Índices en FK, en plate_norm, en email, en status de turnos/órdenes, en starts_at/ends_at de turnos, en created_at de auditoría.

## 9. Migraciones

Migraciones SQL versionadas (001_initial.sql, 002_..., etc.) ejecutadas en orden. Datos iniciales (seed) de demostración: clientes, mecánicos, servicios, repuestos, vehículos, turnos, órdenes, presupuestos, movimientos.

## 10. Endpoints (contrato)

Auth: POST /auth/register, POST /auth/login, POST /auth/logout, GET /auth/me
Users: GET/POST/PUT/DELETE /users
Customers: GET/POST/PUT /customers
Vehicles: GET/POST/PUT /vehicles, GET /vehicles/:id/history
Services: GET/POST/PUT /services
Mechanics: GET/POST/PUT /mechanics
Bays: GET/POST/PUT /bays
Appointments: GET/POST/PUT/DELETE /appointments, GET /appointments/availability
WorkOrders: GET/POST/PUT /work-orders, POST /work-orders/:id/status, GET /work-orders/:id/history
Diagnostics: GET/POST /diagnostics
Estimates: GET/POST/PUT /estimates, POST /estimates/:id/approve, POST /estimates/:id/reject
Parts: GET/POST/PUT /parts
InventoryMovements: GET /inventory-movements
PartReservations: GET /part-reservations
AuditLogs: GET /audit-logs
Stats: GET /stats
Health: GET /health

Cada endpoint especifica método, ruta, parámetros, body, respuesta, errores, código HTTP, autenticación y permisos (documentado en docs/API.md).

## 11. Autenticación y autorización

- JWT firmado con JWT_SECRET, expiración configurable.
- Middleware de autenticación: valida token, pobla req.user.
- Middleware de autorización: verifica rol mínimo (CLIENT, MECHANIC, RECEPTIONIST, ADMIN).
- Protección de datos: cliente solo ve sus propios recursos; mecánico solo sus trabajos asignados.

## 12. Manejo de errores

Middleware centralizado. Códigos: 400 validación/transición, 401 autenticación, 403 permiso, 404 no encontrado, 409 conflicto. Respuesta JSON con código y mensaje. No exponer detalles internos ni secretos.

## 13. Testing

- Vitest (unitario e integración backend).
- Supertest (endpoints con base de datos de tests).
- Playwright (E2E frontend+backend).
- Tests frontend con React Testing Library / Vitest.
- Base de datos independiente de producción.

## 14. Despliegue

- Frontend: Netlify (VITE_API_URL = URL del backend).
- Backend: Render (DATABASE_URL, FRONTEND_URL, JWT_SECRET, NODE_ENV, PORT, ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_PASSWORD).
- PostgreSQL: Neon (conexión SSL, migraciones, datos iniciales).
- CORS configurado al origen del frontend.
- Health check en backend.
- Despliegue automático al actualizar rama principal (cuando haya autenticación).

## 15. Variables de entorno

Backend: DATABASE_URL, FRONTEND_URL, JWT_SECRET, NODE_ENV, PORT, ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_PASSWORD.
Frontend: VITE_API_URL.

## 16. Riesgos técnicos

- Despliegue requiere autenticación del usuario en Netlify/Render/Neon (no disponible sin intervención).
- Concurrencia de turnos y stock: mitigado con transacciones y restricciones BD.
- Zona horaria Argentina: manejada en backend.

## 17. Dependencias entre tareas

T-001 repo → T-002 SPEC → T-003 AGENTS/PLAN/TASKS → T-004 estructura → T-005 BD/migraciones → T-006 auth → T-007 usuarios/clientes → T-008 vehículos → T-009 servicios → T-010 mecánicos/boxes → T-011 turnos → T-012 órdenes → T-013 diagnósticos → T-014 presupuestos → T-015 repuestos/inventario → T-016 auditoría/notificaciones → T-017 frontend pantallas → T-018 integración → T-019 tests → T-020 QA → T-021 documentación → T-022 GitHub → T-023 despliegue → T-024 validación online → T-025 auditoría final.
