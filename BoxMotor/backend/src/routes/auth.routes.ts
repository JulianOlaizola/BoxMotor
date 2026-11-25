import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { authenticate } from '../middlewares/auth.js';
import {
  authRegisterSchema, authLoginSchema,
} from '../validators/index.js';
import { authController } from '../controllers/authController.js';

const router = Router();

router.post('/register', validate(authRegisterSchema), authController.register);
router.post('/login', validate(authLoginSchema), authController.login);
router.get('/me', authenticate, authController.me);

export default router;

