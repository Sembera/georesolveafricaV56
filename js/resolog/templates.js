// Purpose describes the report; hole.type describes the sampling/drilling mode.
export const LOG_TEMPLATES = {
  geotechnical: { label: 'Geotechnical', title: 'GEOTECHNICAL BOREHOLE LOG', columns: ['depthRuler','drillingMethod','water','samples','spt','lithology','description'] },
  groundwater: { label: 'Water well / groundwater', title: 'GROUNDWATER WELL LOG', columns: ['depthRuler','water','samples','lithology','description','construction'] },
  mining: { label: 'Mining / exploration', title: 'MINERAL EXPLORATION LOG', columns: ['depthRuler','drillingMethod','samples','lithology','description','weathering','strength','recovery','rqd','defects'] },
  environmental: { label: 'Environmental / monitoring', title: 'ENVIRONMENTAL BOREHOLE LOG', columns: ['depthRuler','water','samples','lithology','description','construction'] },
  testpit: { label: 'Trial pit', title: 'TRIAL PIT LOG', columns: ['depthRuler','samples','lithology','description'] }
};
export function logPurpose(hole = {}) {
  return LOG_TEMPLATES[hole.purpose] ? hole.purpose : hole.type === 'core' || hole.type === 'rc' ? 'mining' : hole.type === 'testpit' ? 'testpit' : 'geotechnical';
}
