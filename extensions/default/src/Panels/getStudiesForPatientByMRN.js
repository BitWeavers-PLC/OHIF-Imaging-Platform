// Fork: PatientID alone is not unique across facilities on a shared PACS, so a
// "prior" must also match the patient name (case, spacing and punctuation ignored).
// ponytail: name match is a heuristic; replace with a backend, tenancy-aware priors endpoint.
const normalizeName = name =>
  String(name || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

async function getStudiesForPatientByMRN(dataSource, qidoForStudyUID) {
  if (!qidoForStudyUID?.length) {
    return [];
  }

  const { mrn, patientName } = qidoForStudyUID[0];
  const name = normalizeName(patientName);

  // Without both identifiers we can't safely claim another study is the same patient.
  if (!mrn || !name) {
    return qidoForStudyUID;
  }

  const studies = await dataSource.query.studies.search({
    patientId: mrn,
    disableWildcard: true,
  });

  return studies.filter(study => normalizeName(study.patientName) === name);
}

export default getStudiesForPatientByMRN;
