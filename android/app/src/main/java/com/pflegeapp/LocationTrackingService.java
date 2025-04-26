package com.pflegeapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Binder;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Timer;
import java.util.TimerTask;

public class LocationTrackingService extends Service implements LocationListener {
    private static final String TAG = "LocationTrackingService";
    private static final String NOTIFICATION_CHANNEL_ID = "location_tracking_channel";
    private static final int NOTIFICATION_ID = 10001;
    private static final long MIN_DISTANCE_CHANGE_FOR_UPDATES = 5; // 5 Meter
    private static final long MIN_TIME_BETWEEN_UPDATES = 1000 * 10; // 10 Sekunden
    private static final long CHECK_INTERVAL = 1000 * 20; // 20 Sekunden
    private static final float MIN_ACCURACY = 100.0f; // Minimum accuracy in meters
    private static final int LOCATION_BUFFER = 50; // 50 meters buffer

    private final IBinder binder = new LocalBinder();
    private LocationManager locationManager;
    private Handler handler;
    private Timer timer;
    private JSONObject workLocation;
    private Location lastKnownLocation;
    private boolean lastInsideStatus = false;
    
    // Callback Interface für Standortaktualisierungen
    public interface LocationUpdateCallback {
        void onLocationUpdate(String status, double latitude, double longitude);
    }
    
    private LocationUpdateCallback locationUpdateCallback;
    private PowerManager.WakeLock wakeLock;
    private boolean isRunning = false;
    private SharedPreferences sharedPreferences;

    public class LocalBinder extends Binder {
        LocationTrackingService getService() {
            return LocationTrackingService.this;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "LocationTrackingService onCreate");
        
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        handler = new Handler(Looper.getMainLooper());
        sharedPreferences = getSharedPreferences("LocationTracking", MODE_PRIVATE);
        
        // WakeLock für Hintergrundbetrieb - Verwende PARTIAL_WAKE_LOCK mit langer Timeout-Zeit
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK, 
            "PflegeApp:LocationTracking"
        );
        // Setze auf nicht-referenced, damit wir volle Kontrolle haben
        wakeLock.setReferenceCounted(false);
        
        // Notification Channel erstellen
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Service onStartCommand");
        
        // Sofort als Foreground-Service starten, um ANR zu vermeiden
        startForeground(NOTIFICATION_ID, createNotification("Standort wird überwacht..."));
        
        if (intent == null) {
            // Service wurde vom System neu gestartet - Tracking-Status wiederherstellen
            boolean wasTrackingActive = sharedPreferences.getBoolean("tracking_active", false);
            String savedWorkLocation = sharedPreferences.getString("work_location", null);
            
            if (wasTrackingActive && savedWorkLocation != null) {
                try {
                    workLocation = new JSONObject(savedWorkLocation);
                    startTracking();
                } catch (JSONException e) {
                    Log.e(TAG, "Error parsing saved work location", e);
                }
            }
            
            return START_STICKY;
        }
        
