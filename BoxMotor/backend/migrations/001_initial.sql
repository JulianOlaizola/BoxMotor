-- BoxMotor - Migracion inicial (001_initial.sql)
-- Esquema completo segun PLAN.md (Entidades y modelo relacional)
-- Fuente de verdad: SPEC.md (reglas R-001 a R-044), PLAN.md seccion 5-8.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('CLIENT','MECHANIC','RECEPTIONIST','ADMIN')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_customers_user_id ON customers(user_id);

-- Vehiculos
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  version VARCHAR(100),
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  plate_norm VARCHAR(20) NOT NULL UNIQUE,
  plate_raw VARCHAR(30) NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0 CHECK (mileage >= 0),
  fuel VARCHAR(50),
  transmission VARCHAR(50),
  vin VARCHAR(50),
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX idx_vehicles_plate_norm ON vehicles(plate_norm);

-- Historial de kilometraje
CREATE TABLE vehicle_mileage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  mileage INTEGER NOT NULL CHECK (mileage >= 0),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_vehicle_mileage_history_vehicle_id ON vehicle_mileage_history(vehicle_id);

-- Mecanicos
CREATE TABLE mechanics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mechanics_active ON mechanics(active);

-- Servicios
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  duration_min INTEGER NOT NULL CHECK (duration_min > 0),
  labor_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (labor_price >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_services_active ON services(active);

-- Especialidades de mecanicos (mecanico_services)
CREATE TABLE mechanic_services (
  mechanic_id UUID NOT NULL REFERENCES mechanics(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (mechanic_id, service_id)
);

-- Horarios del taller
CREATE TABLE workshop_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (day_of_week)
);
CREATE INDEX idx_workshop_hours_day ON workshop_hours(day_of_week);

-- Boxes (puestos de trabajo)
CREATE TABLE workshop_bays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  characteristics TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_workshop_bays_active ON workshop_bays(active);

-- Turnos
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  mechanic_id UUID REFERENCES mechanics(id) ON DELETE SET NULL,
  bay_id UUID REFERENCES workshop_bays(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','NO_SHOW','CONVERTED_TO_WORK_ORDER')),
  reason VARCHAR(200),
  problem_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_mechanic ON appointments(mechanic_id);
CREATE INDEX idx_appointments_bay ON appointments(bay_id);
CREATE INDEX idx_appointments_starts_at ON appointments(starts_at);

-- Ordenes de trabajo
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  mechanic_id UUID REFERENCES mechanics(id) ON DELETE SET NULL,
  bay_id UUID REFERENCES workshop_bays(id) ON DELETE SET NULL,
  mileage_in INTEGER NOT NULL CHECK (mileage_in >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED','DIAGNOSIS','WAITING_APPROVAL','WAITING_PARTS','IN_PROGRESS','QUALITY_CHECK','READY_FOR_PICKUP','COMPLETED','CANCELLED')),
  problem TEXT NOT NULL,
  observations TEXT,
  mileage_out INTEGER CHECK (mileage_out >= 0),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_mechanic ON work_orders(mechanic_id);
CREATE INDEX idx_work_orders_bay ON work_orders(bay_id);
CREATE INDEX idx_work_orders_vehicle ON work_orders(vehicle_id);

-- Historial de estados de orden
CREATE TABLE work_order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);
CREATE INDEX idx_work_order_status_history_work_order_id ON work_order_status_history(work_order_id);

-- Diagnosticos
CREATE TABLE diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  mechanic_id UUID NOT NULL REFERENCES mechanics(id) ON DELETE RESTRICT,
  identified_problem TEXT NOT NULL,
  observations TEXT,
  possible_causes TEXT,
  recommended_repairs TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIA' CHECK (priority IN ('BAJA','MEDIA','ALTA')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_diagnostics_work_order_id ON diagnostics(work_order_id);

-- Repuestos (creado antes de las tablas que lo referencian)
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  brand VARCHAR(100),
  category VARCHAR(100),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  min_stock INTEGER NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_parts_code ON parts(code);
CREATE INDEX idx_parts_active ON parts(active);

-- Items de orden de trabajo (repuestos usados)
CREATE TABLE work_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);
CREATE INDEX idx_work_order_items_work_order_id ON work_order_items(work_order_id);

-- Presupuestos
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  labor_total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (labor_total >= 0),
  parts_total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (parts_total >= 0),
  total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('DRAFT','SENT','PENDING','APPROVED','REJECTED','EXPIRED')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT
);
CREATE INDEX idx_estimates_work_order_id ON estimates(work_order_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimates_customer_id ON estimates(customer_id);

-- Versiones de presupuesto
CREATE TABLE estimate_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL
);

-- Items de presupuesto (precios historicos copiados al crear)
CREATE TABLE estimate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);
CREATE INDEX idx_estimate_items_estimate_id ON estimate_items(estimate_id);

-- Movimientos de inventario
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE RESTRICT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('ingreso','consumo','ajuste','reserva','liberacion')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reference_type VARCHAR(50),
  reference_id UUID,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_inventory_movements_part_id ON inventory_movements(part_id);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at);

-- Reservas de repuestos
CREATE TABLE part_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID REFERENCES estimates(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','consumed','released')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at TIMESTAMPTZ
);
CREATE INDEX idx_part_reservations_part_id ON part_reservations(part_id);
CREATE INDEX idx_part_reservations_status ON part_reservations(status);

-- Notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Auditoría
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Configuracion del negocio
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT
);

-- Configuracion por defecto
INSERT INTO business_settings (key, value, description) VALUES
  ('min_anticipation_hours', '2', 'Anticipacion minima para turno (horas)'),
  ('max_anticipation_days', '45', 'Horizonte maximo para turno (dias)'),
  ('estimate_validity_days', '7', 'Vigencia inicial de presupuesto (dias)'),
  ('cancellation_hours', '24', 'Anticipacion minima para cancelar turno (horas)');
