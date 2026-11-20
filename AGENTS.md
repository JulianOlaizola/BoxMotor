# AGENTS.md — BoxMotor

## Contexto del proyecto

BoxMotor es una plataforma integral de gestión de talleres mecánicos multimarca. Stack: frontend React + TypeScript + Vite + React Router; backend Node.js + Express + TypeScript + PostgreSQL; pruebas Vitest + Supertest + Playwright. Documentación obligatoria: SPEC.md, AGENTS.md, PLAN.md, TASKS.md, README.md, docs/TEST_REPORT.md.

## Objetivos

Entregar el Trabajo Práctico Final de Generación T completo, funcional, documentado y publicado en internet. Backend y base de datos accesibles sin que la profesora descargue el proyecto.

## Arquitectura

Capas separadas (backend): Routes → Controllers → Services → Repositories → Database (PostgreSQL, pg). Middlewares de autenticación, autorización por rol, manejo centralizado de errores y validación (Zod). Frontend: Pages → Components → Hooks → Services (API capa) → Types. Transacciones para operaciones complejas. Reloj controlable inyectable para tests.

## Estructura de carpetas

```
/frontend   → src/pages, src/components, src/hooks, src/services, src/types, src/utils, vite.config.ts
/backend    → src/routes, src/controllers, src/services, src/repositories, src/middlewares, src/validators, src/config, src/db, migrations, tests
/docs       → TEST_REPORT.md, API documentation
SPEC.md, AGENTS.md, PLAN.md, TASKS.md, README.md, .gitignore, .env.example
```

## Fuente de verdad

SPEC.md es la definición del comportamiento del negocio. Antes de implementar o cambiar una funcionalidad, actualizar SPEC.md y luego el código. El código debe respetar la especificación.

## Reglas para modificar la SPEC

- Cualquier cambio de regla de negocio debe reflejarse primero en SPEC.md.
- Cada regla debe tener identificador R-XXX, descripción, actor, condiciones previas, comportamiento, excepciones y criterios de aceptación.
- Cada regla debe tener pruebas asociadas.

## Reglas de seguridad

- No incluir secretos en el repositorio: contraseñas, tokens, API keys, cadenas de conexión, claves privadas, .env.
- .env y .env.* ignorados por Git; .env.example con valores ficticios.
- Contraseñas hasheadas con bcrypt (costo 10).
- JWT con expiración y secreto fuerte.
- CORS al origen del frontend.
- Validación obligatoria en backend (no confiar solo en frontend).
- Endpoints protegidos por rol.
- No exponer secretos en logs ni respuestas.

## Reglas de testing

- Ciclo Rojo → Verde → Refactor. Primero test que falle, luego implementar, luego refactorizar.
- Tests unitarios: validaciones, reglas de negocio, estado.
- Tests de integración: endpoints, autenticación, autorización, persistencia, restricciones, transacciones.
- Tests frontend: formularios, navegación, rutas protegidas, roles, tablas, estados de carga.
- Tests E2E: flujo completo cliente → mecánico → admin.
- Tests de concurrencia: doble solicitud mismo recurso, stock doble consumo.
- No desactivar pruebas para que pasen.
- Base de datos independiente de producción para tests.

## Reglas de Git

- Un commit por tarea. No acumular todo en un solo commit.
- Revisar diffs antes de confirmar.
- Mensajes convencionales: feat(...), fix(...), docs(...), test(...), chore(...).
- Registrar hash de cada commit en TASKS.md.
- No comandos destructivos indiscriminados.
- No sobrescribir ni eliminar trabajo ajeno.

## Restricciones de dependencias

- No instalar dependencias innecesarias.
- No instalar MCP ni conectores externos.
- Usar herramientas nativas de OpenCode, Git y terminal.

## Prohibiciones

- No exponer credenciales.
- No destruir datos existentes.
- No ejecutar operaciones peligrosas sobre producción.
- No publicar secretos.
- No autorizar servicios pagos sin consentimiento.
- No simular conexiones exitosas.
- No dejar datos operativos solo en memoria.
- No dejar reglas sin implementar.
- No dejar botones sin funcionar.
- No dejar pantallas incompletas.
- No desactivar pruebas.
- No hacer commits sin revisar cambios.

## Condiciones para marcar una tarea como completada

- Implementación hecha y revisada.
- Pruebas asociadas pasando.
- Commit realizado y hash registrado en TASKS.md.
- Documentación actualizada si aplica.

## Revisión por QA

El agente de QA realiza una revisión independiente y reporta problemas antes de dar por cerrada una tarea.
