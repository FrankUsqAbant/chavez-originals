import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { watchIdle } from './idle';

describe('watchIdle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('avisa cuando pasa el tiempo sin actividad', () => {
    const onIdle = vi.fn();
    watchIdle(new EventTarget(), 60_000, onIdle);
    vi.advanceTimersByTime(59_999);
    expect(onIdle).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('la actividad reinicia el reloj', () => {
    const target = new EventTarget();
    const onIdle = vi.fn();
    watchIdle(target, 60_000, onIdle);
    vi.advanceTimersByTime(50_000);
    target.dispatchEvent(new Event('keydown'));
    vi.advanceTimersByTime(50_000); // 100 s en total, pero solo 50 s desde la última actividad
    expect(onIdle).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10_000);
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('el movimiento del mouse no reinicia el reloj más de una vez por segundo', () => {
    const target = new EventTarget();
    const onIdle = vi.fn();
    watchIdle(target, 10_000, onIdle);
    vi.advanceTimersByTime(2_000);
    target.dispatchEvent(new Event('pointermove')); // reinicia: vencería en t = 12 000
    vi.advanceTimersByTime(500);
    target.dispatchEvent(new Event('pointermove')); // pasó menos de 1 s: se ignora
    vi.advanceTimersByTime(9_500); // t = 12 000
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('al detenerlo ya no avisa', () => {
    const onIdle = vi.fn();
    const stop = watchIdle(new EventTarget(), 60_000, onIdle);
    stop();
    vi.advanceTimersByTime(120_000);
    expect(onIdle).not.toHaveBeenCalled();
  });
});
