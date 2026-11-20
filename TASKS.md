# TASKS.md — BoxMotor

Cada tarea: identificador, descripción, dependencias, archivos afectados, resultado esperado, tests, estado, hash del commit.

## Tareas

- [ ] T-001: Inicializar repositorio y estructura base.
  - Dependencias: ninguna.
  - Archivos: git init, package.json raíz, .gitignore, .env.example.
  - Resultado: repositorio Git inicializado con estructura /frontend /backend /docs.
  - Tests: ninguno.
  - Estado: pendiente.
  - Commit: —

- [ ] T-002: Crear especificación SPEC.md.
  - Dependencias: T-001.
  - Archivos: SPEC.md.
  - Resultado: SPEC completa con reglas R-001 a R-044, casos de uso, flujos, matriz reglas→pruebas.
  - Tests: revisión de coherencia.
  - Estado: completada.
  - Commit: —

- [ ] T-003: Crear AGENTS.md, PLAN.md, TASKS.md.
  - Dependencias: T-002.
  - Archivos: AGENTS.md, PLAN.md, TASKS.md.
  - Resultado: documentación de planificación completa.
  - Tests: ninguno.
  - Estado: completada.
  - Commit: —

- [ ] T-004: Estructura de carpetas y configuración base (backend y frontend).
  - Dependencias: T-003.
  - Archivos: /backend/package.json, tsconfig.json, .env.example, .gitignore; /frontend/package.json, vite.config.ts, tsconfig.json, .env.example, .gitignore.
  - Resultado: proyectos backend y frontend inicializados, dependencias instaladas, scripts de dev/test/build.
  - Tests: `npm run build` pasa en ambos.
  - Estado: pendiente.
  - Commit: —

