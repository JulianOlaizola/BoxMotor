import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { workshopHoursUpsertSchema } from '../validators/index.js';
import { workshopHoursController } from '../controllers/workshopHoursController.js';

const router = Router();

router.get('/', authenticate, workshopHoursController.list);
router.post('/', authenticate, authorize('ADMIN'), validate(workshopHoursUpsertSchema), workshopHoursController.upsert);

export default router;

