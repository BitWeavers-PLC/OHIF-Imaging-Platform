// The following are the default window level presets and can be further
// configured via the customization service.
const defaultWindowLevelPresets = {
  CT: [
    { id: 'ct-soft-tissue', description: 'Soft tissue', window: '400', level: '40' },
    { id: 'ct-lung', description: 'Lung', window: '1500', level: '-600' },
    { id: 'ct-liver', description: 'Liver', window: '150', level: '90' },
    { id: 'ct-bone', description: 'Bone', window: '2500', level: '480' },
    { id: 'ct-brain', description: 'Brain', window: '80', level: '40' },
    // Fork: common additional CT windows.
    { id: 'ct-mediastinum', description: 'Mediastinum', window: '350', level: '50' },
    { id: 'ct-abdomen', description: 'Abdomen', window: '400', level: '50' },
    { id: 'ct-stroke', description: 'Stroke', window: '40', level: '40' },
    { id: 'ct-subdural', description: 'Subdural', window: '200', level: '75' },
    { id: 'ct-angio', description: 'Angio', window: '600', level: '300' },
  ],

  // Fork: MR has no absolute units except ADC maps (×10⁻⁶ mm²/s).
  MR: [{ id: 'mr-adc', description: 'ADC', window: '2000', level: '1000' }],

  PT: [
    { id: 'pt-default', description: 'Default', window: '5', level: '2.5' },
    { id: 'pt-suv-3', description: 'SUV', window: '0', level: '3' },
    { id: 'pt-suv-5', description: 'SUV', window: '0', level: '5' },
    { id: 'pt-suv-7', description: 'SUV', window: '0', level: '7' },
    { id: 'pt-suv-8', description: 'SUV', window: '0', level: '8' },
    { id: 'pt-suv-10', description: 'SUV', window: '0', level: '10' },
    { id: 'pt-suv-15', description: 'SUV', window: '0', level: '15' },
  ],
};

export default defaultWindowLevelPresets;
