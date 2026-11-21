# Informe de pruebas — BoxMotor

## 1. Fecha de ejecución
20/11/2026 (versión inicial publicada en repositorio público).

## 2. Versión y commit
- Commit: `ca493b6` (HEAD de `master`)
- Repositorio: https://github.com/JulianOlaizola/BoxMotor

## 3. Herramientas
- Vitest 2.1.4 (unitario + integración backend)
- Supertest 7.0.0 (endpoints backend)
- TypeScript 5.6.3 (`tsc --noEmit`)

## 4. Tests unitarios
| Suite | Archivo | Resultado |
|-------|---------|-----------|
| Validación de esquemas de autenticación | backend/tests/auth.schemas.test.ts | ✅ 6/6 pasando |

## 5. Tests de integración
| Suite | Estado | Nota |
|-------|--------|------|
| Registro / login / JWT / roles | pendiente | Requieren base de datos de tests |
| CRUD vehículos / patente duplicada | pendiente | Requieren base de datos de tests |
| Turnos / superposición 409 | pendiente | Requieren base de datos de tests |
| Órdenes / transiciones de estado | pendiente | Requieren base de datos de tests |
| Presupuestos / aprobación | pendiente | Requieren base de datos de tests |
| Inventario / stock negativo | pendiente | Requieren base de datos de tests |

## 6. Tests del frontend
| Suite | Estado |
|-------|--------|
| Navegación, formularios, rutas protegidas | pendiente |

## 7. Tests end-to-end
| Recorrido | Estado |
|-----------|--------|
| Cliente: registro → login → vehículo → turno → presupuesto → aprobación → reparación → entrega | pendiente (Playwright) |

## 8. Tests de concurrencia
| Caso | Estado |
|------|--------|
| Dos turnos mismo mecánico/box mismo horario (uno 409) | pendiente |
| Doble consumo mismo stock | pendiente |

## 9. Tests de inventario
| Caso | Estado |
|------|--------|
| Stock no negativo, reservas, consumos, liberaciones | pendiente |

## 10. Tests de permisos
| Caso | Estado |
|------|--------|
| CLIENT no ve recursos ajenos, MECHANIC solo asignados | pendiente |

## 11. Tests de persistencia
| Caso | Estado |
|------|--------|
| Migraciones aplican, restricciones UNIQUE/CHECK, FK | pendiente |

## 12. Resultado de cada suite
- `tests/auth.schemas.test.ts`: ✅ 6 pruebas pasando (6 aprobadas, 0 fallidas).
- Resto de suites: NO EJECUTADAS aún (requieren base de datos de tests independiente y Playwright).

## 13. Pruebas aprobadas
6 (todas de validación de esquemas de autenticación).

## 14. Pruebas fallidas
0.

## 15. Problemas detectados
- Falta configurar base de datos de tests independiente de producción para suites de integración.
- Falta implementar pruebas E2E con Playwright.

## 16. Correcciones realizadas
- Se corrigieron errores de TypeScript en el backend generados inicialmente (rutas de importación, método de repositorio de diagnóstico, tipado de migraciones).
- `tsc --noEmit` pasa sin errores en backend y frontend.

## 17. Nueva ejecución
Pendiente una vez configurada la base de datos de tests y se completen las suites restantes.

## 18. Estado final
Versión inicial publicada. Tests unitarios de auth pasando. Suites de integración, frontend, E2E, concurrencia e inventario pendientes de implementar y ejecutar.

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
| R-040 Reloj controlable | — | pendiente | — | pendiente |
| R-041 Validaciones | ✅ auth.schemas | pendiente | — | parcial |
| R-042 Auditoría | — | pendiente | — | pendiente |
| R-043 Manejo errores | — | pendiente | — | pendiente |
| R-044 Persistencia PostgreSQL | — | pendiente | — | pendiente |

Leyenda: ✅ implementado y probado | pendiente = por implementar/ejecutar | parcial = solo pruebas unitarias de auth.
