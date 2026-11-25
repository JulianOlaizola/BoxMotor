import { partService } from '../services/partService.js';

export class PartController {
  async list(req: any, res: any) {
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    const parts = await partService.list(active !== undefined ? { active } : undefined);
    res.json(parts);
  }

  async getById(req: any, res: any) {
    const part = await partService.getById(req.params.id);
    res.json(part);
  }

  async getByCode(req: any, res: any) {
    const part = await partService.getByCode(req.params.code);
    res.json(part);
  }

  async create(req: any, res: any) {
    const part = await partService.create(req.body);
    res.status(201).json(part);
  }

  async update(req: any, res: any) {
    const part = await partService.update(req.params.id, req.body);
    res.json(part);
  }

  async setActive(req: any, res: any) {
    const { active } = req.body;
    const part = await partService.setActive(req.params.id, active);
    res.json(part);
  }
}

export const partController = new PartController();

