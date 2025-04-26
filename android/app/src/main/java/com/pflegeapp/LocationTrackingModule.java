package com.pflegeapp;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONException;
import org.json.JSONObject;

public class LocationTrackingModule extends ReactContextBaseJavaModule {
    private static final String TAG = "LocationTrackingModule";
    private static final String MODULE_NAME = "LocationTrackingModule";
    
    private LocationTrackingService trackingService;
    private boolean isBound = false;
    
    private final ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            LocationTrackingService.LocalBinder binder = (LocationTrackingService.LocalBinder) service;
            trackingService = binder.getService();
            isBound = true;
            
            // Callback für Standortupdates registrieren
            trackingService.setLocationUpdateCallback((status, latitude, longitude) -> {
                // Event an React Native senden
                WritableMap params = Arguments.createMap();
                params.putString("status", status);
                params.putDouble("latitude", latitude);
                params.putDouble("longitude", longitude);
                
                getReactApplicationContext()
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("onLocationStatusChange", params);
                
                Log.d(TAG, "Standort-Update an React Native gesendet: " + status);
            });
            
            Log.d(TAG, "Service erfolgreich verbunden");
            
            // Status-Event senden, dass der Service verbunden ist
            WritableMap initParams = Arguments.createMap();
            initParams.putBoolean("serviceConnected", true);
            getReactApplicationContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onServiceConnectionChange", initParams);
        }
        
        @Override
        public void onServiceDisconnected(ComponentName name) {
            trackingService = null;
            isBound = false;
            Log.d(TAG, "Service getrennt");
            
            // Status-Event senden, dass der Service getrennt wurde
            WritableMap params = Arguments.createMap();
            params.putBoolean("serviceConnected", false);
            getReactApplicationContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onServiceConnectionChange", params);
        }
    };
    
    public LocationTrackingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        try {
            Log.d(TAG, "LocationTrackingModule wird initialisiert");
            // Wir machen nichts weiter in der Initialisierung, um Abstürze zu vermeiden
        } catch (Exception e) {
            Log.e(TAG, "Fehler bei der Initialisierung des LocationTrackingModules", e);
        }
    }
    
    @Override
    public String getName() {
        return MODULE_NAME;
    }
    
    @ReactMethod
    public void startTracking(ReadableMap workLocation) {
        try {
            Log.d(TAG, "startTracking aufgerufen mit: " + (workLocation != null ? "Arbeitsort-Daten" : "null"));
            
            Activity activity = getCurrentActivity();
            if (activity == null) {
                Log.e(TAG, "Activity ist null, kann Tracking nicht starten");
                sendErrorEvent("Activity ist null, kann Tracking nicht starten");
                return;
            }
            
            // Konvertiere ReadableMap zu JSON
            JSONObject workLocationJson = new JSONObject();
            try {
                if (workLocation != null) {
                    if (workLocation.hasKey("id")) workLocationJson.put("id", workLocation.getString("id"));
                    if (workLocation.hasKey("name")) workLocationJson.put("name", workLocation.getString("name"));
                    if (workLocation.hasKey("address")) workLocationJson.put("address", workLocation.getString("address"));
                    if (workLocation.hasKey("latitude")) workLocationJson.put("latitude", workLocation.getDouble("latitude"));
                    if (workLocation.hasKey("longitude")) workLocationJson.put("longitude", workLocation.getDouble("longitude"));
                    if (workLocation.hasKey("radius")) workLocationJson.put("radius", workLocation.getInt("radius"));
                    
                    Log.d(TAG, "Erstelltes workLocationJson: " + workLocationJson.toString());
                } else {
                    Log.e(TAG, "workLocation ist null");
                    sendErrorEvent("workLocation Parameter fehlt");
                    return;
                }
            } catch (JSONException e) {
                Log.e(TAG, "Fehler beim Erstellen des work location JSON", e);
                sendErrorEvent("Fehler beim Erstellen des Arbeitsortes: " + e.getMessage());
                return;
            } catch (Exception e) {
                Log.e(TAG, "Unerwarteter Fehler beim Verarbeiten des workLocation-Parameters", e);
                sendErrorEvent("Unerwarteter Fehler: " + e.getMessage());
                return;
            }
            
            Log.d(TAG, "Starte Tracking mit Arbeitsort: " + workLocationJson.toString());
            
            try {
                // Starte den Service mit ACTION_START
                Intent intent = new Intent(activity, LocationTrackingService.class);
                intent.setAction("START_TRACKING");
                intent.putExtra("workLocation", workLocationJson.toString());
                
                // Auf Android 8+ (Oreo) muss ein Foreground Service explizit gestartet werden
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    Log.d(TAG, "Starte als Foreground-Service (Android 8+)");
                    activity.startForegroundService(intent);
                } else {
                    Log.d(TAG, "Starte als normalen Service (Android < 8)");
                    activity.startService(intent);
                }
                
                // Binde den Service, falls noch nicht gebunden
                if (!isBound) {
                    Log.d(TAG, "Verbinde mit Service...");
                    Intent bindIntent = new Intent(activity, LocationTrackingService.class);
                    boolean bindSuccess = activity.bindService(bindIntent, serviceConnection, Context.BIND_AUTO_CREATE);
                    Log.d(TAG, "Versuch, Service zu binden: " + (bindSuccess ? "erfolgreich" : "fehlgeschlagen"));
                } else {
                    Log.d(TAG, "Service bereits gebunden, keine erneute Bindung nötig");
                }
                
                Log.d(TAG, "startTracking abgeschlossen");
                
                // Status-Event senden
                WritableMap params = Arguments.createMap();
                params.putBoolean("trackingStarted", true);
                getReactApplicationContext()
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("onTrackingStatusChange", params);
            } catch (Exception e) {
                Log.e(TAG, "Fehler beim Starten des Trackings", e);
                sendErrorEvent("Fehler beim Starten des Trackings: " + e.getMessage());
            }
        } catch (Exception e) {
            Log.e(TAG, "Fehler beim Verarbeiten des startTracking-Parameters", e);
            sendErrorEvent("Fehler beim Verarbeiten des startTracking-Parameters: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void stopTracking() {
        Log.d(TAG, "stopTracking aufgerufen");
        
        Activity activity = getCurrentActivity();
        if (activity == null) {
            Log.e(TAG, "Activity ist null, kann Tracking nicht stoppen");
            return;
        }
        
        try {
            // Stoppe den Service
            Intent intent = new Intent(activity, LocationTrackingService.class);
            intent.setAction("STOP_TRACKING");
            activity.startService(intent);
            
            // Unbind vom Service
            if (isBound) {
                Log.d(TAG, "Trenne Verbindung zum Service");
                activity.unbindService(serviceConnection);
                isBound = false;
            } else {
                Log.d(TAG, "Service war nicht gebunden, kein Unbind nötig");
            }
            
            Log.d(TAG, "stopTracking abgeschlossen");
            
            // Status-Event senden
            WritableMap params = Arguments.createMap();
            params.putBoolean("trackingStopped", true);
            getReactApplicationContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onTrackingStatusChange", params);
        } catch (Exception e) {
            Log.e(TAG, "Fehler beim Stoppen des Trackings", e);
            sendErrorEvent("Fehler beim Stoppen des Trackings: " + e.getMessage());
        }
    }
    
    /**
     * Überprüft, ob der Tracking-Dienst aktiv ist
     * @param options Optionen für den Check (wird nicht verwendet, nur für API-Kompatibilität)
     * @param promise Promise zur Rückgabe des Ergebnisses
     */
    @ReactMethod
    public void isTracking(ReadableMap options, Promise promise) {
        Log.d(TAG, "isTracking aufgerufen");
        try {
            boolean isActive = trackingService != null && isBound;
            Log.d(TAG, "Tracking aktiv: " + isActive + ", Service: " + (trackingService != null) + ", gebunden: " + isBound);
            promise.resolve(isActive);
        } catch (Exception e) {
            Log.e(TAG, "Fehler beim Überprüfen des Tracking-Status", e);
            promise.reject("ERROR", "Fehler beim Überprüfen des Tracking-Status: " + e.getMessage(), e);
        }
    }
    
    /**
     * Erzwingt eine sofortige Standortüberprüfung
     */
    @ReactMethod
    public void forceLocationCheck() {
        Log.d(TAG, "forceLocationCheck aufgerufen");
        
        Activity activity = getCurrentActivity();
        if (activity == null) {
            Log.e(TAG, "Activity ist null, kann Standortüberprüfung nicht erzwingen");
            return;
        }
        
        try {
            // Sende Intent zum Service
            Intent intent = new Intent(activity, LocationTrackingService.class);
            intent.setAction("FORCE_LOCATION_CHECK");
            activity.startService(intent);
            
            Log.d(TAG, "forceLocationCheck erfolgreich gesendet");
        } catch (Exception e) {
            Log.e(TAG, "Fehler beim Erzwingen der Standortüberprüfung", e);
            sendErrorEvent("Fehler beim Erzwingen der Standortüberprüfung: " + e.getMessage());
        }
    }
    
    /**
     * Sendet eine Fehlermeldung als Event an React Native
     */
    private void sendErrorEvent(String errorMessage) {
        WritableMap params = Arguments.createMap();
        params.putString("error", errorMessage);
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onTrackingError", params);
    }
} 