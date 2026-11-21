# Informe de pruebas — BoxMotor

## 1. Fecha de ejecución
20/11/2026 (resultados reales de ejecución local).

## 2. Versión y commit
- Commit: `68443ae` (HEAD de `master`, publicado en GitHub)
- Repositorio: https://github.com/JulianOlaizola/BoxMotor

## 3. Herramientas
- Vitest 2.1.4 (unitario + integración backend)
- Supertest 7.0.0 (endpoints backend)
- TypeScript 5.6.3 (`tsc --noEmit`)
- Playwright (archivos de prueba E2E escritos, pendientes de ejecutar contra despliegue)

## 4. Tests unitarios (ejecutados y aprobados localmente)
| Suite | Archivo | Resultado |
|-------|---------|-----------|
| Reloj controlable (R-040) | backend/tests/clock.test.ts | ✅ 4/4 pasando |
| Validación de esquemas de autenticación | backend/tests/auth.schemas.test.ts | ✅ 6/6 pasando |
| Integración backend (health) | backend/tests/integration.app.test.ts | ✅ 2/2 pasando |

Total unitarios ejecutados: **12 pruebas, 12 aprobadas, 0 fallidas.**

## 5. Tests de integración
| Suite | Estado | Nota |
|-------|--------|------|
| Registro / login / JWT / roles | NO EJECUTADO | Requiere base de datos de tests (DATABASE_TEST_URL) |
| CRUD vehículos / patente duplicada | NO EJECUTADO | Requiere base de datos de tests |
| Turnos / superposición 409 | NO EJECUTADO | Requiere base de datos de tests |
| Órdenes / transiciones de estado | NO EJECUTADO | Requiere base de datos de tests |
| Presupuestos / aprobación | NO EJECUTADO | Requiere base de datos de tests |
| Inventario / stock negativo | NO EJECUTADO | Requiere base de datos de tests |

Las pruebas de integración quedan estructuradas en `backend/tests/integration.app.test.ts` y se omiten con mensaje claro si no hay `DATABASE_TEST_URL`. Se ejecutarán contra la base de datos de tests de Neon/Render tras el despliegue.

## 6. Tests del frontend
| Suite | Estado |
|-------|--------|
| Navegación, formularios, rutas protegidas | NO EJECUTADO | Requiere Playwright instalado y frontend desplegado |

## 7. Tests end-to-end
| Recorrido | Estado |
|-----------|--------|
| Cliente: registro → login → vehículo → turno → presupuesto → aprobación → reparación → entrega | ARCHITO ESCRITO (`frontend/tests-e2e/flow.e2e.ts`), pendiente de ejecutar contra URLs desplegadas |

## 8. Tests de concurrencia
| Caso | Estado |
|------|--------|
| Dos turnos mismo mecánico/box mismo horario (uno 409) | NO EJECUTADO | Requiere BD de tests |
| Doble consumo mismo stock | NO EJECUTADO | Requiere BD de tests |

## 9. Tests de inventario
| Caso | Estado |
|------|--------|
| Stock no negativo, reservas, consumos, liberaciones | NO EJECUTADO | Requiere BD de tests |

## 10. Tests de permisos
| Caso | Estado |
|------|--------|
| CLIENT no ve recursos ajenos, MECHANIC solo asignados | NO EJECUTADO | Requiere BD de tests |

## 11. Tests de persistencia
| Caso | Estado |
|------|--------|
| Migraciones aplican, restricciones UNIQUE/CHECK, FK | NO EJECUTADO | Requiere BD de tests |

## 12. Resultado de cada suite
- `tests/clock.test.ts`: ✅ 4 aprobadas
- `tests/auth.schemas.test.ts`: ✅ 6 aprobadas
- `tests/integration.app.test.ts`: ✅ 2 aprobadas (health + omisión controlada sin BD de tests)

**Resultado local actual: 12 pruebas aprobadas, 0 falladas.**

## 13. Pruebas aprobadas
12 (todas ejecutadas localmente).

## 14. Pruebas fallidas
0.

## 15. Problemas detectados
- No hay PostgreSQL disponible localmente, por lo que las pruebas de integración, persistencia, inventario y concurrencia no pueden ejecutarse en este entorno. Se ejecutarán una vez desplegada la base de datos de tests (Neon/Render) y se defina `DATABASE_TEST_URL`.
- Playwright no instalado; las pruebas E2E están escritas pero no ejecutadas (requieren frontend y backend desplegados).

