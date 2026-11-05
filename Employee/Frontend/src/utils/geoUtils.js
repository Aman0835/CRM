/**
 * Helper to request browser GPS location with High Accuracy and descriptive error handling.
 *
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number }>}
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(
        new Error("Geolocation is not supported by your browser. Please use an updated modern browser.")
      );
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(
              new Error(
                "Location permission denied. Please allow location access in your browser settings to verify attendance."
              )
            );
            break;
          case error.POSITION_UNAVAILABLE:
            reject(
              new Error(
                "Location information is currently unavailable. Please ensure your device GPS is turned on."
              )
            );
            break;
          case error.TIMEOUT:
            reject(
              new Error(
                "Request to get location timed out. Please check your GPS signal and try again."
              )
            );
            break;
          default:
            reject(new Error("An error occurred while fetching your GPS location."));
            break;
        }
      },
      options
    );
  });
};
