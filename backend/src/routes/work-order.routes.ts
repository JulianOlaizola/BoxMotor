import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  workOrderCreateSchema, workOrderTransitionSchema, workOrderDeliverSchema,
} from '../validators/index.js';
import { workOrderController } from '../controllers/workOrderController.js';

const router = Router();

router.get('/', authenticate, workOrderController.list);
router.get('/:id', authenticate, workOrderController.getById);
router.post('/', authenticate, authorize('RECEPTIONIST', 'ADMIN'), validate(workOrderCreateSchema), workOrderController.createFromAppointment);
router.post('/:id/status', authenticate, validate(workOrderTransitionSchema), workOrderController.transition);
router.post('/:id/deliver', authenticate, authorize('RECEPTIONIST', 'ADMIN'), validate(workOrderDeliverSchema), workOrderController.deliver);
router.post('/:id/cancel', authenticate, workOrderController.cancel);

export default router;

