import { registerPlugin, Capacitor } from "@capacitor/core";
import api from "./api";

// Register native plugin (available when running inside the Android APK)
export const NativeCallLog = registerPlugin("DeviceCallLog");

export const isNativeApp = () => Capacitor.isNativePlatform();

/**
 * Reads real-time call logs from the Android phone
 */
export async function getDeviceCallStats() {
  if (!isNativeApp()) {
    return null;
  }

  try {
    const res = await NativeCallLog.getTodayCalls();
    return res;
  } catch (err) {
    console.warn("[DeviceCallLog] Native call read failed:", err);
    return null;
  }
}

/**
 * Periodically syncs native device call logs to the CRM server and Google Sheet
 */
export async function syncDeviceCallsToBackend(employeeId) {
  if (!isNativeApp() || !employeeId) return null;

  try {
    const stats = await getDeviceCallStats();
    if (!stats || !stats.calls) return stats;

    await api.post("/employee/calls/sync-device-log", {
      employeeId,
      calls: stats.calls,
      totalDialed: stats.totalDialed,
      totalConnected: stats.totalConnected,
    }).catch(() => {});

    return stats;
  } catch (err) {
    console.warn("[DeviceCallLog] Backend sync failed:", err);
    return null;
  }
}
