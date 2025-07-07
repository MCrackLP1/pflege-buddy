package com.pflegebuddy.gbr;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

public class BootCompletedReceiver extends BroadcastReceiver {
    private static final String TAG = "BootCompletedReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction() != null && 
            intent.getAction().equals(Intent.ACTION_BOOT_COMPLETED)) {
            
            Log.d(TAG, "Boot completed received, checking if tracking was active");
            
            // Prüfen, ob Tracking aktiv war
            SharedPreferences sharedPreferences = 
                context.getSharedPreferences("LocationTrackingPrefs", Context.MODE_PRIVATE);
            
            boolean wasTrackingActive = sharedPreferences.getBoolean("tracking_active", false);
            String workLocation = sharedPreferences.getString("work_location", null);
            
        }
    }
} 