import formatPN from './formatPN';

describe('formatPN', () => {
  it('formats a plain DICOM name', () => {
    expect(formatPN('Kassa^Alemu^Getaneh')).toBe('Kassa, Alemu Getaneh');
  });

  it('reads the DICOM JSON form, a list of { Alphabetic }', () => {
    expect(formatPN([{ Alphabetic: 'Doe^Jane' }])).toBe('Doe, Jane');
    expect(formatPN({ Alphabetic: 'Doe^Jane' })).toBe('Doe, Jane');
  });

  it('gives an empty name for a value it cannot read', () => {
    expect(formatPN([{}])).toBe('');
  });
});
