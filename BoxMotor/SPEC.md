# SPEC.md — BoxMotor

> Plataforma integral de gestión de talleres mecánicos multimarca.
> Trabajo Práctico Final — Generación T.
> Fuente de verdad del proyecto. Toda regla de negocio numerada aquí es verificable y tiene pruebas asociadas.

---

## 1. Descripción del producto

BoxMotor es una aplicación web que digitaliza y centraliza las operaciones de un taller mecánico multimarca, desde que un cliente registra su vehículo y solicita un turno hasta que el vehículo es diagnosticado, presupuestado, reparado y entregado.

El sistema permite administrar clientes, vehículos, mecánicos, servicios, repuestos, inventario, presupuestos y órdenes de trabajo, con tres roles de usuario: cliente, mecánico y administrador/recepcionista.

## 2. Problema que resuelve

Muchos talleres gestionan sus operaciones con herramientas separadas, anotaciones o planillas. Esto provoca pérdida de historial de vehículos, turnos superpuestos, confusión sobre estados de reparación, presupuestos poco claros, reparaciones sin autorización, errores de inventario y falta de trazabilidad. BoxMotor centraliza estas operaciones.

## 3. Alcance

Aplicación web para un taller mecánico ficticio con tres tipos de usuarios:

- **Cliente**: registra vehículos, solicita turnos, consulta presupuestos, autoriza reparaciones, sigue estado de trabajos.
- **Mecánico**: consulta vehículos asignados, revisa órdenes de trabajo, registra diagnósticos, actualiza tareas, completa inspecciones.
- **Administrador / Recepcionista**: administra clientes, vehículos, turnos, mecánicos, órdenes de trabajo, presupuestos, servicios, repuestos e inventario.

Excluido inicialmente: pagos online, integración bancaria, facturación electrónica AFIP/ARCA, seguros, valuación automotor, compra automática de repuestos.

## 4. Actores

| Actor | Descripción |
|-------|-------------|
| Cliente | Persona dueña de uno o más vehículos que usa el taller. |
| Mecánico | Empleado del taller que realiza diagnósticos y reparaciones. |
| Recepcionista | Empleado operativo que atiende clientes, crea turnos, órdenes y presupuestos. |
| Administrador | Empleado con permisos completos, incluida gestión de usuarios, mecánicos, servicios, repuestos y configuración. |

## 5. Roles

`CLIENT`, `MECHANIC`, `RECEPTIONIST`, `ADMIN`.

## 6. Casos de uso

- Registrar usuario / iniciar sesión / cerrar sesión
- Registrar / editar / eliminar vehículo (cliente)
- Consultar historial de vehículo
- Solicitar turno
- Consultar turnos propios
- Cancelar turno (hasta 24 hs antes)
- Gestionar disponibilidad de mecánicos y boxes (admin/recepcionista)
- Confirmar / rechazar turno
- Crear orden de trabajo
- Registrar diagnóstico
- Crear presupuesto
- Aprobar / rechazar presupuesto (cliente)
- Reservar repuestos
- Consumir repuestos
- Cambiar estado de orden de trabajo
- Control de calidad
- Registrar entrega de vehículo
- Consultar estadísticas
- Auditar operaciones administrativas

## 7. Flujos principales

1. Cliente se registra e inicia sesión.
2. Cliente registra un vehículo.
3. Cliente solicita un turno (vehículo, servicio, fecha, horario, problema).
4. Admin/recepcionista confirma el turno (asigna mecánico y box).
5. Vehículo ingresa al taller → se crea orden de trabajo.
6. Mecánico registra diagnóstico.
7. Admin crea presupuesto → cliente lo aprueba.
8. Se reservan los repuestos del presupuesto.
9. Mecánico realiza la reparación y registra componentes usados.
10. Control de calidad → orden lista para retiro.
11. Entrega del vehículo (fecha, kilometraje final, observaciones).
12. Orden completada; queda en historial permanente.

