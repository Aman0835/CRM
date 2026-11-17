package com.dosti.crm.employee;

import android.Manifest;
import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.provider.CallLog;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.Calendar;

@CapacitorPlugin(
    name = "DeviceCallLog",
    permissions = {
        @Permission(
            alias = "callLog",
            strings = {
                Manifest.permission.READ_CALL_LOG,
                Manifest.permission.READ_PHONE_STATE
            }
        )
    }
)
public class CallLogPlugin extends Plugin {

    @PluginMethod
    public void getTodayCalls(PluginCall call) {
        if (!getPermissionState("callLog").equals(PermissionState.GRANTED)) {
            requestPermissionForAlias("callLog", call, "callLogCallback");
            return;
        }
        fetchCalls(call);
    }

    @PermissionCallback
    private void callLogCallback(PluginCall call) {
        if (getPermissionState("callLog").equals(PermissionState.GRANTED)) {
            fetchCalls(call);
        } else {
            call.reject("Permission to read device call log was denied.");
        }
    }

    private void fetchCalls(PluginCall call) {
        try {
            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.HOUR_OF_DAY, 0);
            calendar.set(Calendar.MINUTE, 0);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);
            long startOfDayMs = calendar.getTimeInMillis();

            ContentResolver resolver = getContext().getContentResolver();
            Uri uri = CallLog.Calls.CONTENT_URI;
            String[] projection = new String[] {
                CallLog.Calls._ID,
                CallLog.Calls.NUMBER,
                CallLog.Calls.TYPE,
                CallLog.Calls.DATE,
                CallLog.Calls.DURATION,
                CallLog.Calls.CACHED_NAME
            };

            String selection = CallLog.Calls.DATE + " >= ?";
            String[] selectionArgs = new String[] { String.valueOf(startOfDayMs) };
            String sortOrder = CallLog.Calls.DATE + " DESC";

            Cursor cursor = resolver.query(uri, projection, selection, selectionArgs, sortOrder);

            int totalDialed = 0;
            int totalConnected = 0;
            JSArray callsArray = new JSArray();

            if (cursor != null) {
                while (cursor.moveToNext()) {
                    String number = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER));
                    int type = cursor.getInt(cursor.getColumnIndexOrThrow(CallLog.Calls.TYPE));
                    long date = cursor.getLong(cursor.getColumnIndexOrThrow(CallLog.Calls.DATE));
                    long duration = cursor.getLong(cursor.getColumnIndexOrThrow(CallLog.Calls.DURATION));
                    String name = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.CACHED_NAME));

                    boolean isOutgoing = (type == CallLog.Calls.OUTGOING_TYPE);
                    boolean isIncoming = (type == CallLog.Calls.INCOMING_TYPE);
                    boolean isMissed = (type == CallLog.Calls.MISSED_TYPE);

                    if (isOutgoing) {
                        totalDialed++;
                        if (duration > 0) {
                            totalConnected++;
                        }
                    }

                    JSObject callObj = new JSObject();
                    callObj.put("number", number != null ? number : "");
                    callObj.put("name", name != null ? name : "");
                    callObj.put("type", isOutgoing ? "outgoing" : (isIncoming ? "incoming" : (isMissed ? "missed" : "other")));
                    callObj.put("duration", duration);
                    callObj.put("date", date);
                    callObj.put("connected", duration > 0);
                    callsArray.put(callObj);
                }
                cursor.close();
            }

            int connectionRate = totalDialed > 0 ? (int) Math.round(((double) totalConnected / totalDialed) * 100) : 0;

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("totalDialed", totalDialed);
            result.put("totalConnected", totalConnected);
            result.put("connectionRate", connectionRate);
            result.put("calls", callsArray);

            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to read device call log: " + e.getMessage(), e);
        }
    }
}
