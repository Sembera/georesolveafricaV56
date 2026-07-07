export const ACCURACY_NOTES = {
  arc1960: 'Arc 1960 <-> WGS84 uses a 3-parameter geocentric translation in this client-side tool. Expect roughly +/-5-20 m in Uganda/Kenya/Tanzania workflows and up to about 35 m where EPSG lists broader regional transformations.',
  ugrf: 'UGRF <-> WGS84 is represented as an EPSG geocentric translation with zero offsets; EPSG lists an approximation at about +/-1 m.',
  wgs84: 'WGS84 and WGS84 UTM transformations are projection-only in this tool; practical accuracy is governed by source coordinate quality.',
  legacy: 'Legacy Congo and Arc-family systems use published 3-parameter datum shifts; verify against local control for survey-grade deliverables.'
};

export const CRS_DEFS = {
  'EPSG:4326': {
    name: 'WGS84 Geographic (EPSG:4326)',
    proj4: '+proj=longlat +datum=WGS84 +no_defs +type=crs',
    geographic: true,
    accuracy: ACCURACY_NOTES.wgs84,
    source: 'EPSG / proj4 default'
  },
  'EPSG:4209': {
    name: 'Arc 1960 Geographic (legacy page value EPSG:4209)',
    proj4: '+proj=longlat +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +no_defs +type=crs',
    geographic: true,
    datumFamily: 'arc1960',
    accuracy: ACCURACY_NOTES.arc1960,
    source: 'Legacy value retained from the existing page; Arc 1960 parameters mirror EPSG Arc 1960 / UTM definitions.'
  },
  'EPSG:4210': {
    name: 'Arc 1960 Geographic (EPSG:4210)',
    proj4: '+proj=longlat +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +no_defs +type=crs',
    geographic: true,
    datumFamily: 'arc1960',
    accuracy: ACCURACY_NOTES.arc1960,
    source: 'https://epsg.io/4210'
  },
  // EPSG source: https://epsg.io/21095 PROJ.4 export.
  'EPSG:21095': {
    name: 'Arc 1960 / UTM zone 35N (EPSG:21095)',
    proj4: '+proj=utm +zone=35 +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +units=m +no_defs +type=crs',
    zone: 35,
    hemisphere: 'N',
    datumFamily: 'arc1960',
    accuracy: ACCURACY_NOTES.arc1960,
    source: 'https://epsg.io/21095'
  },
  // EPSG source: https://epsg.io/21035 PROJ.4 export.
  'EPSG:21035': {
    name: 'Arc 1960 / UTM zone 35S (EPSG:21035)',
    proj4: '+proj=utm +zone=35 +south +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +units=m +no_defs +type=crs',
    zone: 35,
    hemisphere: 'S',
    datumFamily: 'arc1960',
    accuracy: ACCURACY_NOTES.arc1960,
    source: 'https://epsg.io/21035'
  },
  // EPSG source: https://epsg.io/21096 PROJ.4 export.
  'EPSG:21096': {
    name: 'Arc 1960 / UTM zone 36N (EPSG:21096)',
    proj4: '+proj=utm +zone=36 +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +units=m +no_defs +type=crs',
    zone: 36,
    hemisphere: 'N',
    datumFamily: 'arc1960',
    accuracy: ACCURACY_NOTES.arc1960,
    source: 'https://epsg.io/21096'
  },
  // EPSG source: https://epsg.io/21036 PROJ.4 export.
  'EPSG:21036': {
    name: 'Arc 1960 / UTM zone 36S (EPSG:21036)',
    proj4: '+proj=utm +zone=36 +south +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +units=m +no_defs +type=crs',
    zone: 36,
    hemisphere: 'S',
    datumFamily: 'arc1960',
    accuracy: ACCURACY_NOTES.arc1960,
    source: 'https://epsg.io/21036'
  },
  'EPSG:21097': {
    name: 'Arc 1960 / UTM zone 37N (EPSG:21097)',
    proj4: '+proj=utm +zone=37 +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +units=m +no_defs +type=crs',
    zone: 37,
    hemisphere: 'N',
    datumFamily: 'arc1960',
    accuracy: ACCURACY_NOTES.arc1960,
    source: 'https://epsg.io/21097'
  },
  'EPSG:21037': {
    name: 'Arc 1960 / UTM zone 37S (EPSG:21037)',
    proj4: '+proj=utm +zone=37 +south +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +units=m +no_defs +type=crs',
    zone: 37,
    hemisphere: 'S',
    datumFamily: 'arc1960',
    accuracy: ACCURACY_NOTES.arc1960,
    source: 'https://epsg.io/21037'
  },
  'EPSG:4196': {
    name: 'Belgian Congo 1950 Geographic (EPSG:4196)',
    proj4: '+proj=longlat +ellps=clrk80 +towgs84=-103.746,-9.614,-255.95,0,0,0,0 +no_defs +type=crs',
    geographic: true,
    accuracy: ACCURACY_NOTES.legacy,
    source: 'https://epsg.io/4196'
  },
  'EPSG:3347': {
    name: 'Belgian Congo 1950 / UTM 34S (EPSG:3347)',
    proj4: '+proj=utm +zone=34 +south +ellps=clrk80 +towgs84=-103.746,-9.614,-255.95,0,0,0,0 +units=m +no_defs +type=crs',
    zone: 34,
    hemisphere: 'S',
    accuracy: ACCURACY_NOTES.legacy,
    source: 'https://epsg.io/3347'
  },
  'EPSG:3348': {
    name: 'Belgian Congo 1950 / UTM 35S (EPSG:3348)',
    proj4: '+proj=utm +zone=35 +south +ellps=clrk80 +towgs84=-103.746,-9.614,-255.95,0,0,0,0 +units=m +no_defs +type=crs',
    zone: 35,
    hemisphere: 'S',
    accuracy: ACCURACY_NOTES.legacy,
    source: 'https://epsg.io/3348'
  },
  // Uganda national grids defined by EPSG, added from epsg.io on 2026-07-07.
  // EPSG source: https://epsg.io/10792 PROJ.4 export.
  'EPSG:10792': {
    name: 'UGRF / UTM zone 35N (EPSG:10792)',
    proj4: '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    zone: 35,
    hemisphere: 'N',
    datumFamily: 'ugrf',
    accuracy: ACCURACY_NOTES.ugrf,
    source: 'https://epsg.io/10792'
  },
  // EPSG source: https://epsg.io/10793 PROJ.4 export.
  'EPSG:10793': {
    name: 'UGRF / UTM zone 36N (EPSG:10793)',
    proj4: '+proj=utm +zone=36 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    zone: 36,
    hemisphere: 'N',
    datumFamily: 'ugrf',
    accuracy: ACCURACY_NOTES.ugrf,
    source: 'https://epsg.io/10793'
  },
  // EPSG source: https://epsg.io/10794 PROJ.4 export.
  'EPSG:10794': {
    name: 'UGRF / UTM zone 36S (EPSG:10794)',
    proj4: '+proj=utm +zone=36 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    zone: 36,
    hemisphere: 'S',
    datumFamily: 'ugrf',
    accuracy: ACCURACY_NOTES.ugrf,
    source: 'https://epsg.io/10794'
  },
  // EPSG source: https://epsg.io/10795 PROJ.4 export.
  'EPSG:10795': {
    name: 'UGRF / UTM zone 35S (EPSG:10795)',
    proj4: '+proj=utm +zone=35 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    zone: 35,
    hemisphere: 'S',
    datumFamily: 'ugrf',
    accuracy: ACCURACY_NOTES.ugrf,
    source: 'https://epsg.io/10795'
  },
  'EPSG:4759': {
    name: 'Rwanda list legacy value (EPSG:4759)',
    proj4: '+proj=longlat +datum=WGS84 +no_defs +type=crs',
    geographic: true,
    accuracy: 'Retained from the existing page. EPSG:4759 is not a Rwanda 2000 CRS; use WGS84 / UTM 35S or 36S for Rwanda unless your project specifies a local grid.',
    source: 'https://epsg.io/4759'
  }
};

