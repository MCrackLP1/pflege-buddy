# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Grundsätzliche Optimierungen zulassen
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification

# Keep entry points
-keep public class com.pflegeapp.MainActivity { *; }

# React Native
-keep,allowobfuscation class com.facebook.react.bridge.** { *; }
-keep,allowobfuscation class com.facebook.react.uimanager.** { *; }
-keep,allowobfuscation class com.facebook.react.CxxBridge { *; }
-keep,allowobfuscation class com.facebook.react.CxxBridgeModule { *; }
-keep,allowobfuscation class com.facebook.react.turbomodule.** { *; }
-keep,allowobfuscation class com.facebook.react.fabricmodule.** { *; }

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# React Navigation
-keep class com.facebook.react.ReactPackage { *; }
-keep class com.facebook.react.turbomodule.core.interfaces.** { *; }
-keep class com.facebook.react.ReactFragment { *; }
-keep class com.facebook.react.ReactActivity { *; }
-keep class com.facebook.react.modules.** { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Background Actions
-keep class com.asterinet.react.bgactions.** { *; }

# Permissions
-keep class com.zoontek.rnpermissions.** { *; }

# WebView
-keep class com.reactnativecommunity.webview.** { *; }

# Don't warn about missing React Native classes
-dontwarn com.facebook.react.**

# Crashlytics
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# Allgemeine Android-Optimierungen
-keepclassmembers class * extends com.facebook.react.bridge.NativeModule {
    @com.facebook.react.bridge.ReactMethod *;
}

# Serialisierbare Klassen behalten
-keepnames class * implements java.io.Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# XML
-keepclassmembers class * {
    void onXmlPullParserException(...);
}

# HTTP-Client/Networking
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase
