import { workOrderService } from '../services/workOrderService.js';
import { customerRepository } from '../repositories/customerRepository.js';

export class WorkOrderController {
  async list(req: any, res: any) {
    const { customerId, mechanicId, status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (req.user.role === 'CLIENT') {
      const customer = await customerRepository.findByUserId(req.user.userId);
      if (customer) filter.customerId = customer.id;
      else filter.customerId = '__no_customer__';
    } else if (customerId) {
      filter.customerId = customerId;
    }
    if (req.user.role === 'MECHANIC') {
      filter.mechanicId = req.user.userId; // mecanico ve sus ordenes asignadas
    } else if (mechanicId) {
      filter.mechanicId = mechanicId;
    }
    const orders = await workOrderService.list(filter);
    res.json(orders);
  }

  async getById(req: any, res: any) {
    const order = await workOrderService.getById(req.params.id);
    res.json(order);
  }

  async createFromAppointment(req: any, res: any) {
    const order = await workOrderService.createFromAppointment({
      changedBy: req.user.userId,
      ...req.body,
    });
    res.status(201).json(order);
  }

  async transition(req: any, res: any) {
    const { toStatus, notes } = req.body;
    const order = await workOrderService.transition(
      req.params.id,
      toStatus,
      req.user.userId,
      notes
    );
    res.json(order);
  }

  async deliver(req: any, res: any) {
    const { mileageOut, observations } = req.body;
    const order = await workOrderService.deliver({
      workOrderId: req.params.id,
      mileageOut,
      changedBy: req.user.userId,
      observations,
    });
    res.json(order);
  }

  async cancel(req: any, res: any) {
    const order = await workOrderService.cancelWorkOrder(req.params.id, req.user.userId);
    res.json(order);
  }
}

export const workOrderController = new WorkOrderController();

