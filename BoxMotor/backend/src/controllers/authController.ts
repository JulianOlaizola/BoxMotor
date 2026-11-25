import { authService } from '../services/authService.js';
import { userRepository } from '../repositories/userRepository.js';

export class AuthController {
  async register(req: any, res: any) {
    const result = await authService.register(req.body);
    res.status(201).json({ user: result.user, token: result.token });
  }

  async login(req: any, res: any) {
    const result = await authService.login(req.body);
    res.json({ user: result.user, token: result.token });
  }

  async me(req: any, res: any) {
    const user = await userRepository.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ code: 404, message: 'Usuario no encontrado' });
      return;
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        active: user.active,
      },
    });
  }
}

export const authController = new AuthController();

