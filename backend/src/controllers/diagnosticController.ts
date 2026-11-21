import { workOrderService } from '../services/workOrderService.js';
import { diagnosticRepository } from '../repositories/diagnosticRepository.js';

export class DiagnosticController {
  async create(req: any, res: any) {
    const result = await workOrderService.registerDiagnostic({
      changedBy: req.user.userId,
      ...req.body,
    });
    res.status(201).json(result);
  }

  async listByWorkOrder(req: any, res: any) {
    // Reutiliza el service de diagnostico via repositorio directo
    const diagnostics = await diagnosticRepository.findByWorkOrder(req.params.workOrderId);
    res.json(diagnostics);
  }
}

export const diagnosticController = new DiagnosticController();

