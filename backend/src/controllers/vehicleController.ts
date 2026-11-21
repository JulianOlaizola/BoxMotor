import { vehicleRepository } from '../repositories/vehicleRepository.js';
import { customerRepository } from '../repositories/customerRepository.js';

export class VehicleController {
  async list(req: any, res: any) {
    const { customerId } = req.query;
    let vehicles;
    if (customerId) {
      vehicles = await vehicleRepository.listByCustomer(customerId as string);
    } else {
      vehicles = await vehicleRepository.list();
    }
    res.json(vehicles);
  }

  async getById(req: any, res: any) {
    const vehicle = await vehicleRepository.findById(req.params.id);
    if (!vehicle) {
      res.status(404).json({ code: 404, message: 'Vehiculo no encontrado' });
      return;
    }
    res.json(vehicle);
  }

  async create(req: any, res: any) {
    const vehicle = await vehicleRepository.create(req.body);
    res.status(201).json(vehicle);
  }

  async update(req: any, res: any) {
    const vehicle = await vehicleRepository.update(req.params.id, req.body);
    if (!vehicle) {
      res.status(404).json({ code: 404, message: 'Vehiculo no encontrado' });
      return;
    }
    res.json(vehicle);
  }
}

export const vehicleController = new VehicleController();