        String action = intent.getAction();
        if (action != null) {
            switch (action) {
                case "START_TRACKING":
                    String workLocationJson = intent.getStringExtra("workLocation");
                    if (workLocationJson != null) {
                        try {
                            workLocation = new JSONObject(workLocationJson);
                            
                            // Speichern für Wiederherstellung nach Neustart
                            sharedPreferences.edit()
                                .putString("work_location", workLocationJson)
                                .putBoolean("tracking_active", true)
                                .apply();
                                
                            startTracking();
                        } catch (JSONException e) {
                            Log.e(TAG, "Error parsing work location JSON", e);
                        }
                    }
                    break;
                case "STOP_TRACKING":
                    stopTracking();
                    
                    // Tracking-Status zurücksetzen
                    sharedPreferences.edit()
                        .putBoolean("tracking_active", false)
                        .apply();
                        
                    // Service beenden
                    stopForeground(true);
                    stopSelf();
                    break;
                case "FORCE_LOCATION_CHECK":
                    // Sofort eine Standortprüfung erzwingen
                    if (isRunning && workLocation != null) {
                        checkLocation();
                    }
                    break;
            }
        }
        
        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Standort-Tracking",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Benachrichtigungen für Standort-Tracking");
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private Notification createNotification(String content) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("Standort-Tracking")
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();
    }

    public void startTracking() {
        if (isRunning) return;
        Log.d(TAG, "Starting location tracking");
        
        // WakeLock aktivieren für unbegrenzte Zeit
        if (!wakeLock.isHeld()) {
            try {
                wakeLock.acquire(6 * 60 * 60 * 1000L); // 6 Stunden Timeout als Sicherheit
                Log.d(TAG, "Wake lock acquired for 6 hours");
            } catch (Exception e) {
                Log.e(TAG, "Failed to acquire wake lock", e);
            }
        }
        
        // LocationManager-Updates registrieren mit erhöhter Frequenz
        try {
            // GPS-Provider mit kürzeren Intervallen
            locationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    MIN_TIME_BETWEEN_UPDATES, // 10 Sekunden
                    MIN_DISTANCE_CHANGE_FOR_UPDATES, // 5 Meter
                    this
            );
            
            // Network-Provider für Indoor-Tracking
            locationManager.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
                    MIN_TIME_BETWEEN_UPDATES,
                    MIN_DISTANCE_CHANGE_FOR_UPDATES,
                    this
            );
            
            // Versuche auch passiven Provider zu nutzen
            try {
                locationManager.requestLocationUpdates(
                        LocationManager.PASSIVE_PROVIDER,
                        MIN_TIME_BETWEEN_UPDATES,
                        MIN_DISTANCE_CHANGE_FOR_UPDATES,
                        this
                );
            } catch (Exception e) {
                // Passiver Provider ist optional
                Log.d(TAG, "Passive provider not available", e);
            }
            
            Log.d(TAG, "All location providers registered");
        } catch (SecurityException e) {
            Log.e(TAG, "No location permission", e);
        }
        
        // Timer für regelmäßige Updates starten - kürzere Intervalle
        timer = new Timer();
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                // Regelmäßige Standortprüfung
                checkLocation();
                
                // Zusätzlich WakeLock erneuern
                if (!wakeLock.isHeld()) {
                    try {
                        wakeLock.acquire(6 * 60 * 60 * 1000L);
                        Log.d(TAG, "Wake lock renewed");
                    } catch (Exception e) {
                        Log.e(TAG, "Failed to renew wake lock", e);
                    }
                }
            }
        }, 0, CHECK_INTERVAL); // 20 Sekunden
        
        // Initialer Standortcheck sofort durchführen
        handler.post(this::checkLocation);
        
        isRunning = true;
        Log.d(TAG, "Location tracking started successfully");
    }

    public void stopTracking() {
        if (!isRunning) return;
        Log.d(TAG, "Stopping location tracking");
        
        // Timer anhalten
        if (timer != null) {
            timer.cancel();
            timer = null;
        }
        
        // Location-Updates beenden
        locationManager.removeUpdates(this);
        
        // Wake Lock freigeben
        if (wakeLock.isHeld()) {
            wakeLock.release();
        }
        
        // Foreground-Service stoppen
        stopForeground(true);
        
        isRunning = false;
    }

    private void checkLocation() {
        handler.post(() -> {
            try {
                if (workLocation == null) {
                    Log.d(TAG, "No work location defined, cannot check location");
                    return;
                }
                
                Log.d(TAG, "Checking current location...");
                
                // Prüfen, ob Standortdienste aktiviert sind
                boolean gpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
                boolean networkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
                
                Log.d(TAG, "Location providers status - GPS: " + gpsEnabled + ", Network: " + networkEnabled);
                
                if (!gpsEnabled && !networkEnabled) {
                    Log.e(TAG, "All location providers are disabled");
                    updateNotification("Standortdienste sind deaktiviert");
                    if (locationUpdateCallback != null) {
                        locationUpdateCallback.onLocationUpdate("error", 0, 0);
                    }
                    return;
                }
                
                // Letzten bekannten Standort abrufen - mit Priorität für GPS
                Location currentLocation = null;
                long maxAgeMs = 30000; // Maximal 30 Sekunden alt
                long minTime = System.currentTimeMillis() - maxAgeMs;
                
                try {
                    // Versuche aktuelle Standorte von allen verfügbaren Providern zu holen
                    // Sortiere nach Genauigkeit - GPS > Network > Passive
                    if (gpsEnabled) {
                        Location gpsLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                        if (gpsLocation != null && gpsLocation.getTime() > minTime) {
                            currentLocation = gpsLocation;
                            Log.d(TAG, "Using fresh GPS location with accuracy: " + gpsLocation.getAccuracy() + "m");
                        }
                    }

                    if (currentLocation == null && networkEnabled) {
                        Location networkLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                        if (networkLocation != null && networkLocation.getTime() > minTime) {
                            currentLocation = networkLocation;
                            Log.d(TAG, "Using fresh network location with accuracy: " + networkLocation.getAccuracy() + "m");
                        }
                    }
                    
                    // Fallback: Verwende ältere Standorte, wenn kein aktueller verfügbar ist
                    if (currentLocation == null && gpsEnabled) {
                        currentLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                        if (currentLocation != null) {
                            Log.d(TAG, "Using older GPS location from: " + new java.util.Date(currentLocation.getTime()));
                        }
                    }
                    
                    if (currentLocation == null && networkEnabled) {
                        currentLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                        if (currentLocation != null) {
                            Log.d(TAG, "Using older network location from: " + new java.util.Date(currentLocation.getTime()));
                        }
                    }
                    
                    // Letzte Chance: Durchsuche alle Provider
                    if (currentLocation == null) {
                        for (String provider : locationManager.getProviders(true)) {
                            Location location = locationManager.getLastKnownLocation(provider);
                            if (location != null) {
                                if (currentLocation == null || location.getAccuracy() < currentLocation.getAccuracy()) {
                                    currentLocation = location;
                                    Log.d(TAG, "Found location from provider: " + provider);
                                }
                            }
                        }
                    }
                } catch (SecurityException e) {
                    Log.e(TAG, "Security exception accessing locations", e);
                }
                
                // Wenn die Genauigkeit zu niedrig ist, behalte den letzten Status bei
                if (currentLocation.getAccuracy() > MIN_ACCURACY && lastKnownLocation != null) {
                    Log.d(TAG, "Location accuracy too low: " + currentLocation.getAccuracy() + "m > " + MIN_ACCURACY + "m");
                    currentLocation = lastKnownLocation;
                } else {
                    lastKnownLocation = currentLocation;
                }
                
                Log.d(TAG, "Current location determined - Lat: " + currentLocation.getLatitude() + 
                      ", Lng: " + currentLocation.getLongitude() + 
                      ", Accuracy: " + currentLocation.getAccuracy() + 
                      "m, Provider: " + currentLocation.getProvider());
                
                // Berechne Entfernung zum Arbeitsort
                double workLat = workLocation.getDouble("latitude");
                double workLng = workLocation.getDouble("longitude");
                int radius = workLocation.getInt("radius");
                
                // Prüfe zuerst auf exakte Übereinstimmung
                boolean isExactMatch = currentLocation.getLatitude() == workLat && 
                                     currentLocation.getLongitude() == workLng;
                
                if (isExactMatch) {
                    Log.d(TAG, "Exact coordinate match detected");
                    updateNotification("Du befindest dich an deinem Arbeitsort");
                    if (locationUpdateCallback != null) {
                        locationUpdateCallback.onLocationUpdate("inside", currentLocation.getLatitude(), currentLocation.getLongitude());
                    }
                    return;
                }
                
                Location workLoc = new Location("");
                workLoc.setLatitude(workLat);
                workLoc.setLongitude(workLng);
                
                float distance = currentLocation.distanceTo(workLoc);
                // Berücksichtige den Puffer
                distance = Math.max(0, distance - LOCATION_BUFFER);
                
                boolean isAtWorkLocation = distance <= radius;
                
                // Wenn die Genauigkeit zu niedrig ist, behalte den letzten Status bei
                if (currentLocation.getAccuracy() > MIN_ACCURACY) {
                    isAtWorkLocation = lastInsideStatus;
                } else {
                    lastInsideStatus = isAtWorkLocation;
                }
                
                // Aktualisiere Notification und Callback
                String status = isAtWorkLocation ? 
                        "Du befindest dich an deinem Arbeitsort" : 
                        "Du befindest dich nicht an deinem Arbeitsort";
                
                updateNotification(status);
                Log.d(TAG, "Updated notification with status: " + status);
                
                if (locationUpdateCallback != null) {
                    locationUpdateCallback.onLocationUpdate(
                            isAtWorkLocation ? "inside" : "outside",
                            currentLocation.getLatitude(),
                            currentLocation.getLongitude()
                    );
                    Log.d(TAG, "Called location update callback with status: " + 
                          (isAtWorkLocation ? "inside" : "outside"));
                } else {
                    Log.d(TAG, "No location update callback registered");
                }
                
                Log.d(TAG, "Location check: " + status + " (Distance: " + distance + "m, Radius: " + radius + "m, Accuracy: " + currentLocation.getAccuracy() + "m)");
                
            } catch (Exception e) {
                Log.e(TAG, "Error in checkLocation", e);
                if (locationUpdateCallback != null) {
                    locationUpdateCallback.onLocationUpdate("error", 0, 0);
                }
            }
        });
    }

    private void updateNotification(String content) {
        Notification notification = createNotification(content);
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(NOTIFICATION_ID, notification);
        Log.d(TAG, "Notification updated: " + content);
    }

    public void setLocationUpdateCallback(LocationUpdateCallback callback) {
        this.locationUpdateCallback = callback;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    @Override
    public void onLocationChanged(Location location) {
        Log.d(TAG, "Location changed: " + location.getLatitude() + ", " + location.getLongitude() + 
              ", Accuracy: " + location.getAccuracy() + "m");
        checkLocation();
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {
        // Veraltet, aber für ältere API-Levels erforderlich
    }

    @Override
    public void onProviderEnabled(String provider) {
        // Provider wurde aktiviert
    }

    @Override
    public void onProviderDisabled(String provider) {
        // Provider wurde deaktiviert
    }

    @Override
    public void onDestroy() {
        stopTracking();
        super.onDestroy();
    }
} 