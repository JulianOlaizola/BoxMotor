# TASKS.md — BoxMotor

Cada tarea: identificador, descripción, dependencias, archivos afectados, resultado esperado, tests, estado, hash del commit.

## Tareas

- [x] T-001: Inicializar repositorio y estructura base.
  - Dependencias: ninguna.
  - Archivos: git init, package.json raíz, .gitignore, .env.example.
  - Resultado: repositorio Git inicializado con estructura /frontend /backend /docs.
  - Tests: ninguno.
  - Estado: completada.
  - Commit: ce35304

- [x] T-002: Crear especificación SPEC.md.
  - Dependencias: T-001.
  - Archivos: SPEC.md.
  - Resultado: SPEC completa con reglas R-001 a R-044, casos de uso, flujos, matriz reglas→pruebas.
  - Tests: revisión de coherencia.
  - Estado: completada.
  - Commit: 7a4a0f9

- [x] T-003: Crear AGENTS.md, PLAN.md, TASKS.md.
  - Dependencias: T-002.
  - Archivos: AGENTS.md, PLAN.md, TASKS.md.
  - Resultado: documentación de planificación completa.
  - Tests: ninguno.
  - Estado: completada.
  - Commit: fd2f1bd

- [x] T-004: Estructura de carpetas y configuración base (backend y frontend).
  - Dependencias: T-003.
  - Archivos: /backend/package.json, tsconfig.json, .env.example, .gitignore; /frontend/package.json, vite.config.ts, tsconfig.json, .env.example, .gitignore.
  - Resultado: proyectos backend y frontend inicializados, dependencias instaladas, scripts de dev/test/build. Ambos compilan (`tsc --noEmit` sin errores).
  - Tests: `npm run build` pasa en ambos.
  - Estado: completada.
  - Commit: d0020db

- [x] T-005: Base de datos: migraciones y seed de PostgreSQL.
  - Dependencias: T-004.
  - Archivos: /backend/src/db, /backend/migrations/001_initial.sql.
  - Resultado: 21 tablas (users, customers, vehicles, mechanics, services, appointments, work-orders, estimates, parts, inventory, auditoría, etc.), relaciones, restricciones (UNIQUE email/plate_norm/code, CHECK stock>=0/mileage>=0), índices, configuración por defecto (anticipación 2h, horizonte 45d, vigencia 7d, cancelación 24h).
  - Tests: migraciones aplican sin errores.
  - Estado: completada.
  - Commit: d0020db

- [x] T-006: Autenticación (registro, login, JWT, middleware auth/role).
  - Dependencias: T-005.
  - Archivos: /backend/src/routes/auth.routes.ts, controllers/authController, services/authService, repositories/userRepository, middlewares/auth, validators.
  - Resultado: register/login devuelven JWT; contraseñas hasheadas con bcrypt (costo 10); middlewares de autenticación y autorización por rol (CLIENT/MECHANIC/RECEPTIONIST/ADMIN).
  - Tests: unitarios de esquemas de auth (6 pruebas pasando en vitest).
  - Estado: completada (implementado y compilando).
  - Commit: d0020db

- [x] T-007: Usuarios y clientes.
  - Dependencias: T-006.
  - Archivos: /backend/src/routes/user.routes.ts, customer.routes.ts, controllers, services, repositories.
  - Resultado: CRUD de usuarios y clientes protegido por rol.
  - Estado: completada (implementado y compilando).
  - Commit: d0020db

- [x] T-008: Vehículos y historial de kilometraje.
  - Dependencias: T-007.
  - Archivos: /backend/src/routes/vehicle.routes.ts, controllers/vehicleController, services/vehicleService, repositories/vehicleRepository.
  - Resultado: registro de vehículos, normalización de patente (mayúsculas, sin espacios/guiones), unicidad de plate_norm, kilometraje no regresivo, historial de kilometraje.
  - Estado: completada (implementado y compilando).
  - Commit: d0020db

- [x] T-009: Servicios del taller.
  - Dependencias: T-007.
  - Archivos: /backend/src/routes/service.routes.ts, controllers/serviceController, services/serviceService, repositories/serviceRepository.
  - Resultado: CRUD de servicios (nombre, descripción, duración, precio mano de obra, estado activo/inactivo).
  - Estado: completada (implementado y compilando).
  - Commit: d0020db