## 8. Reglas de negocio numeradas

Cada regla tiene identificador, descripción, actor, condiciones previas, comportamiento esperado, excepciones y criterios de aceptación. Cada regla tiene pruebas asociadas.

### 8.1 Usuarios y permisos

**R-001. Registro de usuarios**
- Descripción: El sistema permite que los clientes se registren. Cada usuario tiene una cuenta individual.
- Actor: Cliente (no autenticado).
- Condiciones previas: Ninguna.
- Comportamiento: Recibe email, contraseña, nombre, apellido, rol CLIENT. Valida unicidad de email. Almacena contraseña con hash seguro.
- Excepciones: Email ya registrado → error 409.
- Criterios de aceptación: Se puede crear un cliente; email duplicado rechaza; contraseña no se devuelve en texto plano.

**R-002. Autenticación**
- Descripción: Los usuarios inician y cierran sesión. Contraseñas con hash seguro (bcrypt).
- Actor: Cualquier usuario registrado.
- Condiciones previas: Usuario registrado.
- Comportamiento: Login valida credenciales y devuelve JWT. Logout invalida sesión del cliente.
- Excepciones: Credenciales inválidas → 401.
- Criterios de aceptación: Login correcto devuelve token; login fallido 401; contraseña hasheada en BD.

**R-003. Roles**
- Descripción: Roles CLIENT, MECHANIC, RECEPTIONIST, ADMIN con permisos diferentes.
- Actor: Sistema.
- Condiciones previas: Ninguna.
- Comportamiento: Cada endpoint declara el rol mínimo requerido.
- Excepciones: Rol insuficiente → 403.
- Criterios de aceptación: Middleware de autorización por rol funciona.

**R-004. Protección de información**
- Descripción: Un cliente solo consulta sus propios vehículos, presupuestos, turnos e historial. Un mecánico solo accede a trabajos autorizados.
- Actor: Cliente / Mecánico.
- Condiciones previas: Autenticado.
- Comportamiento: Filtros por propietario en consultas.
- Excepciones: Intento de acceso ajeno → 403 o 404.
- Criterios de aceptación: Cliente no ve vehículos de otros clientes.

### 8.2 Clientes y vehículos

**R-005. Registro de vehículos**
- Descripción: Cada cliente registra uno o más vehículos con marca, modelo, versión, año, patente, kilometraje, combustible, transmisión, VIN opcional, observaciones.
- Actor: Cliente / Recepcionista / Admin.
- Condiciones previas: Cliente autenticado.
- Comportamiento: Crea vehículo asociado al cliente.
- Excepciones: Datos inválidos → 400.
- Criterios de aceptación: Vehículo creado con todos los campos.

**R-006. Unicidad del vehículo**
- Descripción: La patente se normaliza (mayúsculas, sin espacios/guiones) antes de guardar. No hay dos vehículos con la misma patente normalizada.
- Actor: Sistema.
- Condiciones previas: Ninguna.
- Comportamiento: Normaliza patente; restricción de unicidad en BD.
- Excepciones: Patente duplicada → 409.
- Criterios de aceptación: Patente "ABC 123" y "abc-123" se consideran iguales y rechazan la segunda.

**R-007. Historial de kilometraje**
- Descripción: El kilometraje no puede disminuir respecto del último documentado. Cualquier modificación conserva trazabilidad.
- Actor: Sistema.
- Condiciones previas: Vehículo con kilometraje previo.
- Comportamiento: Al ingresar vehículo a orden, valida kilometraje de ingreso >= último. Registra entrada en VehicleMileageHistory.
- Excepciones: Kilometraje menor → 409.
- Criterios de aceptación: No se permite kilometraje regresivo; historial conservado.

