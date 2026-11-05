/**
 * Calculate the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 *
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {number} Distance in meters rounded to 2 decimal places
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's mean radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const phi1 = toRad(Number(lat1));
  const phi2 = toRad(Number(lat2));
  const deltaPhi = toRad(Number(lat2) - Number(lat1));
  const deltaLambda = toRad(Number(lon2) - Number(lon1));

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 100) / 100;
};

/**
 * Validate that latitude and longitude are valid geographical numbers.
 *
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 * @returns {boolean} True if coordinates are within valid range
 */
export const isValidCoordinate = (lat, lon) => {
  const numLat = Number(lat);
  const numLon = Number(lon);
  if (isNaN(numLat) || isNaN(numLon)) return false;
  if (numLat < -90 || numLat > 90) return false;
  if (numLon < -180 || numLon > 180) return false;
  return true;
};

/**
 * Enforce maximum acceptable GPS accuracy threshold in meters.
 * Rejects coarse/spoofed network estimates exceeding 200m.
 */
export const MAX_ALLOWED_ACCURACY = 200; // meters

export const isAccuracyAcceptable = (accuracy) => {
  if (accuracy === undefined || accuracy === null) return true; // fallback if accuracy not supported by browser
  const numAcc = Number(accuracy);
  return !isNaN(numAcc) && numAcc <= MAX_ALLOWED_ACCURACY;
};
