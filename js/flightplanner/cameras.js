// cameras.js — drone camera sensor presets for photogrammetry GSD math.
// Strict ES module. All measurements in mm (sensor/focal) and px (image).
// GSD formula: GSD_cm_per_px = (sensorWidth_mm * altitude_m * 100) / (focalLength_mm * imageWidth_px)
// Inverted: altitude_m = GSD_cm_per_px * focalLength_mm * imageWidth_px / (sensorWidth_mm * 100)

export const CAMERA_PRESETS = [
  {
    id: 'mini4pro',
    label: 'DJI Mini 4 Pro',
    sensorWidth: 9.6,
    sensorHeight: 7.2,
    imageWidth: 8064,
    imageHeight: 6048,
    focalLength: 6.7,
    hasMechanicalShutter: false,
    notes: '1/1.3" CMOS, 48MP. No mechanical shutter — keep speed modest at low altitudes.'
  },
  {
    id: 'air3',
    label: 'DJI Air 3',
    sensorWidth: 13.2,
    sensorHeight: 9.9,
    imageWidth: 8192,
    imageHeight: 6144,
    focalLength: 6.7,
    hasMechanicalShutter: false,
    notes: '1/1.3" CMOS, 48MP wide camera. Electronic shutter.'
  },
  {
    id: 'mavic3e',
    label: 'DJI Mavic 3 Enterprise (M3E)',
    sensorWidth: 17.3,
    sensorHeight: 13.0,
    imageWidth: 5280,
    imageHeight: 3956,
    focalLength: 12.0,
    hasMechanicalShutter: true,
    notes: '4/3 CMOS, 20MP, mechanical shutter, 24mm eqv. Industry standard for mapping.'
  },
  {
    id: 'p4p',
    label: 'DJI Phantom 4 Pro (P4P)',
    sensorWidth: 13.2,
    sensorHeight: 9.9,
    imageWidth: 5472,
    imageHeight: 3648,
    focalLength: 8.8,
    hasMechanicalShutter: true,
    notes: '1" CMOS, 20MP, mechanical shutter. Classic mapping airframe.'
  },
  {
    id: 'm350p1',
    label: 'DJI Matrice 350 RTK + P1',
    sensorWidth: 35.9,
    sensorHeight: 24.0,
    imageWidth: 8192,
    imageHeight: 5460,
    focalLength: 24.0,
    hasMechanicalShutter: true,
    notes: 'Full-frame P1 payload, 35mm lens option. RTK-enabled, enterprise mapping.'
  },
  {
    id: 'custom',
    label: 'Custom camera',
    sensorWidth: 17.3,
    sensorHeight: 13.0,
    imageWidth: 5280,
    imageHeight: 3956,
    focalLength: 12.0,
    hasMechanicalShutter: true,
    notes: 'Enter your sensor dimensions, image size and focal length (actual, not 35mm equiv).'
  }
];

export function getCameraById(id) {
  return CAMERA_PRESETS.find((c) => c.id === id) || CAMERA_PRESETS[2];
}

// GSD (cm/px) from altitude (m).
export function gsdFromAltitude(cam, altitudeM) {
  if (!cam || !Number.isFinite(altitudeM) || altitudeM <= 0) return 0;
  return (cam.sensorWidth * altitudeM * 100) / (cam.focalLength * cam.imageWidth);
}

// Altitude (m) from target GSD (cm/px).
export function altitudeFromGsd(cam, gsdCmPerPx) {
  if (!cam || !Number.isFinite(gsdCmPerPx) || gsdCmPerPx <= 0) return 0;
  return (gsdCmPerPx * cam.focalLength * cam.imageWidth) / (cam.sensorWidth * 100);
}

// Ground footprint dimensions (metres) at a given altitude (or derived from GSD).
export function groundFootprint(cam, altitudeM) {
  if (!cam || !Number.isFinite(altitudeM) || altitudeM <= 0) {
    return { width: 0, height: 0 };
  }
  const gsd = gsdFromAltitude(cam, altitudeM); // cm/px
  const widthM = (cam.imageWidth * gsd) / 100;  // px * cm/px / 100 = m
  const heightM = (cam.imageHeight * gsd) / 100;
  return { width: widthM, height: heightM, gsd };
}
