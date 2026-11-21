import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { userUpdateSchema, userSetActiveSchema } from '../validators/index.js';
import { userController } from '../controllers/userController.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), userController.list);
router.get('/:id', authenticate, authorize('ADMIN'), userController.getById);
router.put('/:id', authenticate, authorize('ADMIN'), validate(userUpdateSchema), userController.update);
router.patch('/:id/active', authenticate, authorize('ADMIN'), validate(userSetActiveSchema), userController.setActive);

export default router;

