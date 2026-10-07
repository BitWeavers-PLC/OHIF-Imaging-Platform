import { useState, useEffect } from 'react';
import { utils, useSystem } from '@ohif/core';

const { formatPN, formatDate } = utils;
const NON_IMAGE = ['SR', 'SEG', 'RTSTRUCT', 'RTPLAN', 'RTDOSE', 'PR', 'KO', 'DOC'];

function usePatientInfo() {
  const { servicesManager } = useSystem();
  const { displaySetService } = servicesManager.services;

  const [patientInfo, setPatientInfo] = useState({
    PatientName: '',
    PatientID: '',
    PatientSex: '',
    PatientDOB: '',
    PatientAge: '',
  });
  const [isMixedPatients, setIsMixedPatients] = useState(false);

  const checkMixedPatients = (PatientID: string) => {
    const displaySets = displaySetService.getActiveDisplaySets();
    let isMixedPatients = false;
    displaySets.forEach(displaySet => {
      const instance = displaySet?.instances?.[0] || displaySet?.instance;
      if (!instance) {
        return;
      }
      if (instance.PatientID !== PatientID) {
        isMixedPatients = true;
      }
    });
    setIsMixedPatients(isMixedPatients);
  };

  const updatePatientInfo = ({ displaySetsAdded }) => {
    if (!displaySetsAdded.length) {
      return;
    }
    // Fork: patient details from an image series. Reports and overlays (SR, SEG, RT, ...) are
    // often written by other tools with poor demographics (one demo SR names the patient
    // "[object Object]"), and a prior's report loading last would overwrite the banner.
    const displaySet = displaySetsAdded.find(ds => !NON_IMAGE.includes(ds?.Modality));
    if (!displaySet) {
      return;
    }
    const instance = displaySet?.instances?.[0] || displaySet?.instance;
    if (!instance) {
      return;
    }

    setPatientInfo({
      PatientID: instance.PatientID || null,
      PatientName: instance.PatientName ? formatPN(instance.PatientName) : null,
      PatientSex: instance.PatientSex || null,
      PatientDOB: formatDate(instance.PatientBirthDate) || null,
      // Fork: DICOM age ("065Y") without the padding, for the patient banner.
      PatientAge: instance.PatientAge?.replace(/^0+(?=\d)/, '') || null,
    });
    checkMixedPatients(instance.PatientID || null);
  };

  useEffect(() => {
    // Fork: a component mounted after the series loaded (e.g. a reopened panel) starts filled.
    updatePatientInfo({ displaySetsAdded: displaySetService.getActiveDisplaySets() });
    const subscription = displaySetService.subscribe(
      displaySetService.EVENTS.DISPLAY_SETS_ADDED,
      props => updatePatientInfo(props)
    );
    return () => subscription.unsubscribe();
  }, []);

  return { patientInfo, isMixedPatients };
}

export default usePatientInfo;
