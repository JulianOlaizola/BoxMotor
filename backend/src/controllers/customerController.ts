import { customerRepository } from '../repositories/customerRepository.js';
import { userRepository } from '../repositories/userRepository.js';

export class CustomerController {
  async list(req: any, res: any) {
    const customers = await customerRepository.list();
    res.json(customers);
  }

  async getById(req: any, res: any) {
    const customer = await customerRepository.findById(req.params.id);
    if (!customer) {
      res.status(404).json({ code: 404, message: 'Cliente no encontrado' });
      return;
    }
    res.json(customer);
  }

  async create(req: any, res: any) {
    const customer = await customerRepository.create(req.body);
    res.status(201).json(customer);
  }

  async update(req: any, res: any) {
    const customer = await customerRepository.update(req.params.id, req.body);
    if (!customer) {
      res.status(404).json({ code: 404, message: 'Cliente no encontrado' });
      return;
    }
    res.json(customer);
  }
}

export const customerController = new CustomerController();

