/**
 * Reloj controlable (R-040).
 * En producciÃ³n devuelve la hora real. En tests se puede fijar con setNow()
 * para comprobar anticipaciÃ³n, vencimiento de presupuestos y cancelaciÃ³n 24h
 * sin esperar tiempo real.
 */
let _now: Date | null = null;

export const clock = {
  now: (): Date => _now ?? new Date(),
  setNow: (date: Date | string): void => {
    _now = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  },
  reset: (): void => {
    _now = null;
  },
} as const;

export type Clock = typeof clock;