- [x] T-010: Mecánicos, especialidades y boxes (puestos de trabajo).
  - Dependencias: T-007, T-009.
  - Archivos: /backend/src/routes/mechanic.routes.ts, bay.routes.ts, workshopHours.routes.ts, controllers, services, repositories.
  - Resultado: CRUD de mecánicos con especialidades, CRUD de boxes y horarios del taller.
  - Estado: completada (implementado y compilando).
  - Commit: d0020db

- [x] T-011: Turnos (solicitud, disponibilidad, confirmación, cancelación, superposición).
  - Dependencias: T-008, T-009, T-010.
  - Archivos: /backend/src/routes/appointment.routes.ts, controllers/appointmentController, services/appointmentService, repositories/appointmentRepository.
  - Resultado: solicitud de turno, cálculo de disponibilidad, control de superposición mecánico/box (409), anticipación mínima 2h y horizonte máximo 45d (configurables), cancelación 24h, estados PENDING/CONFIRMED/CANCELLED/NO_SHOW/CONVERTED_TO_WORK_ORDER.
  - Estado: completada (implementado y compilando).
  - Commit: d0020db

- [x] T-012: Órdenes de trabajo (creación, diagnóstico, máquina de estados, trazabilidad).
  - Dependencias: T-011.
  - Archivos: /backend/src/routes/work-order.routes.ts, diagnostic.routes.ts, controllers, services, repositories.
  - Resultado: creación de orden, diagnóstico, máquina de estados RECEIVED→DIAGNOSIS→WAITING_APPROVAL→WAITING_PARTS→IN_PROGRESS→QUALITY_CHECK→READY_FOR_PICKUP→COMPLETED/CANCELLED, trazabilidad de cambios de estado (work_order_status_history).
  - Estado: completada (implementado y compilando).
  - Commit: d0020db

- [x] T-013: Presupuestos (creación, versiones, aprobación cliente, vigencia, precios históricos).
  - Dependencias: T-012.
  - Archivos: /backend/src/routes/estimate.routes.ts, controllers/estimateController, services/estimateService, repositories/estimateRepository.
  - Resultado: creación de presupuesto, cálculo de totales (mano de obra + repuestos), aprobación/rechazo cliente, nuevas versiones, vigencia 7 días (configurable), precios históricos copiados al crear.
  - Estado: completada (implementado y compilando).
  - Commit: d0020db

- [x] T-014: Repuestos e inventario (movimientos, stock, reservas, consumos, liberaciones).
  - Dependencias: T-009.
  - Archivos: /backend/src/routes/part.routes.ts, inventory-movements.routes.ts, controllers, services, repositories.
  - Resultado: CRUD de repuestos (código único), movimientos de inventario (ingreso/consumo/ajuste/reserva/liberación), stock no negativo (CHECK), reservas y consumos, liberación al cancelar.
  - Estado: completada (implementado y compilando).
  - Commit: d0020db

- [ ] T-015: Finalización y entrega (control de calidad, entrega, kilometraje final, historial permanente).
  - Dependencias: T-012, T-014.
  - Archivos: work_orders (finalización/entrega).
  - Resultado: orden solo completa si condiciones cumplidas; entrega registra fecha, kilometraje final; historial permanente.
  - Tests: integración (condiciones finalización).
  - Estado: pendiente.
  - Commit: —

- [ ] T-016: Auditoría, notificaciones y estadísticas.
  - Dependencias: T-006, T-012.
  - Archivos: audit_logs, notifications, stats.
  - Resultado: log de auditoría para operaciones admin, endpoint de estadísticas.
  - Tests: integración auditoría.
  - Estado: pendiente.
  - Commit: —

- [x] T-017: Frontend — pantallas públicas (inicio, servicios, registro, login).
  - Dependencias: T-006, T-009.
  - Archivos: /frontend/src/pages/Home.tsx, Login.tsx, Register.tsx, Services.tsx; src/App.tsx (router); src/services/api.ts; src/index.css.
  - Resultado: frontend React + TypeScript + Vite + React Router, pantallas públicas funcionales (inicio con health-check de API, login, registro, catálogo de servicios) conectadas a la capa de servicios de la API. Compila (`tsc --noEmit` sin errores).
  - Tests: estructura lista para pruebas de navegación y formularios.
  - Estado: completada (implementado y compilando).
  - Commit: d0020db

