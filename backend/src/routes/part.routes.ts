import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { partCreateSchema, partUpdateSchema } from '../validators/index.js';
import { partController } from '../controllers/partController.js';

const router = Router();

router.get('/', authenticate, partController.list);
router.get('/:id', authenticate, partController.getById);
router.get('/code/:code', authenticate, partController.getByCode);
router.post('/', authenticate, authorize('ADMIN'), validate(partCreateSchema), partController.create);
router.put('/:id', authenticate, authorize('ADMIN'), validate(partUpdateSchema), partController.update);
router.patch('/:id/active', authenticate, authorize('ADMIN'), validate(partUpdateSchema), partController.setActive);

export default router;

