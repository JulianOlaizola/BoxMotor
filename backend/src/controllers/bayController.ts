import { bayService } from '../services/bayService.js';

export class BayController {
  async list(req: any, res: any) {
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    const bays = await bayService.list(active !== undefined ? { active } : undefined);
    res.json(bays);
  }

  async getById(req: any, res: any) {
    const bay = await bayService.getById(req.params.id);
    res.json(bay);
  }

  async create(req: any, res: any) {
    const bay = await bayService.create(req.body);
    res.status(201).json(bay);
  }

  async update(req: any, res: any) {
    const bay = await bayService.update(req.params.id, req.body);
    res.json(bay);
  }
}

export const bayController = new BayController();

