import React, { useState, useEffect } from 'react';
import usePatientInfo from '../../hooks/usePatientInfo';
import { Icons } from '@ohif/ui-next';

export enum PatientInfoVisibility {
  VISIBLE = 'visible',
  VISIBLE_COLLAPSED = 'visibleCollapsed',
  DISABLED = 'disabled',
  VISIBLE_READONLY = 'visibleReadOnly',
}

const formatWithEllipsis = (str, maxLength) => {
  if (str?.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
};

function HeaderPatientInfo({ servicesManager, appConfig }: withAppTypes) {
  const singleLine = appConfig.patientInfoSingleLine !== false;
  const initialExpandedState =
    appConfig.showPatientInfo !== PatientInfoVisibility.VISIBLE_COLLAPSED &&
    appConfig.showPatientInfo !== PatientInfoVisibility.DISABLED;
  const [expanded, setExpanded] = useState(initialExpandedState);
  const { patientInfo, isMixedPatients } = usePatientInfo(servicesManager);

  useEffect(() => {
    if (isMixedPatients && expanded) {
      setExpanded(false);
    }
  }, [isMixedPatients, expanded]);

  const handleOnClick = () => {
    if (!isMixedPatients && appConfig.showPatientInfo !== PatientInfoVisibility.VISIBLE_READONLY) {
      setExpanded(!expanded);
    }
  };

  const formattedPatientName = formatWithEllipsis(patientInfo.PatientName, 27);
  const formattedPatientID = formatWithEllipsis(patientInfo.PatientID, 15);

  return (
    <div
      className="hover:bg-muted flex min-w-0 max-w-[250px] cursor-pointer items-center gap-1 rounded-lg px-1.5 py-1"
      onClick={handleOnClick}
    >
      {isMixedPatients ? (
        <Icons.MultiplePatients className="text-primary" />
      ) : (
        <Icons.Patient className="text-primary" />
      )}
      <div className="min-w-0 flex flex-col justify-center">
        {expanded ? (
          <>
            <div className="text-foreground self-start text-[13px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">
              {formattedPatientName}
            </div>
            <div
              className={`text-muted-foreground flex min-w-0 gap-2 text-[11px] ${singleLine ? 'whitespace-nowrap overflow-hidden text-ellipsis' : ''}`}
            >
              <div className="shrink-0">{formattedPatientID}</div>
              <div className="shrink-0">{patientInfo.PatientSex}</div>
              <div className="shrink-0">{patientInfo.PatientDOB}</div>
            </div>
          </>
        ) : (
          <div className="text-primary self-center text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">
            {isMixedPatients ? 'Multiple Patients' : 'Patient'}
          </div>
        )}
      </div>
      <Icons.ArrowLeft className={`text-primary ${expanded ? 'rotate-180' : ''}`} />
    </div>
  );
}

export default HeaderPatientInfo;