**R-008. Historial del vehículo**
- Descripción: Cada vehículo conserva historial de turnos, diagnósticos, presupuestos, reparaciones, repuestos usados, fechas de ingreso/entrega, kilometraje. No se elimina al modificar datos.
- Actor: Sistema.
- Condiciones previas: Ninguna.
- Comportamiento: Registros vinculados al vehículo persisten.
- Excepciones: Ninguna.
- Criterios de aceptación: Historial accesible y permanente.

### 8.3 Servicios del taller

**R-009. Catálogo de servicios**
- Descripción: Administrar servicios con nombre, descripción, duración estimada, precio de mano de obra, estado.
- Actor: Admin / Recepcionista.
- Condiciones previas: Autenticado con rol correspondiente.
- Comportamiento: CRUD de servicios.
- Excepciones: Servicio inexistente → 404.
- Criterios de aceptación: Listado de servicios con precio y duración.

**R-010. Servicios inactivos**
- Descripción: Un servicio inactivo no se usa para nuevas reservas. Las órdenes históricas conservan datos originales.
- Actor: Sistema.
- Condiciones previas: Servicio marcado inactivo.
- Comportamiento: Excluir servicios inactivos de selección nueva; históricos intactos.
- Excepciones: Ninguna.
- Criterios de aceptación: Servicio inactivo no aparece en opciones de turno nuevo.

### 8.4 Mecánicos y puestos de trabajo

**R-011. Gestión de mecánicos**
- Descripción: Admin registra, habilita y deshabilita mecánicos. Cada uno tiene especialidades y disponibilidad.
- Actor: Admin.
- Condiciones previas: Rol ADMIN.
- Comportamiento: CRUD de mecánicos con especialidades.
- Excepciones: Mecánico inexistente → 404.
- Criterios de aceptación: Mecánico deshabilitado no recibe trabajos.

**R-012. Asignación de trabajos**
- Descripción: Un mecánico solo recibe trabajos compatibles con sus permisos y especialidades.
- Actor: Sistema.
- Condiciones previas: Mecánico con especialidades.
- Comportamiento: Validar especialidad al asignar orden.
- Excepciones: Especialidad incompatibile → 400.
- Criterios de aceptación: No se asigna orden de frenos a mecánico sin esa especialidad.

**R-013. Puestos de trabajo**
- Descripción: El taller tiene boxes. Cada box tiene características y disponibilidad.
- Actor: Admin / Recepcionista.
- Condiciones previas: Ninguna.
- Comportamiento: CRUD de boxes.
- Excepciones: Box inexistente → 404.
- Criterios de aceptación: Box listado con estado disponible/ocupado.

**R-014. Conflictos de agenda**
- Descripción: Un mecánico no tiene dos trabajos incompatibles en el mismo intervalo. Un box no está ocupado por dos órdenes que requieran ese espacio simultáneamente.
- Actor: Sistema.
- Condiciones previas: Turnos/órdenes existentes.
- Comportamiento: Validar solapamiento de mecánico y box antes de confirmar.
- Excepciones: Conflicto → 409.
- Criterios de aceptación: Dos turnos mismo mecánico mismo horario → segundo recibe 409.

### 8.5 Turnos

**R-015. Solicitud de turnos**
- Descripción: Cliente solicita turno con vehículo, motivo, servicio, fecha, horario disponible, descripción del problema.
- Actor: Cliente.
- Condiciones previas: Cliente autenticado, vehículo propio.
- Comportamiento: Crea turno en estado PENDING.
- Excepciones: Vehículo ajeno → 403; horario no disponible → 409.
- Criterios de aceptación: Turno creado con estado PENDING.

**R-016. Disponibilidad**
- Descripción: Disponibilidad calculada con horarios del taller, horarios de mecánicos, capacidad de boxes, duración estimada, turnos existentes, bloqueos, tareas asignadas.
- Actor: Sistema.
- Condiciones previas: Horarios y boxes configurados.
- Comportamiento: Devolver horarios libres para un servicio, mecánico y fecha.
- Excepciones: Ninguna.
- Criterios de aceptación: Endpoint de disponibilidad devuelve slots libres correctos.

