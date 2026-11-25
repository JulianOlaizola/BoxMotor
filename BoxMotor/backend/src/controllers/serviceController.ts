import { serviceRepository } from '../repositories/serviceRepository.js';

export class ServiceController {
  async list(req: any, res: any) {
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    const services = await serviceRepository.list(active !== undefined ? { active } : undefined);
    res.json(services);
  }

  async getById(req: any, res: any) {
    const service = await serviceRepository.findById(req.params.id);
    if (!service) {
      res.status(404).json({ code: 404, message: 'Servicio no encontrado' });
      return;
    }
    res.json(service);
  }

  async create(req: any, res: any) {
    const service = await serviceRepository.create(req.body);
    res.status(201).json(service);
  }

  async update(req: any, res: any) {
    const service = await serviceRepository.update(req.params.id, req.body);
    if (!service) {
      res.status(404).json({ code: 404, message: 'Servicio no encontrado' });
      return;
    }
    res.json(service);
  }
}

export const serviceController = new ServiceController();

