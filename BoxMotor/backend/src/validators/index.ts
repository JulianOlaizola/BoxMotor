import { z } from 'zod';

const uuid = z.string().uuid();
const email = z.string().email({ message: 'Email invalido' });
const password = z.string().min(8, { message: 'La contrasena debe tener al menos 8 caracteres' });
const dateTime = z.preprocess(
  (val) => (val === undefined || val === null ? undefined : new Date(val as string)),
  z.date().optional()
);
const dateTimeRequired = z.preprocess(
  (val) => new Date(val as string),
  z.date()
);
const nonNegInt = z.preprocess(
  (val) => (val === undefined || val === null ? undefined : Number(val)),
  z.number().int().nonnegative()
);
const posInt = z.preprocess(
  (val) => (val === undefined || val === null ? undefined : Number(val)),
  z.number().int().positive()
);
const nonNegDecimal = z.preprocess(
  (val) => (val === undefined || val === null ? undefined : Number(val)),
  z.number().nonnegative()
);
const bool = z.preprocess(
  (val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  },
  z.boolean().optional()
);

/** Auth */
export const authRegisterSchema = z.object({
  email,
  password,
  firstName: z.string().min(1, { message: 'Nombre obligatorio' }),
  lastName: z.string().min(1, { message: 'Apellido obligatorio' }),
  phone: z.string().optional(),
  address: z.string().optional(),
});
export const authLoginSchema = z.object({ email, password });

/** Users */
export const userUpdateSchema = z.object({
  email: email.optional(),
  role: z.enum(['CLIENT', 'MECHANIC', 'RECEPTIONIST', 'ADMIN']).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  active: bool,
});
export const userSetActiveSchema = z.object({ active: z.boolean() });

/** Customers */
export const customerCreateSchema = z.object({
  userId: uuid,
  phone: z.string().optional(),
  address: z.string().optional(),
});
export const customerUpdateSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
});

/** Vehicles */
export const vehicleCreateSchema = z.object({
  customerId: uuid,
  brand: z.string().min(1),
  model: z.string().min(1),
  version: z.string().optional().nullable(),
  year: posInt.refine((y) => y >= 1900, { message: 'Anio invalido' }),
  plateRaw: z.string().min(1),
  mileage: nonNegInt.optional(),
  fuel: z.string().optional().nullable(),
  transmission: z.string().optional().nullable(),
  vin: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
});
export const vehicleUpdateSchema = z.object({
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  version: z.string().optional().nullable(),
  year: posInt.optional(),
  plateRaw: z.string().min(1).optional(),
  mileage: nonNegInt.optional(),
  fuel: z.string().optional().nullable(),
  transmission: z.string().optional().nullable(),
  vin: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
});

/** Mechanics */
export const mechanicCreateSchema = z.object({
  userId: uuid.optional(),
  specialties: z.array(uuid).optional(),
  active: bool,
});
export const mechanicUpdateSchema = z.object({
  specialties: z.array(uuid).optional(),
  active: bool,
});

/** Services */
export const serviceCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  durationMin: posInt,
  laborPrice: nonNegDecimal,
  active: bool,
});
export const serviceUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  durationMin: posInt.optional(),
  laborPrice: nonNegDecimal.optional(),
  active: bool,
});

/** Bays */
export const bayCreateSchema = z.object({
  name: z.string().min(1),
  characteristics: z.string().optional().nullable(),
  active: bool,
});
export const bayUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  characteristics: z.string().optional().nullable(),
  active: bool,
});

/** Workshop hours */
export const workshopHoursUpsertSchema = z.object({
  dayOfWeek: posInt.refine((d) => d >= 0 && d <= 6, { message: 'Dia de la semana invalido (0-6)' }),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Formato HH:MM' }),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Formato HH:MM' }),
  active: bool,
});

/** Appointments */
export const appointmentCreateSchema = z.object({
  vehicleId: uuid,
  serviceId: uuid,
  mechanicId: uuid,
  bayId: uuid,
  startsAt: dateTimeRequired,
  endsAt: dateTime,
  reason: z.string().optional().nullable(),
  problemDescription: z.string().optional().nullable(),
});
export const appointmentConfirmSchema = z.object({
  mechanicId: uuid.optional().nullable(),
  bayId: uuid.optional().nullable(),
});
export const availabilityQuerySchema = z.object({
  serviceId: uuid,
  date: z.string(),
  mechanicId: uuid.optional().nullable(),
  bayId: uuid.optional().nullable(),
});

/** Work orders */
export const workOrderCreateSchema = z.object({
  appointmentId: uuid,
  mechanicId: uuid,
  mileageIn: nonNegInt,
  problem: z.string().min(1),
  observations: z.string().optional().nullable(),
});
export const workOrderTransitionSchema = z.object({
  toStatus: z.enum([
    'RECEIVED', 'DIAGNOSIS', 'WAITING_APPROVAL', 'WAITING_PARTS',
    'IN_PROGRESS', 'QUALITY_CHECK', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED',
  ]),
  notes: z.string().optional().nullable(),
});
export const workOrderDeliverSchema = z.object({
  mileageOut: nonNegInt,
  observations: z.string().optional().nullable(),
});

/** Diagnostics */
export const diagnosticCreateSchema = z.object({
  workOrderId: uuid,
  mechanicId: uuid,
  identifiedProblem: z.string().min(1),
  observations: z.string().optional().nullable(),
  possibleCauses: z.string().optional().nullable(),
  recommendedRepairs: z.string().optional().nullable(),
  priority: z.enum(['BAJA', 'MEDIA', 'ALTA']).optional(),
});

/** Estimates */
export const estimateItemSchema = z.object({
  partId: uuid,
  quantity: posInt,
});
export const estimateCreateSchema = z.object({
  workOrderId: uuid,
  laborTotal: nonNegDecimal,
  notes: z.string().optional().nullable(),
  issuedAt: dateTime,
  items: z.array(estimateItemSchema).min(1, { message: 'Al menos un item' }),
});
export const estimateNewVersionSchema = z.object({
  laborTotal: nonNegDecimal,
  notes: z.string().optional().nullable(),
  issuedAt: dateTime,
  items: z.array(estimateItemSchema).min(1, { message: 'Al menos un item' }),
});

/** Parts */
export const partCreateSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  price: nonNegDecimal,
  quantityAvailable: nonNegInt.optional(),
  minStock: nonNegInt.optional(),
  active: bool,
});
export const partUpdateSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  price: nonNegDecimal.optional(),
  quantityAvailable: nonNegInt.optional(),
  minStock: nonNegInt.optional(),
  active: bool,
});

/** Inventory */
export const inventoryIngresoSchema = z.object({
  partId: uuid,
  quantity: posInt,
  userId: uuid.optional().nullable(),
  referenceType: z.string().optional().nullable(),
  referenceId: uuid.optional().nullable(),
});
export const inventoryConsumeDirectSchema = z.object({
  partId: uuid,
  quantity: posInt,
  userId: uuid.optional().nullable(),
  referenceType: z.string().optional().nullable(),
  referenceId: uuid.optional().nullable(),
});
export const inventoryConsumeReservationSchema = z.object({
  reservationId: uuid,
  userId: uuid.optional().nullable(),
});
export const inventoryAdjustSchema = z.object({
  partId: uuid,
  quantityAvailable: nonNegInt,
  userId: uuid.optional().nullable(),
  reason: z.string().optional().nullable(),
});

