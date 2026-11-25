import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate } from '../middlewares/auth.js';
import { vehicleCreateSchema, vehicleUpdateSchema } from '../validators/index.js';
import { vehicleController } from '../controllers/vehicleController.js';

const router = Router();

router.get('/', authenticate, vehicleController.list);
router.get('/:id', authenticate, vehicleController.getById);
router.post('/', authenticate, validate(vehicleCreateSchema), vehicleController.create);
router.put('/:id', authenticate, validate(vehicleUpdateSchema), vehicleController.update);

export default router;