**R-017. Prevención de superposiciones**
- Descripción: No se permiten turnos incompatibles. Si dos solicitudes ocupan el mismo recurso, solo una se confirma. La otra recibe HTTP 409. Protección en backend y persistencia.
- Actor: Sistema.
- Condiciones previas: Turnos existentes.
- Comportamiento: Transacción con bloqueo; restricción de unicidad de recurso/intervalo en BD.
- Excepciones: Conflicto → 409.
- Criterios de aceptación: Solicitudes concurrentes al mismo slot → una 201, otra 409.

**R-018. Anticipación**
- Descripción: No se reservan turnos en el pasado. Plazo mínimo de 2 horas y horizonte máximo de 45 días. Ambos configurables.
- Actor: Sistema.
- Condiciones previas: Configuración de negocio.
- Comportamiento: Validar fecha/horario dentro de [ahora+2hs, ahora+45d].
- Excepciones: Fuera de rango → 400.
- Criterios de aceptación: Turno en el pasado rechazado; fuera de horizonte rechazado.

**R-019. Cancelación de turnos**
- Descripción: Cliente cancela sus turnos hasta 24 horas antes. Dentro de ese período, lo gestiona el establecimiento.
- Actor: Cliente / Establecimiento.
- Condiciones previas: Turno en PENDING o CONFIRMED.
- Comportamiento: Cliente cancela si falta >24hs; si falta <=24hs, rechaza y deriva al establecimiento.
- Excepciones: Turno ya cancelado/completado → 400.
- Criterios de aceptación: Cancelación >24hs antes permitida; <=24hs rechazada para cliente.

**R-020. Estados de los turnos**
- Descripción: PENDING, CONFIRMED, CANCELLED, NO_SHOW, CONVERTED_TO_WORK_ORDER. Transiciones válidas y permisos definidos.
- Actor: Sistema.
- Condiciones previas: Turno existente.
- Comportamiento: Máquina de estados con transiciones permitidas.
- Excepciones: Transición inválida → 400.
- Criterios de aceptación: PENDING→CONFIRMED (admin), PENDING→CANCELLED (cliente), CONFIRMED→CONVERTED_TO_WORK_ORDER.

### 8.6 Órdenes de trabajo

**R-021. Creación de órdenes**
- Descripción: Una recepción de vehículo genera orden de trabajo con cliente, vehículo, turno, mecánico, box, kilometraje de ingreso, fecha, problema declarado, observaciones.
- Actor: Recepcionista / Admin.
- Condiciones previas: Vehículo en taller.
- Comportamiento: Crea orden en estado RECEIVED.
- Excepciones: Vehículo inexistente → 404.
- Criterios de aceptación: Orden creada vinculada a vehículo y turno.

**R-022. Diagnóstico**
- Descripción: Mecánico registra diagnóstico con problema identificado, observaciones, causas posibles, reparaciones recomendadas, prioridad.
- Actor: Mecánico.
- Condiciones previas: Orden asignada al mecánico.
- Comportamiento: Crea diagnóstico vinculado a orden.
- Excepciones: Orden no asignada → 403.
- Criterios de aceptación: Diagnóstico creado y vinculado.

**R-023. Máquina de estados**
- Descripción: Estados RECEIVED, DIAGNOSIS, WAITING_APPROVAL, WAITING_PARTS, IN_PROGRESS, QUALITY_CHECK, READY_FOR_PICKUP, COMPLETED, CANCELLED. Transiciones permitidas. No RECEIVED→COMPLETED directo.
- Actor: Sistema.
- Condiciones previas: Orden existente.
- Comportamiento: Validar transición permitida.
- Excepciones: Transición inválida → 400.
- Criterios de aceptación: Secuencia válida respetada; salto directo bloqueado.

