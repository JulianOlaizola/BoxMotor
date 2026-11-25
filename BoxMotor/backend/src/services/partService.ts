import { partRepository } from '../repositories/partRepository.js';
import type { Part } from '../models/index.js';

export class PartService {
  async list(filter?: { active?: boolean }): Promise<Part[]> {
    return partRepository.list(filter);
  }

  async getById(id: string): Promise<Part> {
    const part = await partRepository.findById(id);
    if (!part) {
      const err: any = new Error('Repuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return part;
  }

  async getByCode(code: string): Promise<Part> {
    const part = await partRepository.findByCode(code);
    if (!part) {
      const err: any = new Error('Repuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return part;
  }

  async create(data: {
    code: string;
    name: string;
    description?: string | null;
    brand?: string | null;
    category?: string | null;
    price: number;
    quantityAvailable?: number;
    minStock?: number;
    active?: boolean;
  }): Promise<Part> {
    const existing = await partRepository.findByCode(data.code);
    if (existing) {
      const err: any = new Error('Ya existe un repuesto con ese codigo');
      err.statusCode = 409;
      throw err;
    }
    return partRepository.create(data);
  }

  async update(id: string, data: Partial<{
    code: string; name: string; description: string | null; brand: string | null;
    category: string | null; price: number; quantityAvailable: number;
    minStock: number; active: boolean;
  }>): Promise<Part> {
    const part = await partRepository.findById(id);
    if (!part) {
      const err: any = new Error('Repuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (data.code !== undefined && data.code !== part.code) {
      const existing = await partRepository.findByCode(data.code);
      if (existing) {
        const err: any = new Error('Ya existe un repuesto con ese codigo');
        err.statusCode = 409;
        throw err;
      }
    }
    const updated = await partRepository.update(id, data);
    if (!updated) {
      const err: any = new Error('Repuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }

  async setActive(id: string, active: boolean): Promise<Part> {
    const part = await partRepository.findById(id);
    if (!part) {
      const err: any = new Error('Repuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    const updated = await partRepository.update(id, { active });
    if (!updated) {
      const err: any = new Error('Repuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }
}

export const partService = new PartService();

