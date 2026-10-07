import { stagePosition } from './StageBar';

describe('stagePosition', () => {
  const stages = [
    { name: 'MR 2x2', status: 'enabled' },
    { name: 'MR 1x3', status: 'disabled' },
    { name: 'MR 1x2', status: 'passive' },
  ];

  it('skips stages the study cannot fill', () => {
    const { usable, position } = stagePosition(stages, 2);
    expect(usable.map(({ stage }) => stage.name)).toEqual(['MR 2x2', 'MR 1x2']);
    expect(position).toBe(1);
  });

  it('has no position when the current stage is not usable', () => {
    expect(stagePosition(stages, 1).position).toBe(-1);
  });
});