**R-024. Trazabilidad**
- Descripción: Cada cambio de estado conserva estado anterior, nuevo, usuario responsable, fecha/hora, observaciones.
- Actor: Sistema.
- Condiciones previas: Cambio de estado.
- Comportamiento: Registrar en WorkOrderStatusHistory.
- Excepciones: Ninguna.
- Criterios de aceptación: Historial de cambios accesible.

### 8.7 Presupuestos y autorizaciones

**R-025. Elaboración de presupuestos**
- Descripción: Admin o recepcionista autorizado genera presupuesto con mano de obra, repuestos, cantidades, precios unitarios, subtotales, total, observaciones, fecha de emisión, fecha de vencimiento.
- Actor: Admin / Recepcionista.
- Condiciones previas: Orden de trabajo.
- Comportamiento: Crea presupuesto en estado PENDING vinculado a orden.
- Excepciones: Orden inexistente → 404.
- Criterios de aceptación: Presupuesto con total calculado correctamente.

**R-026. Autorización del cliente**
- Descripción: No se realizan reparaciones adicionales cobrables sin autorización. Cliente aprueba o rechaza presupuesto desde su cuenta.
- Actor: Cliente.
- Condiciones previas: Presupuesto enviado al cliente.
- Comportamiento: Cliente cambia estado a APPROVED o REJECTED.
- Excepciones: Presupuesto de otro cliente → 403; vencido → 400.
- Criterios de aceptación: Cliente aprueba presupuesto; orden pasa a WAITING_PARTS o IN_PROGRESS.

**R-027. Modificaciones**
- Descripción: Si se modifica un presupuesto enviado, se genera nueva versión y se solicita autorización nuevamente. La autorización previa no habilita cambios posteriores.
- Actor: Admin / Recepcionista.
- Condiciones previas: Presupuesto existente.
- Comportamiento: Nueva versión en EstimateVersions; estado vuelve a PENDING.
- Excepciones: Ninguna.
- Criterios de aceptación: Versión anterior invalida autorización; nueva versión requiere aprobación.

**R-028. Vigencia**
- Descripción: Vigencia inicial de siete días, configurable por admin.
- Actor: Sistema.
- Condiciones previas: Configuración.
- Comportamiento: Fecha de vencimiento = emisión + 7 días (o configurado).
- Excepciones: Ninguna.
- Criterios de aceptación: Presupuesto vencido no aprobable.

**R-029. Precios históricos**
- Descripción: Presupuestos y órdenes conservan precios vigentes al momento de creación. Cambiar precio de repuesto/servicio no modifica operaciones anteriores.
- Actor: Sistema.
- Condiciones previas: Ninguna.
- Comportamiento: Precios copiados al crear items; no actualizar retroactivamente.
- Excepciones: Ninguna.
- Criterios de aceptación: Orden histórica mantiene precio original.

### 8.8 Inventario y repuestos

**R-030. Gestión de repuestos**
- Descripción: Administrar repuestos con código único, nombre, descripción, marca, categoría, precio, cantidad disponible, stock mínimo, estado.
- Actor: Admin / Recepcionista.
- Condiciones previas: Ninguna.
- Comportamiento: CRUD de repuestos.
- Excepciones: Código duplicado → 409.
- Criterios de aceptación: Repuesto creado con código único.

**R-031. Movimientos de inventario**
- Descripción: Movimientos registrados: ingreso, consumo, ajuste, reserva, liberación de reserva.
- Actor: Sistema.
- Condiciones previas: Ninguna.
- Comportamiento: Registrar en InventoryMovements con tipo, repuesto, cantidad, usuario, referencia.
- Excepciones: Ninguna.
- Criterios de aceptación: Cada movimiento tiene tipo y trazabilidad.

**R-032. Control de stock**
- Descripción: No se consumen cantidades superiores a las disponibles. Stock no negativo.
- Actor: Sistema.
- Condiciones previas: Stock disponible.
- Comportamiento: Validar stock suficiente en transacción; restricción CHECK en BD.
- Excepciones: Stock insuficiente → 409.
- Criterios de aceptación: Consumo que llevaría stock a negativo rechazado.

