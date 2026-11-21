import { mechanicRepository } from '../repositories/mechanicRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import type { Mechanic } from '../models/index.js';

export class MechanicService {
  async list(filter?: { active?: boolean }): Promise<Mechanic[]> {
    return mechanicRepository.list(filter);
  }

  async getById(id: string): Promise<Mechanic> {
    const mechanic = await mechanicRepository.findById(id);
    if (!mechanic) {
      const err: any = new Error('Mecanico no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return mechanic;
  }

  async create(data: { userId?: string | null; specialties?: string[]; active?: boolean }): Promise<Mechanic> {
    return mechanicRepository.create(data);
  }

  async update(id: string, data: { specialties?: string[]; active?: boolean }): Promise<Mechanic> {
    const mechanic = await mechanicRepository.findById(id);
    if (!mechanic) {
      const err: any = new Error('Mecanico no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (data.specialties !== undefined) {
      await mechanicRepository.setSpecialties(id, data.specialties);
    }
    return mechanicRepository.update(id, data) as Promise<Mechanic>;
  }

  async setActive(id: string, active: boolean): Promise<Mechanic> {
    const mechanic = await mechanicRepository.findById(id);
    if (!mechanic) {
      const err: any = new Error('Mecanico no encontrado');
      err.statusCode = 404;
      throw err;
    }
    const updated = await mechanicRepository.update(id, { active });
    if (!updated) {
      const err: any = new Error('Mecanico no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }

  async getSpecialties(mechanicId: string): Promise<string[]> {
    const mechanic = await mechanicRepository.findById(mechanicId);
    if (!mechanic) {
      const err: any = new Error('Mecanico no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return mechanicRepository.findServiceIds(mechanicId);
  }

  async hasSpecialty(mechanicId: string, serviceId: string): Promise<boolean> {
    const ids = await mechanicRepository.findServiceIds(mechanicId);
    return ids.includes(serviceId);
  }

  async findByService(serviceId: string): Promise<Mechanic[]> {
    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      const err: any = new Error('Servicio no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return mechanicRepository.findByService(serviceId);
  }
}

export const mechanicService = new MechanicService();

