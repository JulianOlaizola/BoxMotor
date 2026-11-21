import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { diagnosticCreateSchema } from '../validators/index.js';
import { diagnosticController } from '../controllers/diagnosticController.js';

const router = Router();

router.post('/', authenticate, authorize('MECHANIC'), validate(diagnosticCreateSchema), diagnosticController.create);
router.get('/work-orders/:workOrderId', authenticate, diagnosticController.listByWorkOrder);

export default router;

