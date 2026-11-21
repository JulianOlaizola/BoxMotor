# Documentación de la API — BoxMotor

Base URL: `https://api-boxmotor...` (variable `VITE_API_URL` en el frontend).
Todos los endpoints devuelven JSON. Errores: `400` validación/transición, `401` autenticación, `403` permiso, `404` no encontrado, `409` conflicto.

## Autenticación

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| POST | /auth/register | { email, password, firstName, lastName, phone?, address? } | { token, user } | público |
| POST | /auth/login | { email, password } | { token, user } | público |
| POST | /auth/logout | — | 204 | autenticado |
| GET | /auth/me | — | { user } | autenticado |

## Usuarios

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /users | — | [user] | ADMIN |
| GET | /users/:id | — | user | ADMIN |
| PUT | /users/:id | { email?, role?, firstName?, lastName?, active? } | user | ADMIN |
| DELETE | /users/:id | — | 204 | ADMIN |

## Clientes

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /customers | — | [customer] | ADMIN / RECEPTIONIST |
| POST | /customers | { userId, phone?, address? } | customer | ADMIN / RECEPTIONIST |
| GET | /customers/:id | — | customer | ADMIN / RECEPTIONIST / propio |
| PUT | /customers/:id | { phone?, address? } | customer | ADMIN / RECEPTIONIST / propio |

## Vehículos

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /vehicles | — | [vehicle] | ADMIN / RECEPTIONIST / propio |
| POST | /vehicles | { customerId, brand, model, version?, year, plate, mileage, fuel?, transmission?, vin?, observations? } | vehicle | ADMIN / RECEPTIONIST / propio (cliente) |
| GET | /vehicles/:id | — | vehicle | ADMIN / RECEPTIONIST / propietario |
| PUT | /vehicles/:id | { ... } | vehicle | ADMIN / RECEPTIONIST / propietario |
| GET | /vehicles/:id/history | — | { turnos, diagnosticos, presupuestos, kilometraje } | propietario / ADMIN / RECEPTIONIST |

## Servicios

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /services | — | [service] | público / autenticado |
| POST | /services | { name, description, durationMin, laborPrice, active } | service | ADMIN / RECEPTIONIST |
| PUT | /services/:id | { ... } | service | ADMIN / RECEPTIONIST |

## Mecánicos

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /mechanics | — | [mechanic] | ADMIN / RECEPTIONIST |
| POST | /mechanics | { userId, specialties[], active } | mechanic | ADMIN |
| PUT | /mechanics/:id | { specialties?, active? } | mechanic | ADMIN |

## Boxes (puestos de trabajo)

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /bays | — | [bay] | ADMIN / RECEPTIONIST |
| POST | /bays | { name, characteristics?, active } | bay | ADMIN / RECEPTIONIST |
| PUT | /bays/:id | { ... } | bay | ADMIN / RECEPTIONIST |

## Horarios del taller

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /workshop-hours | — | [workshopHours] | ADMIN / RECEPTIONIST |
| POST | /workshop-hours | { dayOfWeek, openTime, closeTime, active } | workshopHours | ADMIN |
| PUT | /workshop-hours/:id | { ... } | workshopHours | ADMIN |

## Turnos

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /appointments | — | [appointment] | ADMIN / RECEPTIONIST / propio |
| POST | /appointments | { vehicleId, serviceId, mechanicId?, bayId?, startsAt, endsAt, reason?, problemDescription? } | appointment | CLIENT / ADMIN / RECEPTIONIST |
| GET | /appointments/:id | — | appointment | ADMIN / RECEPTIONIST / propietario |
| PUT | /appointments/:id | { status?, mechanicId?, bayId?, ... } | appointment | ADMIN / RECEPTIONIST |
| DELETE | /appointments/:id | — | 204 | CLIENT (hasta 24h antes) / ADMIN / RECEPTIONIST |
| GET | /appointments/availability | ?serviceId, ?mechanicId, ?bayId, ?date | [slots] | autenticado |

## Órdenes de trabajo

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /work-orders | — | [workOrder] | ADMIN / RECEPTIONIST / MECHANIC (asignadas) / propietario |
| POST | /work-orders | { customerId, vehicleId, appointmentId?, mechanicId, bayId, mileageIn, problem, observations? } | workOrder | ADMIN / RECEPTIONIST |
| GET | /work-orders/:id | — | workOrder | ADMIN / RECEPTIONIST / MECHANIC / propietario |
| PUT | /work-orders/:id | { status?, mechanicId?, bayId?, mileageOut?, deliveredAt?, observations? } | workOrder | ADMIN / RECEPTIONIST / MECHANIC |
| POST | /work-orders/:id/status | { toStatus, changedBy, notes? } | workOrder | ADMIN / RECEPTIONIST / MECHANIC |
| GET | /work-orders/:id/history | — | [statusChange] | ADMIN / RECEPTIONIST / propietario |

## Diagnósticos

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /diagnostics | — | [diagnostic] | ADMIN / RECEPTIONIST / MECHANIC |
| POST | /diagnostics | { workOrderId, mechanicId, identifiedProblem, observations?, possibleCauses?, recommendedRepairs?, priority } | diagnostic | MECHANIC (asignado) / ADMIN / RECEPTIONIST |
| GET | /diagnostics/:id | — | diagnostic | ADMIN / RECEPTIONIST / MECHANIC / propietario |

## Presupuestos

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /estimates | — | [estimate] | ADMIN / RECEPTIONIST / propietario |
| POST | /estimates | { workOrderId, laborTotal, partsTotal, items[], notes?, expiresAt? } | estimate | ADMIN / RECEPTIONIST |
| GET | /estimates/:id | — | estimate | ADMIN / RECEPTIONIST / propietario |
| PUT | /estimates/:id | { ... } | estimate | ADMIN / RECEPTIONIST |
| POST | /estimates/:id/approve | { customerId } | estimate | propietario (cliente) |
| POST | /estimates/:id/reject | { customerId } | estimate | propietario (cliente) |

## Repuestos

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /parts | — | [part] | ADMIN / RECEPTIONIST |
| POST | /parts | { code, name, description?, brand?, category?, price, quantityAvailable, minStock, active } | part | ADMIN / RECEPTIONIST |
| PUT | /parts/:id | { ... } | part | ADMIN / RECEPTIONIST |

## Movimientos de inventario

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /inventory-movements | — | [inventoryMovement] | ADMIN / RECEPTIONIST |
| POST | /inventory-movements | { partId, type, quantity, referenceType?, referenceId?, userId } | inventoryMovement | ADMIN / RECEPTIONIST |

## Reservas de repuestos

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /part-reservations | — | [partReservation] | ADMIN / RECEPTIONIST |

## Auditoría

| Método | Ruta | Body | Respuesta | Permiso |
|--------|------|------|-----------|---------|
| GET | /audit-logs | — | [auditLog] | ADMIN |

## Estadísticas

| Método | Ruta | Respuesta | Permiso |
|--------|------|-----------|---------|
| GET | /stats | { turnosPorEstado, ordenesPorEstado, ingresos, stockBajo } | ADMIN |

## Salud

| Método | Ruta | Respuesta | Permiso |
|--------|------|-----------|---------|
| GET | /health | { status, service, env } | público |

## Códigos de error

- `400`: validación fallida, transición de estado inválida, fuera de rango de anticipación.
- `401`: token ausente, expirado o inválido.
- `403`: rol insuficiente o acceso a recurso de otro usuario.
- `404`: recurso no encontrado.
- `409`: patente duplicada, código de repuesto duplicado, stock insuficiente, superposición de turno (mecánico o box), kilometraje regresivo.
