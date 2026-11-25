import { workshopHoursService } from '../services/workshopHoursService.js';

export class WorkshopHoursController {
  async list(req: any, res: any) {
    const hours = await workshopHoursService.list();
    res.json(hours);
  }

  async upsert(req: any, res: any) {
    const hour = await workshopHoursService.upsert(req.body);
    res.json(hour);
  }
}

export const workshopHoursController = new WorkshopHoursController();

