# BoxMotor

Plataforma integral de gestion de talleres meccanicos multimarca.

Trabajo Práctico Final — Generación T.

## Descripción

BoxMotor digitaliza y centraliza las operaciones de un taller mecanico multimarca, desde que un cliente registra su vehículo y solicita un turno hasta que el vehículo es diagnosticado, presupuestado, reparado y entregado.

El sistema permite administrar clientes, vehículos, mecánicos, servicios, repuestos, inventario, presupuestos y órdenes de trabajo, con tres roles de usuario: cliente, mecánico y administrador/recepcionista.

## Problema que resuelve

Muchos talleres gestionan sus operaciones con herramientas separadas, anotaciones o planillas. Esto provoca:

- Pérdida del historial de los vehículos.
- Turnos superpuestos.
- Confusión sobre el estado de una reparación.
- Presupuestos poco claros.
- Reparaciones sin autorización del cliente.
- Errores en el inventario.
- Falta de trazabilidad.

BoxMotor centraliza estas operaciones en una sola plataforma.

## Objetivos

- Registrar clientes y vehículos con historial permanente.
- Reservar turnos con control de disponibilidad y superposición.
- Crear órdenes de trabajo con diagnóstico y trazabilidad de estados.
- Elaborar presupuestos con aprobación del cliente y versiones.
- Gestionar inventario de repuestos con control de stock.
- Auditar operaciones administrativas.
- Generar estadísticas del taller.

## Funcionalidades

- Registro, inicio y cierre de sesión (JWT, contraseñas hasheadas).
- Gestión de usuarios por rol (CLIENT, MECHANIC, RECEPTIONIST, ADMIN).
- Registro de vehículos con normalización de patente y control de kilometraje.
- Catálogo de servicios del taller.
- Gestión de mecánicos (especialidades) y boxes (puestos de trabajo).
- Solicitud y confirmación de turnos con prevención de superposiciones.
- Órdenes de trabajo con máquina de estados y trazabilidad de cambios.
- Diagnósticos de reparación.
- Presupuestos con vigencia, versiones y aprobación del cliente.
- Inventario de repuestos, movimientos de stock, reservas y consumos.
- Control de calidad y entrega de vehículos.
- Auditoría de operaciones administrativas y estadísticas.

## Roles

| Rol | Puede |
|-----|-------|
| CLIENT | Registrar vehículos, solicitar turnos, consultar presupuestos, aprobar/rechazar presupuestos, seguir reparaciones. |
| MECHANIC | Consultar trabajos asignados, registrar diagnósticos, actualizar tareas, completar inspecciones. |
| RECEPTIONIST | Operativa del turno: clientes, vehículos, turnos, presupuestos (sin acceso administrativo sensible). |
| ADMIN | Permisos completos: usuarios, mecánicos, servicios, repuestos, configuración, auditoría. |

## Tecnologías

- Frontend: React 18, TypeScript, Vite, React Router, CSS propio.
- Backend: Node.js, Express, TypeScript, API REST (capas Routes/Controllers/Services/Repositories).
- Base de datos: PostgreSQL con migraciones versionadas, transacciones, claves foráneas, restricciones.
- Autenticación: JWT + bcrypt (costo 10).
- Validación: Zod (backend y frontend).
- Pruebas: Vitest + Supertest (backend).

## Arquitectura

Capas separadas de responsabilidades:

```
Routes → Controllers → Services → Repositories → Database (PostgreSQL)
```

Middlewares: autenticación, autorización por rol, manejo centralizado de errores, validación.

## Estructura del repositorio

```
/                SPEC.md, AGENTS.md, PLAN.md, TASKS.md, README.md, .gitignore, .env.example
/backend         API REST (Node/Express/TS + PostgreSQL)
  src/
    config/      variables de entorno y reloj controlable
    db/          pool de conexión, migraciones, transacciones
    migrations/  SQL versionadas (001_initial.sql + seed)
    models/      tipos TypeScript
    repositories/# acceso a datos por entidad
    services/    reglas de negocio
    controllers/ # manejo de request/response
    routes/      definiciones de endpoints
    middlewares/ # auth, rol, errores, validación
    validators/  esquemas Zod
    tests/       pruebas unitarias e integración
/frontend        Aplicación React + TypeScript + Vite
  src/
    pages/       pantallas (inicio, login, registro, vehículos, servicios, turnos)
    components/  componentes reutilizables
    services/    capa API
    types/       tipos TypeScript
/docs            TEST_REPORT.md, documentación de API
```

## Instalación

Requisitos: Node.js 18+, npm, PostgreSQL.