- [ ] T-005: Base de datos: migraciones y seed de PostgreSQL.
  - Dependencias: T-004.
  - Archivos: /backend/src/db, /backend/migrations/*.sql.
  - Resultado: tablas, relaciones, restricciones, índices, datos de demostración.
  - Tests: migraciones aplican sin errores; tablas existen.
  - Estado: pendiente.
  - Commit: —

- [ ] T-006: Autenticación (registro, login, JWT, middleware auth/role).
  - Dependencias: T-005.
  - Archivos: /backend/src/routes/auth.*, controllers, services, repositories, validators, middlewares.
  - Resultado: register/login devuelven JWT; contraseñas hasheadas; middlewares protegen rutas por rol.
  - Tests: unitarios (hash), integración (register/login/401/403).
  - Estado: pendiente.
  - Commit: —

- [ ] T-007: Usuarios y clientes.
  - Dependencias: T-006.
  - Archivos: users, customers routes/services/repositories.
  - Resultado: CRUD de usuarios y clientes protegido por rol.
  - Tests: integración CRUD y autorización.
  - Estado: pendiente.
  - Commit: —

- [ ] T-008: Vehículos y historial de kilometraje.
  - Dependencias: T-007.
  - Archivos: vehicles, vehicle_mileage_history.
  - Resultado: registro de vehículos, normalización de patente, unicidad, kilometraje no regresivo, historial.
  - Tests: unidad (normalización, kilometraje), integración (patente duplicada 409).
  - Estado: pendiente.
  - Commit: —

- [ ] T-009: Servicios del taller.
  - Dependencias: T-007.
  - Archivos: services.
  - Resultado: CRUD de servicios, servicios inactivos excluidos.
  - Tests: integración CRUD.
  - Estado: pendiente.
  - Commit: —

- [ ] T-010: Mecánicos, especialidades y boxes (puestos de trabajo).
  - Dependencias: T-007, T-009.
  - Archivos: mechanics, mechanic_services, workshop_bays, workshop_hours.
  - Resultado: CRUD de mecánicos con especialidades, CRUD de boxes y horarios.
  - Tests: integración.
  - Estado: pendiente.
  - Commit: —

- [ ] T-011: Turnos (solicitud, disponibilidad, confirmación, cancelación, superposición).
  - Dependencias: T-008, T-009, T-010.
  - Archivos: appointments.
  - Resultado: solicitud de turno, cálculo de disponibilidad, control de superposición (409), anticipación (2hs/45d), cancelación 24hs, estados.
  - Tests: unidad (disponibilidad, anticipación), integración (conflicto 409, concurrencia), E2E.
  - Estado: pendiente.
  - Commit: —

- [ ] T-012: Órdenes de trabajo (creación, diagnóstico, máquina de estados, trazabilidad).
  - Dependencias: T-011.
  - Archivos: work_orders, work_order_status_history, diagnostics.
  - Resultado: creación de orden, diagnóstico, transiciones válidas, trazabilidad de cambios de estado.
  - Tests: unidad (transiciones), integración (transición inválida 400).
  - Estado: pendiente.
  - Commit: —

- [ ] T-013: Presupuestos (creación, versiones, aprobación cliente, vigencia, precios históricos).
  - Dependencias: T-012.
  - Archivos: estimates, estimate_versions, estimate_items.
  - Resultado: creación de presupuesto, cálculo de totales, aprobación/rechazo cliente, nuevas versiones, vigencia 7 días.
  - Tests: unidad (cálculo total, vigencia), integración (aprobación).
  - Estado: pendiente.
  - Commit: —

- [ ] T-014: Repuestos e inventario (movimientos, stock, reservas, consumos, liberaciones).
  - Dependencias: T-009.
  - Archivos: parts, inventory_movements, part_reservations.
  - Resultado: CRUD de repuestos, código único, movimientos de inventario, stock no negativo, reservas y consumos, liberación al cancelar.
  - Tests: unidad (stock no negativo), integración (reserva insuficiente 409, concurrencia stock).
  - Estado: pendiente.
  - Commit: —

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

- [ ] T-017: Frontend — pantallas públicas (inicio, servicios, taller, FAQ, registro, login).
  - Dependencias: T-006, T-009.
  - Archivos: /frontend/src/pages/public, components.
  - Resultado: pantallas públicas funcionales conectadas a API.
  - Tests: frontend (navegación, formularios).
  - Estado: pendiente.
  - Commit: —

- [ ] T-018: Frontend — panel cliente (dashboard, perfil, vehículos, turnos, presupuestos, seguimiento, notificaciones).
  - Dependencias: T-006, T-008, T-011, T-013.
  - Archivos: /frontend/src/pages/cliente.
  - Resultado: cliente puede usar la aplicación completa.
  - Tests: frontend (rutas protegidas, roles, formularios).
  - Estado: pendiente.
  - Commit: —

- [ ] T-019: Frontend — panel mecánico (dashboard, agenda, trabajos asignados, diagnóstico, tareas, repuestos, calidad).
  - Dependencias: T-006, T-012, T-014.
  - Archivos: /frontend/src/pages/mecanico.
  - Resultado: mecánico gestiona sus trabajos.
  - Tests: frontend.
  - Estado: pendiente.
  - Commit: —

- [ ] T-020: Frontend — panel administrativo (dashboard, turnos, calendario, clientes, vehículos, mecánicos, servicios, órdenes, presupuestos, repuestos, inventario, boxes, horarios, reportes, auditoría, configuración).
  - Dependencias: T-006 a T-016.
  - Archivos: /frontend/src/pages/admin.
  - Resultado: administración completa del taller.
  - Tests: frontend.
  - Estado: pendiente.
  - Commit: —

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

- [ ] T-023: Documentación completa (README, docs/API, TEST_REPORT).
  - Dependencias: T-022.
  - Archivos: README.md, docs/TEST_REPORT.md, docs/API.md.
  - Resultado: documentación obligatoria completa.
  - Tests: revisión de documentos.
  - Estado: pendiente.
  - Commit: —

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
