/**
 * Tipos de entidades del dominio (mapeados a filas de PostgreSQL en camelCase).
 * Las columnas de BD son snake_case; se convierten al leer con camelizeKeys.
 */

/** ComÃºn */
export interface BaseEntity {
  id: string;
  created_at: Date;
}

export type Role = 'CLIENT' | 'MECHANIC' | 'RECEPTIONIST' | 'ADMIN';

export interface User extends BaseEntity {
  email: string;
  password_hash: string;
  role: Role;
  first_name: string;
  last_name: string;
  active: boolean;
}

export interface Customer extends BaseEntity {
  user_id: string;
  phone?: string | null;
  address?: string | null;
}

export interface Vehicle extends BaseEntity {
  customer_id: string;
  brand: string;
  model: string;
  version?: string | null;
  year: number;
  plate_norm: string;
  plate_raw: string;
  mileage: number;
  fuel?: string | null;
  transmission?: string | null;
  vin?: string | null;
  observations?: string | null;
}

export interface VehicleMileageHistory extends BaseEntity {
  vehicle_id: string;
  mileage: number;
  recorded_at: Date;
  recorded_by?: string | null;
}

export interface Mechanic extends BaseEntity {
  user_id?: string | null;
  specialties: string[];
  active: boolean;
}

export interface MechanicService {
  mechanic_id: string;
  service_id: string;
}

export interface Service extends BaseEntity {
  name: string;
  description?: string | null;
  duration_min: number;
  labor_price: number;
  active: boolean;
}

export interface WorkshopHour extends BaseEntity {
  day_of_week: number;
  open_time: string;
  close_time: string;
  active: boolean;
}

export interface WorkshopBay extends BaseEntity {
  name: string;
  characteristics?: string | null;
  active: boolean;
}

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'CONVERTED_TO_WORK_ORDER';

export interface Appointment extends BaseEntity {
  customer_id: string;
  vehicle_id: string;
  service_id: string;
  mechanic_id?: string | null;
  bay_id?: string | null;
  starts_at: Date;
  ends_at: Date;
  status: AppointmentStatus;
  reason?: string | null;
  problem_description?: string | null;
}

export type WorkOrderStatus =
  | 'RECEIVED'
  | 'DIAGNOSIS'
  | 'WAITING_APPROVAL'
  | 'WAITING_PARTS'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export interface WorkOrder extends BaseEntity {
  customer_id: string;
  vehicle_id: string;
  appointment_id?: string | null;
  mechanic_id?: string | null;
  bay_id?: string | null;
  mileage_in: number;
  status: WorkOrderStatus;
  problem: string;
  observations?: string | null;
  mileage_out?: number | null;
  delivered_at?: Date | null;
  updated_at: Date;
}

export interface WorkOrderStatusHistory extends BaseEntity {
  work_order_id: string;
  from_status?: string | null;
  to_status: string;
  changed_by?: string | null;
  changed_at: Date;
  notes?: string | null;
}

export interface Diagnostic extends BaseEntity {
  work_order_id: string;
  mechanic_id: string;
  identified_problem: string;
  observations?: string | null;
  possible_causes?: string | null;
  recommended_repairs?: string | null;
  priority: string;
}

export interface WorkOrderItem extends BaseEntity {
  work_order_id: string;
  part_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type EstimateStatus = 'DRAFT' | 'SENT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface Estimate extends BaseEntity {
  work_order_id: string;
  version: number;
  labor_total: number;
  parts_total: number;
  total: number;
  status: EstimateStatus;
  issued_at: Date;
  expires_at: Date;
  notes?: string | null;
  customer_id: string;
}

export interface EstimateVersion {
  estimate_id: string;
  version: number;
  total: number;
  status: string;
  issued_at: Date;
}

export interface EstimateItem extends BaseEntity {
  estimate_id: string;
  version: number;
  part_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type MovementType = 'ingreso' | 'consumo' | 'ajuste' | 'reserva' | 'liberacion';

export interface Part extends BaseEntity {
  code: string;
  name: string;
  description?: string | null;
  brand?: string | null;
  category?: string | null;
  price: number;
  quantity_available: number;
  min_stock: number;
  active: boolean;
}

export interface InventoryMovement extends BaseEntity {
  part_id: string;
  type: MovementType;
  quantity: number;
  reference_type?: string | null;
  reference_id?: string | null;
  user_id?: string | null;
}

export interface PartReservation extends BaseEntity {
  estimate_id?: string | null;
  work_order_id?: string | null;
  part_id: string;
  quantity: number;
  status: string;
  released_at?: Date | null;
}

export interface AuditLog extends BaseEntity {
  user_id?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  old_values?: unknown;
  new_values?: unknown;
}

export interface BusinessSetting extends BaseEntity {
  key: string;
  value: string;
  description?: string | null;
}

/** Resultado paginado */
export interface Paged<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Convierte claves snake_case -> camelCase (nivel superficial).
 * Las filas de pg vienen en snake_case; las capas superiores usan camelCase.
 */
export function camelizeKeys(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camel = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
    out[camel] = value;
  }
  return out;
}

export function camelizeRows(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((r) => camelizeKeys(r as Record<string, unknown>));
}