for (let zone = 32; zone <= 39; zone += 1) {
  CRS_DEFS[`EPSG:326${zone}`] = {
    name: `WGS84 / UTM zone ${zone}N (EPSG:326${zone})`,
    proj4: `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs +type=crs`,
    zone,
    hemisphere: 'N',
    accuracy: ACCURACY_NOTES.wgs84,
    source: `https://epsg.io/326${zone}`
  };
  CRS_DEFS[`EPSG:327${zone}`] = {
    name: `WGS84 / UTM zone ${zone}S (EPSG:327${zone})`,
    proj4: `+proj=utm +zone=${zone} +south +datum=WGS84 +units=m +no_defs +type=crs`,
    zone,
    hemisphere: 'S',
    accuracy: ACCURACY_NOTES.wgs84,
    source: `https://epsg.io/327${zone}`
  };
}

export function registerProjections() {
  Object.entries(CRS_DEFS).forEach(([code, def]) => {
    window.proj4.defs(code, def.proj4);
  });
}

export function isGeographic(crs) {
  return Boolean(CRS_DEFS[crs]?.geographic) || crs === 'EPSG:4326';
}

export function utmZoneFromLon(lon) {
  return Math.max(1, Math.min(60, Math.floor((lon + 180) / 6) + 1));
}

export function wgs84UtmCode(lat, lon) {
  const zone = utmZoneFromLon(lon);
  return `EPSG:${lat >= 0 ? 326 : 327}${String(zone).padStart(2, '0')}`;
}

export function projectionDetails(from, to) {
  const source = CRS_DEFS[from];
  const target = CRS_DEFS[to];
  const rows = [];
  rows.push(`Input CRS: ${source?.name || from}`);
  rows.push(source?.proj4 || 'Auto-detected at conversion time');
  rows.push('');
  rows.push(`Output CRS: ${target?.name || to}`);
  rows.push(to === 'UTM_AUTO' ? 'UTM zone is calculated from WGS84 longitude and hemisphere for each point.' : target?.proj4 || 'Definition unavailable.');
  rows.push('');
  rows.push(`Input source: ${source?.source || 'Generated/client-side'}`);
  rows.push(`Output source: ${target?.source || (to === 'UTM_AUTO' ? 'Generated from WGS84 longitude' : 'Generated/client-side')}`);
  rows.push('');
  const notes = new Set([source?.accuracy, target?.accuracy].filter(Boolean));
  if ([from, to].some((code) => CRS_DEFS[code]?.datumFamily === 'arc1960')) notes.add(ACCURACY_NOTES.arc1960);
  rows.push(`Accuracy note: ${Array.from(notes).join(' ') || ACCURACY_NOTES.wgs84}`);
  rows.push('Rwanda/Burundi note: EPSG search results show Rwanda primarily through WGS84 UTM 35S/36S, and Burundi through WGS84 UTM/Arc 1960 UTM coverage; no distinct Rwanda or Burundi national grid CRS was added unless defined by EPSG.');
  return rows.join('\n');
}
