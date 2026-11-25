# ODD Feature: BoxMotor — Plataforma de gestión de talleres mecánicos multimarca

## Objetivo
Entregar el Trabajo Práctico Final de Generación T completo, funcional, documentado y publicado en internet: backend (Node/Express/TS + PostgreSQL), frontend (React/TS/Vite), migraciones, pruebas, despliegue y repositorio público en GitHub.

## Problema
Los talleres mecánicos gestionan operaciones con herramientas separadas, provocando pérdida de historial, turnos superpuestos, presupuestos poco claros, reparaciones sin autorización, errores de inventario y falta de trazabilidad.

## Alcance
Tres roles (CLIENT, MECHANIC, RECEPTIONIST/ADMIN), clientes, vehículos, servicios, mecánicos, boxes, turnos, órdenes de trabajo, diagnósticos, presupuestos con aprobación, inventario de repuestos, auditoría, estadísticas. Excluidos: pagos online, facturación AFIP, seguros.

## Reglas de negocio
SPEC.md define R-001 a R-044. Cada regla tiene pruebas asociadas.

## Checklist de tareas
Ver TASKS.md (T-001 a T-027). Cada tarea se cierra con implementación, pruebas, revisión y commit en la rama feature.

## Autorizado
Implementación completa (usuario solicitó producto terminado, no propuesta).

## Criterios de aceptación
- Repositorio público en GitHub con todo el código y documentación.
- Frontend publicado con todas las pantallas funcionando.
- Backend publicado con API operativa.
- PostgreSQL publicado con migraciones y datos de demostración.
- Documentación obligatoria completa (README, SPEC, AGENTS, PLAN, TASKS, TEST_REPORT).
- Un commit por tarea, hashes registrados en TASKS.md.
- Todos los tests pasando.
- Sin secretos expuestos.
- Aplicación verificada desde internet.

## Ruta
Rama principal: `main`. Commits en `main` (work-unit commits). Push y creación de PR son decisión del usuario.