- [x] T-018: Frontend — panel cliente (vehículos, turnos).
  - Dependencias: T-006, T-008, T-011.
  - Archivos: /frontend/src/pages/Vehicles.tsx, Appointments.tsx; rutas protegidas en App.tsx.
  - Resultado: vistas de mis vehículos y mis turnos, consumo real de endpoints /vehicles y /appointments, rutas protegidas por token JWT.
  - Estado: completada (implementado y compilando).
  - Commit: d0020db

- [x] T-019: Frontend — panel mecánico (dashboard, trabajos asignados, estados de orden).
  - Dependencias: T-006, T-012.
  - Archivos: /frontend/src/pages/mecanico/Dashboard.tsx, index.ts.
  - Resultado: panel del mecánico con listado de trabajos asignados, estados de orden (badge por estado) y enlace en la barra de navegación.
  - Estado: completada (implementado y compilando).
  - Commit: c9bdc38

- [x] T-020: Frontend — panel administrativo (clientes, vehículos, mecánicos, servicios, órdenes, presupuestos, repuestos, inventario, auditoría).
  - Dependencias: T-006 a T-014.
  - Archivos: /frontend/src/pages/admin/Dashboard.tsx, index.ts; rutas en App.tsx; api.ts extendido.
  - Resultado: panel administrativo con pestañas por módulo, consumo real de endpoints de listado, rutas /admin y /mecanico protegidas por token.
  - Estado: completada (implementado y compilando).
  - Commit: c9bdc38

- [ ] T-021: Integración backend-frontend y pruebas E2E.
  - Dependencias: T-006 a T-020.
  - Archivos: tests-e2e (Playwright).
  - Resultado: flujo completo cliente → mecánico → admin pasando E2E.
  - Tests: E2E completo, concurrencia, inventario, permisos.
  - Estado: pendiente.
  - Commit: —

- [ ] T-022: QA y corrección de errores.
  - Dependencias: T-021.
  - Archivos: todos.
  - Resultado: todos los tests pasan, lint/typecheck/build OK.
  - Tests: todas las suites.
  - Estado: pendiente.
  - Commit: —

- [x] T-023: Documentación completa (README, docs/API, TEST_REPORT).
  - Dependencias: T-022 (parcial: README ya existe, TEST_REPORT inicial y API.md creados).
  - Archivos: README.md, docs/TEST_REPORT.md, docs/API.md.
  - Resultado: documentación obligatoria creada (README completo, docs/API.md con contratos de todos los endpoints, docs/TEST_REPORT.md inicial con matriz reglas→pruebas).
  - Tests: revisión de documentos.
  - Estado: completada (versión inicial; TEST_REPORT se completa tras despliegue y ejecución de suites).
  - Commit: 4a035ce

- [ ] T-024: Publicar repositorio público en GitHub.
  - Dependencias: T-023.
  - Archivos: remoto GitHub.
  - Resultado: repositorio público accesible, sin secretos.
  - Tests: revisión de secretos, acceso público.
  - Estado: pendiente.
  - Commit: —

- [ ] T-025: Desplegar frontend, backend y base de datos en internet.
  - Dependencias: T-024 (requiere autenticación del usuario en proveedores).
  - Archivos: variables de entorno en paneles de hosting.
  - Resultado: frontend, backend y PostgreSQL publicados y conectados.
  - Tests: health check, endpoints desde internet.
  - Estado: pendiente (bloqueado pendiente autenticación proveedores).
  - Commit: —

- [ ] T-026: Validación desde internet (flujo completo cliente/mecánico/admin).
  - Dependencias: T-025.
  - Archivos: URLs públicas.
  - Resultado: aplicación verificada desde navegador público.
  - Tests: pruebas manuales desde internet.
  - Estado: pendiente.
  - Commit: —

- [ ] T-027: Auditoría final y cumplimiento de consigna.
  - Dependencias: T-026.
  - Archivos: todos.
  - Resultado: auditoría de los 21 requisitos de entrega; correcciones si aplica.
  - Tests: revisión final.
  - Estado: pendiente.
  - Commit: —
