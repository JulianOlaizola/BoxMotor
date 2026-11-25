import { estimateService } from '../services/estimateService.js';
import { customerRepository } from '../repositories/customerRepository.js';

export class EstimateController {
  async list(req: any, res: any) {
    const { workOrderId, customerId, status } = req.query;
    const filter: any = {};
    if (workOrderId) filter.workOrderId = workOrderId;
    if (status) filter.status = status;
    if (req.user.role === 'CLIENT') {
      const customer = await customerRepository.findByUserId(req.user.userId);
      if (customer) filter.customerId = customer.id;
      else filter.customerId = '__no_customer__';
    } else if (customerId) {
      filter.customerId = customerId;
    }
    const estimates = await estimateService.list(filter);
    res.json(estimates);
  }

  async getById(req: any, res: any) {
    const estimate = await estimateService.getById(req.params.id);
    res.json(estimate);
  }

  async getItems(req: any, res: any) {
    const { version } = req.query;
    const items = await estimateService.getItems(req.params.id, version ? Number(version) : 1);
    res.json(items);
  }

  async create(req: any, res: any) {
    const customer = await customerRepository.findByUserId(req.user.userId);
    if (!customer) {
      res.status(403).json({ code: 403, message: 'Cliente no encontrado' });
      return;
    }
    const result = await estimateService.create({
      customerId: customer.id,
      ...req.body,
    });
    res.status(201).json(result);
  }

  async approve(req: any, res: any) {
    const customer = await customerRepository.findByUserId(req.user.userId);
    if (!customer) {
      res.status(403).json({ code: 403, message: 'Cliente no encontrado' });
      return;
    }
    const result = await estimateService.approve(req.params.id, customer.id);
    res.json(result);
  }

  async reject(req: any, res: any) {
    const customer = await customerRepository.findByUserId(req.user.userId);
    if (!customer) {
      res.status(403).json({ code: 403, message: 'Cliente no encontrado' });
      return;
    }
    const result = await estimateService.reject(req.params.id, customer.id);
    res.json(result);
  }

  async newVersion(req: any, res: any) {
    const customer = await customerRepository.findByUserId(req.user.userId);
    if (!customer) {
      res.status(403).json({ code: 403, message: 'Cliente no encontrado' });
      return;
    }
    const result = await estimateService.newVersion({
      estimateId: req.params.id,
      customerId: customer.id,
      ...req.body,
    });
    res.status(201).json(result);
  }
}

export const estimateController = new EstimateController();

