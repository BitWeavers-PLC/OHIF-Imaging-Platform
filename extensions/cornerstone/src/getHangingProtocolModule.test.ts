import getHangingProtocolModule from './getHangingProtocolModule';

describe('getHangingProtocolModule', () => {
  it('registers the MIP hanging protocol with a dedicated MIP viewport', () => {
    const protocols = getHangingProtocolModule();
    const mipProtocol = protocols.find(protocol => protocol.name === 'mip')?.protocol;

    expect(mipProtocol).toBeDefined();
    expect(mipProtocol.id).toBe('mip');
    expect(mipProtocol.displaySetSelectors.activeDisplaySet.seriesMatchingRules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attribute: 'isReconstructable',
          required: true,
        }),
      ])
    );

    expect(mipProtocol.stages[0].viewports).toHaveLength(4);

    const mipViewport = mipProtocol.stages[0].viewports.find(
      viewport => viewport.viewportOptions.viewportId === 'mip-mip'
    );

    expect(mipViewport.viewportOptions.viewportType).toBe('volume');
    expect(mipViewport.viewportOptions.toolGroupId).toBe('mip');
    expect(mipViewport.displaySets[0].options).toEqual(
      expect.objectContaining({
        blendMode: 'MIP',
        slabThickness: 'fullVolume',
      })
    );
  });
});
