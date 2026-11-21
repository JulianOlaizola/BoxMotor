import { mechanicService } from '../services/mechanicService.js';

export class MechanicController {
  async list(req: any, res: any) {
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    const mechanics = await mechanicService.list(active !== undefined ? { active } : undefined);
    res.json(mechanics);
  }

  async getById(req: any, res: any) {
    const mechanic = await mechanicService.getById(req.params.id);
    res.json(mechanic);
  }

  async create(req: any, res: any) {
    const mechanic = await mechanicService.create(req.body);
    res.status(201).json(mechanic);
  }

  async update(req: any, res: any) {
    const mechanic = await mechanicService.update(req.params.id, req.body);
    res.json(mechanic);
  }

  async setActive(req: any, res: any) {
    const { active } = req.body;
    const mechanic = await mechanicService.setActive(req.params.id, active);
    res.json(mechanic);
  }

  async getSpecialties(req: any, res: any) {
    const specialties = await mechanicService.getSpecialties(req.params.id);
    res.json(specialties);
  }
}

export const mechanicController = new MechanicController();