```bash
# Clonar el repositorio
git clone <URL-DEL-REPOSITORIO>
cd boxmotor

# Backend
cd backend
cp .env.example .env   # editar con valores reales
npm install
npm run migrate        # aplica migraciones y seed
npm run build          # compila a dist/ (producción)
npm run typecheck      # typecheck (tsc --noEmit)
npm start              # servidor en puerto 4000 (node dist/server.js)
npm run dev            # servidor con tsx (desarrollo)
npm run migrate        # aplica migraciones SQL a PostgreSQL

# Frontend (desde la raíz)
cd ../frontend
cp .env.example .env   # VITE_API_URL=http://localhost:4000
npm install
npm run dev            # servidor en puerto 5173
```

## Variables de entorno

Backend (`.env`):

```
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/boxmotor?sslmode=require
FRONTEND_URL=http://localhost:5173
JWT_SECRET=cambiar_por_un_secreto_fuerte
NODE_ENV=development
PORT=4000
ADMIN_BOOTSTRAP_EMAIL=admin@boxmotor.demo
ADMIN_BOOTSTRAP_PASSWORD=AdminDemo123
```

Frontend (`.env`):

```
VITE_API_URL=http://localhost:4000
```

Los archivos `.env` están excluidos de Git (`.gitignore`). `.env.example` contiene los nombres de las variables con valores ficticios.

## Ejecución

1. Levantar PostgreSQL y crear la base de datos `boxmotor`.
2. En `/backend`, configurar `.env` y ejecutar `npm run migrate`.
3. Iniciar backend: `npm run dev` (puerto 4000).
4. Iniciar frontend: `npm run dev` (puerto 5173).
5. Abrir `http://localhost:5173`.

## Pruebas

Backend:

```bash
cd backend
npm test
```

Suite de pruebas: 12 pruebas pasando (reloj controlable R-040, validaciones de autenticación, health-check).

## Migraciones

Las migraciones SQL versionadas viven en `/backend/migrations/`. La migración `001_initial.sql` crea todas las tablas (users, customers, vehicles, mechanics, services, appointments, work-orders, estimates, parts, inventory, auditoría, etc.) e inserta datos de configuración por defecto (anticipación mínima, vigencia de presupuestos, etc.).

## Datos de demostración y cuentas de prueba

El sistema incluye configuración base para crear cuentas de demostración (cliente, mecánico, recepcionista, administrador) y datos de ejemplo de vehículos, servicios y repuestos. Las credenciales de demostración usan exclusivamente datos artificiales.

## URLs publicadas

- Repositorio público (GitHub): https://github.com/JulianOlaizola/BoxMotor
- Frontend: por configurar (Netlify) — definir `VITE_API_URL` con la URL del backend
- Backend: por configurar (Render) — definir `FRONTEND_URL` con la URL del frontend
- PostgreSQL: por configurar (Neon) — definir `DATABASE_URL` en el backend

## Despliegue en producción (Netlify + Render + Neon)

### 1. Base de datos (Neon)
- Crear un proyecto y una base de datos `boxmotor` en Neon.
- Copiar la cadena de conexión (con SSL) → variable `DATABASE_URL` del backend.

### 2. Backend (Render)
- Conectar el repositorio GitHub a Render como servicio Web (Node).
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Variables de entorno en el panel de Render:
  - `DATABASE_URL` (de Neon)
  - `FRONTEND_URL` (URL del frontend en Netlify)
  - `JWT_SECRET` (secreto fuerte, generar en el panel)
  - `NODE_ENV=production`
  - `PORT=4000`
  - `ADMIN_BOOTSTRAP_EMAIL` y `ADMIN_BOOTSTRAP_PASSWORD` (opcionales, solo para bootstrap inicial)
- Ejecutar migración en la consola de Render: `npm run migrate` (aplica `backend/migrations/001_initial.sql`).

### 3. Frontend (Netlify)
- Conectar el repositorio GitHub a Netlify.
- Base directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Variable de entorno: `VITE_API_URL` (URL del backend en Render).

### 4. CORS
El backend acepta peticiones desde el origen configurado en `FRONTEND_URL`. Asegúrate de que coincida con la URL de Netlify.

## Documentación de API

Todos los endpoints están documentados en `docs/API.md`. Los contratos incluyen método, ruta, parámetros, body, respuesta, errores, código HTTP, autenticación y permisos.

## Enlaces obligatorios

- SPEC.md: especificación con reglas de negocio R-001 a R-044.
- AGENTS.md: reglas de los agentes de desarrollo.
- PLAN.md: plan técnico completo.
- TASKS.md: división de tareas con estados y commits.
- docs/TEST_REPORT.md: informe de pruebas (pendiente de completar tras el despliegue).

## Limitaciones conocidas

- Pagos online, facturación electrónica (AFIP/ARCA), integración con seguros y compra automática de repuestos están excluidos del alcance inicial (documentados como mejoras futuras en SPEC.md).
- Las URLs de despliegue público se completan una vez publicados frontend, backend y base de datos.

## Licencia

Proyecto académico de demostración — Generación T.
