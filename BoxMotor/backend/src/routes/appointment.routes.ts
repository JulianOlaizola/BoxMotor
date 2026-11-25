import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  appointmentCreateSchema, appointmentConfirmSchema, availabilityQuerySchema,
} from '../validators/index.js';
import { appointmentController } from '../controllers/appointmentController.js';

const router = Router();

router.get('/', authenticate, appointmentController.list);
router.get('/availability', authenticate, validate(availabilityQuerySchema, 'query'), appointmentController.availability);
router.post('/', authenticate, validate(appointmentCreateSchema), appointmentController.create);
router.get('/:id', authenticate, appointmentController.getById);
router.post('/:id/confirm', authenticate, authorize('RECEPTIONIST', 'ADMIN'), validate(appointmentConfirmSchema), appointmentController.confirm);
router.post('/:id/cancel', authenticate, appointmentController.cancel);

export default router;

