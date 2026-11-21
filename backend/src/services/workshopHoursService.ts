import { workshopHoursRepository } from '../repositories/workshopHoursRepository.js';
import type { WorkshopHour } from '../models/index.js';

export class WorkshopHoursService {
  async list(filter?: { active?: boolean }): Promise<WorkshopHour[]> {
    return workshopHoursRepository.list(filter);
  }

  async getByDay(dayOfWeek: number): Promise<WorkshopHour | null> {
    return workshopHoursRepository.findByDay(dayOfWeek);
  }

  async upsert(data: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    active?: boolean;
  }): Promise<WorkshopHour> {
    return workshopHoursRepository.upsert(data);
  }
}

export const workshopHoursService = new WorkshopHoursService();

