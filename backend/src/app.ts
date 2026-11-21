import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import customerRoutes from './routes/customer.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import mechanicRoutes from './routes/mechanic.routes.js';
import serviceRoutes from './routes/service.routes.js';
import bayRoutes from './routes/bay.routes.js';
import workshopHoursRoutes from './routes/workshopHours.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import workOrderRoutes from './routes/work-order.routes.js';
import diagnosticRoutes from './routes/diagnostic.routes.js';
import estimateRoutes from './routes/estimate.routes.js';
import partRoutes from './routes/part.routes.js';
import inventoryMovementsRoutes from './routes/inventory-movements.routes.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'boxmotor-backend', env: env.NODE_ENV });
  });

  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/customers', customerRoutes);
  app.use('/vehicles', vehicleRoutes);
  app.use('/mechanics', mechanicRoutes);
  app.use('/services', serviceRoutes);
  app.use('/bays', bayRoutes);
  app.use('/workshop-hours', workshopHoursRoutes);
  app.use('/appointments', appointmentRoutes);
  app.use('/work-orders', workOrderRoutes);
  app.use('/diagnostics', diagnosticRoutes);
  app.use('/estimates', estimateRoutes);
  app.use('/parts', partRoutes);
  app.use('/inventory-movements', inventoryMovementsRoutes);

  app.use(errorHandler);

  return app;
}

