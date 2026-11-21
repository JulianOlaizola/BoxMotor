import { userRepository } from '../repositories/userRepository.js';

export class UserController {
  async list(req: any, res: any) {
    const users = await userRepository.list();
    res.json(users.map(({ password_hash, ...rest }) => rest));
  }

  async getById(req: any, res: any) {
    const user = await userRepository.findById(req.params.id);
    if (!user) {
      res.status(404).json({ code: 404, message: 'Usuario no encontrado' });
      return;
    }
    const { password_hash, ...rest } = user;
    res.json(rest);
  }

  async update(req: any, res: any) {
    const user = await userRepository.update(req.params.id, req.body);
    if (!user) {
      res.status(404).json({ code: 404, message: 'Usuario no encontrado' });
      return;
    }
    const { password_hash, ...rest } = user;
    res.json(rest);
  }

  async setActive(req: any, res: any) {
    const { active } = req.body;
    const user = await userRepository.update(req.params.id, { active });
    if (!user) {
      res.status(404).json({ code: 404, message: 'Usuario no encontrado' });
      return;
    }
    const { password_hash, ...rest } = user;
    res.json(rest);
  }
}

export const userController = new UserController();

