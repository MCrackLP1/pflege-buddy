package com.pflegeapp

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> {
          try {
            return PackageList(this).packages.apply {
              // Packages vorsichtig hinzufügen
              try {
                // LocationTrackingPackage wieder aktiviert
                add(LocationTrackingPackage())
                Log.d("MainApplication", "LocationTrackingPackage erfolgreich geladen")
              } catch (e: Exception) {
                Log.e("MainApplication", "Fehler beim Laden von LocationTrackingPackage", e)
              }
            }
          } catch (e: Exception) {
            Log.e("MainApplication", "Fehler beim Laden der Packages", e)
            return ArrayList() // Leere Liste als Fallback
          }
        }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = false
        override val isHermesEnabled: Boolean = true
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    try {
      // SoLoader mit Fehlerbehandlung initialisieren
      try {
        SoLoader.init(this, OpenSourceMergedSoMapping)
        Log.d("MainApplication", "SoLoader erfolgreich initialisiert")
      } catch (e: Exception) {
        Log.e("MainApplication", "Fehler bei SoLoader.init", e)
      }
      
      // Verzögerte Initialisierung anderer Komponenten
      Thread {
        try {
          Log.d("MainApplication", "Verzögerte Initialisierung gestartet")
          // Hier könnten weitere Initialisierungen stattfinden
          Thread.sleep(1000) // Kleine Verzögerung
          Log.d("MainApplication", "Verzögerte Initialisierung abgeschlossen")
        } catch (e: Exception) {
          Log.e("MainApplication", "Fehler bei verzögerter Initialisierung", e)
        }
      }.start()
      
      // Deaktiviere die neue Architektur
      // if (reactNativeHost.isNewArchEnabled) {
      //   load()
      // }
    } catch (e: Exception) {
      Log.e("MainApplication", "Kritischer Fehler beim App-Start", e)
    }
  }
}
