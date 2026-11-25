import { appointmentService } from '../services/appointmentService.js';
import { customerRepository } from '../repositories/customerRepository.js';

export class AppointmentController {
  async list(req: any, res: any) {
    const { customerId, status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;
    else if (req.user.role === 'CLIENT') {
      const customer = await customerRepository.findByUserId(req.user.userId);
      if (customer) filter.customerId = customer.id;
    }
    const appointments = await appointmentService.list(filter);
    res.json(appointments);
  }

  async getById(req: any, res: any) {
    const appointment = await appointmentService.getById(req.params.id);
    res.json(appointment);
  }

  async create(req: any, res: any) {
    const customer = await customerRepository.findByUserId(req.user.userId);
    if (!customer) {
      res.status(403).json({ code: 403, message: 'Cliente no encontrado' });
      return;
    }
    const appointment = await appointmentService.create({
      customerId: customer.id,
      ...req.body,
    });
    res.status(201).json(appointment);
  }

  async confirm(req: any, res: any) {
    const appointment = await appointmentService.confirm(req.params.id, req.body);
    res.json(appointment);
  }

  async cancel(req: any, res: any) {
    const appointment = await appointmentService.cancel(req.params.id, {
      userId: req.user.userId,
      role: req.user.role,
    });
    res.json(appointment);
  }

  async availability(req: any, res: any) {
    const { serviceId, date, mechanicId, bayId } = req.query;
    if (!serviceId || !date) {
      res.status(400).json({ code: 400, message: 'serviceId y date son obligatorios' });
      return;
    }
    const slots = await appointmentService.getAvailability({
      serviceId: serviceId as string,
      date: new Date(date as string),
      mechanicId: mechanicId as string | null ?? null,
      bayId: bayId as string | null ?? null,
    });
    res.json(slots);
  }
}

export const appointmentController = new AppointmentController();

