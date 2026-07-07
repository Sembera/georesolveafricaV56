export function toNumber(value) {
  if (value === null || value === undefined) return NaN;
  return Number(String(value).trim().replace(/,/g, ''));
}

export function dmsToDD(deg, min, sec) {
  const d = toNumber(deg);
  const sign = d < 0 ? -1 : 1;
  return sign * (Math.abs(d) + toNumber(min) / 60 + toNumber(sec) / 3600);
}

export function ddmToDD(deg, decMin) {
  const d = toNumber(deg);
  const sign = d < 0 ? -1 : 1;
  return sign * (Math.abs(d) + toNumber(decMin) / 60);
}

export function ddToDMS(dd, places = 2) {
  const abs = Math.abs(dd);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = (minFloat - min) * 60;
  return { deg, min, sec: Number(sec.toFixed(places)) };
}

export function ddToDDM(dd, places = 4) {
  const abs = Math.abs(dd);
  const deg = Math.floor(abs);
  const decMin = (abs - deg) * 60;
  return { deg, decMin: Number(decMin.toFixed(places)) };
}

export function formatDD(lat, lon, places = 6, notation = 'letters') {
  if (notation === 'signed') return `${lat.toFixed(places)}, ${lon.toFixed(places)}`;
  return `${Math.abs(lat).toFixed(places)}${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(places)}${lon >= 0 ? 'E' : 'W'}`;
}

export function formatDMS(lat, lon, places = 2, notation = 'letters') {
  const latDms = ddToDMS(lat, places);
  const lonDms = ddToDMS(lon, places);
  const latPrefix = notation === 'signed' && lat < 0 ? '-' : '';
  const lonPrefix = notation === 'signed' && lon < 0 ? '-' : '';
  const latSuffix = notation === 'letters' ? (lat >= 0 ? 'N' : 'S') : '';
  const lonSuffix = notation === 'letters' ? (lon >= 0 ? 'E' : 'W') : '';
  return `${latPrefix}${latDms.deg}°${latDms.min}'${latDms.sec}"${latSuffix}, ${lonPrefix}${lonDms.deg}°${lonDms.min}'${lonDms.sec}"${lonSuffix}`;
}

export function formatDDM(lat, lon, places = 4, notation = 'letters') {
  const latDdm = ddToDDM(lat, places);
  const lonDdm = ddToDDM(lon, places);
  const latPrefix = notation === 'signed' && lat < 0 ? '-' : '';
  const lonPrefix = notation === 'signed' && lon < 0 ? '-' : '';
  const latSuffix = notation === 'letters' ? (lat >= 0 ? 'N' : 'S') : '';
  const lonSuffix = notation === 'letters' ? (lon >= 0 ? 'E' : 'W') : '';
  return `${latPrefix}${latDdm.deg}°${latDdm.decMin}'${latSuffix}, ${lonPrefix}${lonDdm.deg}°${lonDdm.decMin}'${lonSuffix}`;
}

export function mgrsToLonLat(value) {
  if (!window.mgrs) throw new Error('MGRS library is unavailable.');
  const ref = String(value || '').trim().replace(/\s+/g, '').toUpperCase();
  if (!ref) throw new Error('Enter an MGRS grid reference.');
  if (typeof window.mgrs.toPoint === 'function') return window.mgrs.toPoint(ref);
  const bbox = window.mgrs.inverse(ref);
  return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
}

export function lonLatToMGRS(lon, lat, precision = 5) {
  if (!window.mgrs) return 'MGRS unavailable';
  return window.mgrs.forward([lon, lat], precision);
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

export function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
