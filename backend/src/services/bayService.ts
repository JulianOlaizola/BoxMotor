import { bayRepository } from '../repositories/bayRepository.js';
import type { WorkshopBay } from '../models/index.js';

export class BayService {
  async list(filter?: { active?: boolean }): Promise<WorkshopBay[]> {
    return bayRepository.list(filter);
  }

  async getById(id: string): Promise<WorkshopBay> {
    const bay = await bayRepository.findById(id);
    if (!bay) {
      const err: any = new Error('Box no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return bay;
  }

  async create(data: { name: string; characteristics?: string | null; active?: boolean }): Promise<WorkshopBay> {
    const existing = await bayRepository.findByName(data.name);
    if (existing) {
      const err: any = new Error('Ya existe un box con ese nombre');
      err.statusCode = 409;
      throw err;
    }
    return bayRepository.create(data);
  }

  async update(id: string, data: { name?: string; characteristics?: string | null; active?: boolean }): Promise<WorkshopBay> {
    const bay = await bayRepository.findById(id);
    if (!bay) {
      const err: any = new Error('Box no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (data.name !== undefined && data.name !== bay.name) {
      const existing = await bayRepository.findByName(data.name);
      if (existing) {
        const err: any = new Error('Ya existe un box con ese nombre');
        err.statusCode = 409;
        throw err;
      }
    }
    const updated = await bayRepository.update(id, data);
    if (!updated) {
      const err: any = new Error('Box no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }
}

export const bayService = new BayService();

