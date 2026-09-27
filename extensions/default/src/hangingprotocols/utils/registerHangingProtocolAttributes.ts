import viewCode from './viewCode';
import laterality from './laterality';
import registerCrossSectionalAttributes from './crossSectionalAttributes';

export default function registerHangingProtocolAttributes({ servicesManager }) {
  const { hangingProtocolService } = servicesManager.services;
  hangingProtocolService.addCustomAttribute('ViewCode', 'View Code Designator:Value', viewCode);
  hangingProtocolService.addCustomAttribute('Laterality', 'Laterality of object', laterality);
  registerCrossSectionalAttributes(hangingProtocolService);
}
