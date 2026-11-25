import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { bayCreateSchema, bayUpdateSchema } from '../validators/index.js';
import { bayController } from '../controllers/bayController.js';

const router = Router();

router.get('/', authenticate, bayController.list);
router.get('/:id', authenticate, bayController.getById);
router.post('/', authenticate, authorize('ADMIN'), validate(bayCreateSchema), bayController.create);
router.put('/:id', authenticate, authorize('ADMIN'), validate(bayUpdateSchema), bayController.update);

export default router;

