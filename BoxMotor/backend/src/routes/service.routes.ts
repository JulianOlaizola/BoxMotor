import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { serviceCreateSchema, serviceUpdateSchema } from '../validators/index.js';
import { serviceController } from '../controllers/serviceController.js';

const router = Router();

router.get('/', authenticate, serviceController.list);
router.get('/:id', authenticate, serviceController.getById);
router.post('/', authenticate, authorize('ADMIN', 'RECEPTIONIST'), validate(serviceCreateSchema), serviceController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'RECEPTIONIST'), validate(serviceUpdateSchema), serviceController.update);

export default router;

