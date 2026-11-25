import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Falta variable de entorno obligatoria: ${key}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || '7d') as string,
  NODE_ENV: (process.env.NODE_ENV || 'development') as string,
  PORT: parseInt(process.env.PORT || '4000', 10),
  ADMIN_BOOTSTRAP_EMAIL: process.env.ADMIN_BOOTSTRAP_EMAIL,
  ADMIN_BOOTSTRAP_PASSWORD: process.env.ADMIN_BOOTSTRAP_PASSWORD,
  MIN_ANTICIPATION_HOURS: parseInt(process.env.MIN_ANTICIPATION_HOURS || '2', 10),
  MAX_ANTICIPATION_DAYS: parseInt(process.env.MAX_ANTICIPATION_DAYS || '45', 10),
  ESTIMATE_VALIDITY_DAYS: parseInt(process.env.ESTIMATE_VALIDITY_DAYS || '7', 10),
  CANCELLATION_HOURS: parseInt(process.env.CANCELLATION_HOURS || '24', 10),
  TIMEZONE: 'America/Argentina/Buenos_Aires',
} as const;

