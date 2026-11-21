import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { estimateCreateSchema, estimateNewVersionSchema } from '../validators/index.js';
import { estimateController } from '../controllers/estimateController.js';

const router = Router();

router.get('/', authenticate, estimateController.list);
router.get('/:id', authenticate, estimateController.getById);
router.get('/:id/items', authenticate, estimateController.getItems);
router.post('/', authenticate, authorize('RECEPTIONIST', 'ADMIN'), validate(estimateCreateSchema), estimateController.create);
router.post('/:id/approve', authenticate, estimateController.approve);
router.post('/:id/reject', authenticate, estimateController.reject);
router.post('/:id/version', authenticate, authorize('RECEPTIONIST', 'ADMIN'), validate(estimateNewVersionSchema), estimateController.newVersion);

export default router;