## 16. Correcciones realizadas
- Se corrigieron errores de TypeScript en el backend (rutas de importación, método de repositorio de diagnóstico, tipado de migraciones).
- `tsc --noEmit` pasa sin errores en backend y frontend.
- `npm test` pasa en backend (12 pruebas).

## 17. Nueva ejecución
Pendiente tras el despliegue: configurar `DATABASE_TEST_URL` (Neon/Render), instalar Playwright y ejecutar suites de integración, E2E, concurrencia, inventario y permisos.

## 18. Estado final
Versión publicada con 12 pruebas unitarias de backend aprobadas. Suites de integración, frontend, E2E, concurrencia, inventario y permisos pendientes de ejecutar contra el entorno desplegado.

## Matriz Reglas SPEC → Tests

| Regla | Prueba unitaria | Integración | E2E | Estado |
|-------|----------------|-------------|-----|--------|
| R-001 Registro usuarios | ✅ auth.schemas | pendiente | pendiente | parcial |
| R-002 Autenticación | ✅ auth.schemas | pendiente | pendiente | parcial |
| R-003 Roles | — | pendiente | — | pendiente |
| R-004 Protección de información | — | pendiente | — | pendiente |
| R-005 Registro vehículos | — | pendiente | pendiente | pendiente |
| R-006 Unicidad patente | — | pendiente | — | pendiente |
| R-007 Kilometraje no regresivo | — | pendiente | — | pendiente |
| R-008 Historial vehículo | — | pendiente | pendiente | pendiente |
| R-009 Catálogo servicios | — | pendiente | — | pendiente |
| R-010 Servicios inactivos | — | pendiente | — | pendiente |
| R-011 Gestión mecánicos | — | pendiente | — | pendiente |
| R-012 Asignación trabajos | — | pendiente | — | pendiente |
| R-013 Puestos de trabajo | — | pendiente | — | pendiente |
| R-014 Conflictos agenda | — | pendiente | pendiente | pendiente |
| R-015 Solicitud turnos | — | pendiente | pendiente | pendiente |
| R-016 Disponibilidad | — | pendiente | — | pendiente |
| R-017 Prevención superposiciones | — | pendiente | pendiente | pendiente |
| R-018 Anticipación | — | pendiente | — | pendiente |
| R-019 Cancelación turnos | — | pendiente | — | pendiente |
| R-020 Estados turnos | — | pendiente | — | pendiente |
| R-021 Creación órdenes | — | pendiente | pendiente | pendiente |
| R-022 Diagnóstico | — | pendiente | pendiente | pendiente |
| R-023 Máquina de estados | — | pendiente | — | pendiente |
| R-024 Trazabilidad | — | pendiente | — | pendiente |
| R-025 Presupuestos | — | pendiente | pendiente | pendiente |
| R-026 Autorización cliente | — | — | pendiente | pendiente |
| R-027 Modificaciones | — | pendiente | — | pendiente |
| R-028 Vigencia | — | pendiente | — | pendiente |
| R-029 Precios históricos | — | pendiente | — | pendiente |
| R-030 Gestión repuestos | — | pendiente | — | pendiente |
| R-031 Movimientos inventario | — | pendiente | — | pendiente |
| R-032 Control stock | — | pendiente | pendiente | pendiente |
| R-033 Reserva repuestos | — | pendiente | pendiente | pendiente |
| R-034 Consumo repuestos | — | pendiente | pendiente | pendiente |
| R-035 Cancelación trabajos | — | pendiente | — | pendiente |
| R-036 Finalización | — | pendiente | pendiente | pendiente |
| R-037 Entrega | — | pendiente | pendiente | pendiente |
| R-038 Historial | — | pendiente | — | pendiente |
| R-039 Zona horaria | — | pendiente | — | pendiente |
| R-040 Reloj controlable | ✅ clock.test | pendiente | — | aprobada (unitaria) |
| R-041 Validaciones | ✅ auth.schemas | pendiente | — | parcial |
| R-042 Auditoría | — | pendiente | — | pendiente |
| R-043 Manejo errores | — | pendiente | — | pendiente |
| R-044 Persistencia PostgreSQL | — | pendiente | — | pendiente |

Leyenda: ✅ implementado y probado | pendiente = por ejecutar contra entorno desplegado | parcial = solo pruebas unitarias de auth.