**R-033. Reserva de repuestos**
- Descripción: Al aprobar presupuesto, reservar repuestos necesarios. Si no hay disponibilidad, indicar qué repuestos faltan.
- Actor: Sistema.
- Condiciones previas: Presupuesto aprobado.
- Comportamiento: Crear PartReservations; descontar de disponible (reservado).
- Excepciones: Stock insuficiente → 409 con listado de faltantes.
- Criterios de aceptación: Reserva creada o error con faltantes identificados.

**R-034. Consumo de repuestos**
- Descripción: Repuestos descontados al usarse en reparación. Trazabilidad de operaciones.
- Actor: Mecánico / Sistema.
- Condiciones previas: Reserva existente.
- Comportamiento: Pass de reservado a consumido; movimiento de inventario.
- Excepciones: Reserva inexistente → 404.
- Criterios de aceptación: Stock disponible reducido tras consumo.

**R-035. Cancelación de trabajos**
- Descripción: Al cancelar reparación, repuestos reservados no consumidos se liberan. No se devuelven consumidos.
- Actor: Sistema.
- Condiciones previas: Orden cancelada.
- Comportamiento: Liberar reservas pendientes; movimiento de liberación.
- Excepciones: Ninguna.
- Criterios de aceptación: Reservas no consumidas vuelven a disponible.

### 8.9 Finalización de trabajos

**R-036. Finalización**
- Descripción: Orden solo completa cuando: tareas terminadas, repuestos registrados, no hay autorizaciones pendientes, control de calidad completado.
- Actor: Mecánico / Admin.
- Condiciones previas: Orden en QUALITY_CHECK.
- Comportamiento: Validar condiciones; pasar a COMPLETED.
- Excepciones: Condición no cumplida → 400.
- Criterios de aceptación: Orden sin calidad no pasa a COMPLETED.

**R-037. Entrega**
- Descripción: Al entregar, registrar fecha de entrega, kilometraje final, observaciones.
- Actor: Recepcionista / Admin.
- Condiciones previas: Orden READY_FOR_PICKUP.
- Comportamiento: Registrar entrega; actualizar kilometraje del vehículo.
- Excepciones: Kilometraje final < ingreso → 400.
- Criterios de aceptación: Entrega registrada con fecha y kilometraje.

**R-038. Historial**
- Descripción: Orden completada disponible permanentemente en historial del vehículo y cliente.
- Actor: Sistema.
- Condiciones previas: Orden completada.
- Comportamiento: Registros vinculados persisten.
- Excepciones: Ninguna.
- Criterios de aceptación: Historial accesible tras completar.

### 8.10 Fecha y seguridad

**R-039. Zona horaria**
- Descripción: El taller funciona en America/Argentina/Buenos_Aires. Reglas comerciales en esa zona.
- Actor: Sistema.
- Condiciones previas: Ninguna.
- Comportamiento: Todas las fechas interpretadas en esa zona.
- Excepciones: Ninguna.
- Criterios de aceptación: Fechas consistentes con zona horaria argentina.

**R-040. Reloj controlable**
- Descripción: Abstracción de reloj para tests. Permite fijar fecha, avanzar tiempo, comprobar límites sin esperar tiempo real.
- Actor: Sistema (tests).
- Condiciones previas: Ninguna.
- Comportamiento: Inyectable en servicios de fecha.
- Excepciones: Ninguna.
- Criterios de aceptación: Tests usan reloj simulado.

**R-041. Validaciones**
- Descripción: Todos los datos validan en frontend y backend.
- Actor: Sistema.
- Condiciones previas: Ninguna.
- Comportamiento: Zod schemas en backend; validación en formularios frontend.
- Excepciones: Dato inválido → 400.
- Criterios de aceptación: Endpoint rechaza datos inválidos con 400.

