import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { clock } from '../src/config/clock.js';

describe('clock controlable (R-040)', () => {
  beforeEach(() => {
    clock.reset();
  });

  afterEach(() => {
    clock.reset();
  });

  it('devuelve la hora real por defecto', () => {
    const antes = new Date();
    const ahora = clock.now();
    const despues = new Date();
    expect(ahora.getTime()).toBeGreaterThanOrEqual(antes.getTime());
    expect(ahora.getTime()).toBeLessThanOrEqual(despues.getTime());
  });

  it('permite fijar una fecha con setNow', () => {
    const fechaFija = new Date('2026-01-15T10:00:00-03:00');
    clock.setNow(fechaFija);
    expect(clock.now().getTime()).toBe(fechaFija.getTime());
  });

  it('acepta una cadena ISO en setNow', () => {
    clock.setNow('2026-06-01T00:00:00-03:00');
    expect(clock.now().toISOString()).toBe(
      new Date('2026-06-01T00:00:00-03:00').toISOString()
    );
  });

  it('reset vuelve a la hora real', () => {
    clock.setNow(new Date('2020-01-01T00:00:00-03:00'));
    clock.reset();
    const ahora = clock.now();
    const haceUnMomento = new Date();
    expect(ahora.getTime()).toBeGreaterThanOrEqual(
      haceUnMomento.getTime() - 5000
    );
    expect(ahora.getTime()).toBeLessThanOrEqual(haceUnMomento.getTime() + 5000);
  });
});
