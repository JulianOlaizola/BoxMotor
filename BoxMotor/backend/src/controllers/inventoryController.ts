import { inventoryService } from '../services/inventoryService.js';

export class InventoryController {
  async ingreso(req: any, res: any) {
    const result = await inventoryService.ingreso(req.body);
    res.json(result);
  }

  async consumeDirect(req: any, res: any) {
    const result = await inventoryService.consumeDirect(req.body);
    res.json(result);
  }

  async consumeReservation(req: any, res: any) {
    const result = await inventoryService.consumeReservation(req.body);
    res.json(result);
  }

  async adjust(req: any, res: any) {
    const result = await inventoryService.adjust(req.body);
    res.json(result);
  }

  async listMovements(req: any, res: any) {
    const { partId } = req.query;
    const movements = await inventoryService.listMovements(partId as string | undefined);
    res.json(movements);
  }
}

export const inventoryController = new InventoryController();

