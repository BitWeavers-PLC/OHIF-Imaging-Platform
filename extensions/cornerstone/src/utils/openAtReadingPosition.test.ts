jest.mock('@cornerstonejs/core', () => ({ BaseVolumeViewport: class {} }));

import { BaseVolumeViewport } from '@cornerstonejs/core';
import openAtReadingPosition from './openAtReadingPosition';

const volume = (slab: number) =>
  Object.assign(Object.create(BaseVolumeViewport.prototype), {
    getActors: () => [{}],
    getSlabThickness: () => slab,
    getImageData: () => ({ metadata: { Modality: 'CT' } }),
    jumpToWorld: jest.fn(),
    setProperties: jest.fn(),
    render: jest.fn(),
  });

it('opens MPR views at the level being read and gives a CT MIP the angio window', async () => {
  const stack = { getCamera: () => ({ focalPoint: [1, 2, 1591] }) };
  const axial = volume(0);
  const mip = volume(756);
  let layout: Record<string, any> = { default: stack };
  const services = {
    viewportGridService: {
      getState: () => ({ viewports: new Map(Object.keys(layout).map(id => [id, {}])) }),
      getActiveViewportId: () => 'default',
    },
    cornerstoneViewportService: { getCornerstoneViewport: id => layout[id] },
  };
  const commandsManager = { runCommand: jest.fn() };

  const done = openAtReadingPosition({ servicesManager: { services }, commandsManager });
  layout = { 'mpr-axial': axial, 'mip-mip': mip }; // the layout switch
  await done;

  expect(axial.jumpToWorld).toHaveBeenCalledWith([1, 2, 1591]);
  expect(mip.jumpToWorld).not.toHaveBeenCalled(); // keeps its whole-volume slab
  expect(mip.setProperties).toHaveBeenCalledWith({ voiRange: { lower: 0, upper: 600 } });
  expect(axial.setProperties).not.toHaveBeenCalled();
  expect(commandsManager.runCommand).toHaveBeenCalledWith('resetCrosshairs', {});
});