**R-042. Auditoría**
- Descripción: Operaciones administrativas importantes generan registros de auditoría.
- Actor: Sistema.
- Condiciones previas: Operación de admin/recepcionista.
- Comportamiento: Registrar en AuditLogs (usuario, acción, entidad, ID, fecha, datos).
- Excepciones: Ninguna.
- Criterios de aceptación: Log de auditoría accesible en admin.

**R-043. Manejo de errores**
- Descripción: Manejo correcto de validación, autenticación, permisos, conflictos, integridad y conexión.
- Actor: Sistema.
- Condiciones previas: Ninguna.
- Comportamiento: Middleware centralizado de errores; códigos HTTP apropiados.
- Excepciones: Ninguna.
- Criterios de aceptación: Errores devuelven JSON con código y mensaje.

**R-044. Persistencia**
- Descripción: Información principal en PostgreSQL. No localStorage como sustituto.
- Actor: Sistema.
- Condiciones previas: Ninguna.
- Comportamiento: Tablas, relaciones, restricciones en PostgreSQL.
- Excepciones: Ninguna.
- Criterios de aceptación: Datos persisten en PostgreSQL.

## 9. Validaciones

- Email: formato válido, único.
- Contraseña: mínimo 8 caracteres.
- Patente: alfanumérica, normalizada, única.
- VIN: opcional, alfanumérico.
- Kilometraje: entero >= 0, no regresivo.
- Año: 1900–año actual + 1.
- Precio: decimal >= 0.
- Stock: entero >= 0.
- Fechas: en zona America/Argentina/Buenos_Aires.

## 10. Estados

Turno: PENDING, CONFIRMED, CANCELLED, NO_SHOW, CONVERTED_TO_WORK_ORDER.
Orden: RECEIVED, DIAGNOSIS, WAITING_APPROVAL, WAITING_PARTS, IN_PROGRESS, QUALITY_CHECK, READY_FOR_PICKUP, COMPLETED, CANCELLED.
Presupuesto: DRAFT, SENT, PENDING, APPROVED, REJECTED, EXPIRED.
Repuesto: ACTIVE, INACTIVE.
Usuario: ACTIVE, INACTIVE.

## 11. Restricciones

- Patente única normalizada.
- Código de repuesto único.
- Email único.
- Stock >= 0 (CHECK).
- Kilometraje no regresivo.
- FK con ON DELETE restrictions para preservar historial.
- Bloqueo de recursos (mecánico/box) en intervalos superpuestos.

## 12. Excepciones

- 400: validación / transición inválida / fuera de rango.
- 401: autenticación fallida.
- 403: permiso insuficiente / acceso a recurso ajeno.
- 404: recurso no existente.
- 409: conflicto (patente duplicada, stock insuficiente, superposición, kilometraje regresivo).

## 13. Requisitos funcionales

RF-01 Registro y autenticación de usuarios con JWT.
RF-02 Gestión de clientes y vehículos con historial.
RF-03 Catálogo de servicios.
RF-04 Gestión de mecánicos, especialidades y boxes.
RF-05 Solicitud y confirmación de turnos con control de superposición.
RF-06 Órdenes de trabajo con diagnóstico y trazabilidad de estados.
RF-07 Presupuestos con aprobación del cliente y versiones.
RF-08 Inventario de repuestos con movimientos y control de stock.
RF-09 Finalización y entrega de vehículos.
RF-10 Auditoría y estadísticas.

## 14. Requisitos no funcionales

RNF-01 Backend: Node.js + Express + TypeScript.
RNF-02 Base de datos: PostgreSQL con migraciones versionadas.
RNF-03 Frontend: React + TypeScript + Vite + React Router.
RNF-04 API REST con contratos documentados.
RNF-05 Tests: Vitest + Supertest + Playwright.
RNF-06 Responsive y accesible.
RNF-07 Desplegado en internet (frontend, backend, PostgreSQL).

