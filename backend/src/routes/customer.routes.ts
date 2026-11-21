import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { customerCreateSchema, customerUpdateSchema } from '../validators/index.js';
import { customerController } from '../controllers/customerController.js';

const router = Router();

router.get('/', authenticate, customerController.list);
router.get('/:id', authenticate, customerController.getById);
router.post('/', authenticate, authorize('ADMIN', 'RECEPTIONIST'), validate(customerCreateSchema), customerController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'RECEPTIONIST'), validate(customerUpdateSchema), customerController.update);

export default router;

