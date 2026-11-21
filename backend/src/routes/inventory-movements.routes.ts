import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  inventoryIngresoSchema, inventoryConsumeDirectSchema,
  inventoryConsumeReservationSchema, inventoryAdjustSchema,
} from '../validators/index.js';
import { inventoryController } from '../controllers/inventoryController.js';

const router = Router();

router.post('/ingreso', authenticate, authorize('ADMIN', 'RECEPTIONIST'), validate(inventoryIngresoSchema), inventoryController.ingreso);
router.post('/consume', authenticate, validate(inventoryConsumeDirectSchema), inventoryController.consumeDirect);
router.post('/consume-reservation', authenticate, validate(inventoryConsumeReservationSchema), inventoryController.consumeReservation);
router.post('/adjust', authenticate, authorize('ADMIN', 'RECEPTIONIST'), validate(inventoryAdjustSchema), inventoryController.adjust);
router.get('/', authenticate, inventoryController.listMovements);

export default router;