## 15. Criterios de aceptación

Cada regla R-001 a R-044 tiene al menos una prueba asociada (unitaria, de integración o E2E). Los tests E2E cubren el flujo completo cliente → mecánico → admin.

## 16. Requisitos de seguridad

- Contraseñas hasheadas con bcrypt (costo 10).
- JWT con expiración y secreto fuerte.
- CORS configurado al origen del frontend.
- No secretos en el repositorio (.env ignorado).
- Validación backend obligatoria (no confiar solo en frontend).
- Endpoints protegidos por rol.
- No exponer contraseñas ni tokens en logs/respuestas.

---

## Matriz Reglas → Pruebas

| Regla | Prueba unitaria | Prueba integración | Prueba E2E |
|-------|----------------|--------------------|------------|
| R-001 | ✅ validación registro | ✅ endpoint register | ✅ flujo registro |
| R-002 | ✅ hash contraseña | ✅ login endpoint | ✅ login E2E |
| R-003 | ✅ middleware rol | ✅ endpoint protegido | |
| R-004 | ✅ filtro propietario | ✅ endpoint consulta propia | |
| R-005 | ✅ schema vehículo | ✅ crear vehículo | ✅ registrar vehículo |
| R-006 | ✅ normalización patente | ✅ patente duplicada 409 | |
| R-007 | ✅ kilometraje no regresivo | | |
| R-008 | | ✅ historial vehículo | |
| R-009 | ✅ schema servicio | ✅ CRUD servicio | |
| R-010 | ✅ filtro inactivos | | |
| R-011 | ✅ CRUD mecánico | ✅ mecánico deshabilitado | |
| R-012 | ✅ especialidad asignación | | |
| R-013 | ✅ CRUD box | | |
| R-014 | ✅ solapamiento mecánico/box | ✅ conflicto 409 | ✅ turnos concurrentes |
| R-015 | ✅ crear turno | ✅ endpoint turnos | ✅ solicitar turno |
| R-016 | ✅ disponibilidad slots | | |
| R-017 | ✅ transacción conflicto | ✅ 409 concurrente | ✅ doble solicitud |
| R-018 | ✅ rango fecha turno | ✅ fuera de rango 400 | |
| R-019 | ✅ cancelación 24hs | | |
| R-020 | ✅ máquina estados turno | | |
| R-021 | ✅ crear orden | ✅ endpoint órdenes | ✅ crear orden |
| R-022 | ✅ crear diagnóstico | | ✅ diagnóstico |
| R-023 | ✅ transiciones orden | ✅ transición inválida 400 | |
| R-024 | | ✅ historial estados | |
| R-025 | ✅ calcular total | ✅ crear presupuesto | ✅ crear presupuesto |
| R-026 | | | ✅ aprobar presupuesto |
| R-027 | ✅ nueva versión | | |
| R-028 | ✅ vigencia 7 días | | |
| R-029 | | ✅ precios históricos | |
| R-030 | ✅ código repuesto único | | |
| R-031 | | ✅ movimiento inventario | |
| R-032 | ✅ stock no negativo | ✅ stock insuficiente 409 | ✅ repuestos insuficientes |
| R-033 | | ✅ reservar repuestos | ✅ reservar tras aprobación |
| R-034 | | ✅ consumir repuesto | ✅ registrar componentes |
| R-035 | | ✅ liberar reserva | |
| R-036 | ✅ condiciones finalización | | ✅ completar orden |
| R-037 | | ✅ registrar entrega | ✅ entregar vehículo |
| R-038 | | ✅ historial permanente | |
| R-039 | | ✅ zona horaria | |
| R-040 | ✅ reloj simulado | | |
| R-041 | ✅ validación 400 | | |
| R-042 | | ✅ log auditoría | |
| R-043 | | ✅ manejo errores | |
| R-044 | | ✅ persistencia PostgreSQL | |
