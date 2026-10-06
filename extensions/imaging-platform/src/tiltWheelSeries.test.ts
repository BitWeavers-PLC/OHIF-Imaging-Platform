import { initialTiltState, tiltStep } from './tiltWheelSeries';

const run = (events: { deltaX: number; deltaMode?: number; now: number }[]) => {
  let state = initialTiltState;
  return events.map(e => {
    const result = tiltStep(state, { deltaMode: 0, ...e });
    state = result.state;
    return result.direction;
  });
};

describe('tilt wheel series navigation', () => {
  it('moves one series per sideways swipe, however many events it sends', () => {
    const swipe = Array.from({ length: 30 }, (_, i) => ({ deltaX: 12, now: i * 16 }));
    expect(run(swipe).filter(Boolean)).toEqual([1]);
  });

  it('goes back on a left tilt and steps again after a pause', () => {
    expect(
      run([
        { deltaX: -60, now: 0 },
        { deltaX: -60, now: 1000 },
      ])
    ).toEqual([-1, -1]);
  });

  it('ignores tiny sideways drift', () => {
    expect(
      run([
        { deltaX: 3, now: 0 },
        { deltaX: 4, now: 20 },
      ])
    ).toEqual([0, 0]);
  });

  it('counts line-mode wheels (one notch = one series)', () => {
    expect(run([{ deltaX: 3, deltaMode: 1, now: 0 }])).toEqual([1]);
  });
});
