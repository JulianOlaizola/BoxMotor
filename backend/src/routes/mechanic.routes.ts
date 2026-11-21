import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { mechanicCreateSchema, mechanicUpdateSchema } from '../validators/index.js';
import { mechanicController } from '../controllers/mechanicController.js';

const router = Router();

router.get('/', authenticate, mechanicController.list);
router.get('/:id', authenticate, mechanicController.getById);
router.post('/', authenticate, authorize('ADMIN'), validate(mechanicCreateSchema), mechanicController.create);
router.put('/:id', authenticate, authorize('ADMIN'), validate(mechanicUpdateSchema), mechanicController.update);
router.patch('/:id/active', authenticate, authorize('ADMIN'), validate(mechanicUpdateSchema), mechanicController.setActive);
router.get('/:id/specialties', authenticate, mechanicController.getSpecialties);

export default router;

