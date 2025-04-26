@echo off
setlocal enabledelayedexpansion

echo.
echo ==========================================================
echo   PflegeApp - Optimierter App-Bundle-Build
echo ==========================================================
echo.

echo [1/5] Bereinigen des Build-Verzeichnisses...
cd ../android && .\gradlew.bat clean
if %ERRORLEVEL% neq 0 (
    echo Fehler beim Bereinigen des Build-Verzeichnisses.
    exit /b %ERRORLEVEL%
)
echo Build-Verzeichnis erfolgreich bereinigt.
echo.

echo [2/5] Aktualisiere Node-Module...
cd .. && npm install
if %ERRORLEVEL% neq 0 (
    echo Fehler beim Aktualisieren der Node-Module.
    exit /b %ERRORLEVEL%
)
echo Node-Module erfolgreich aktualisiert.
echo.

echo [3/5] Linting und Typenprüfung...
npm run lint
if %ERRORLEVEL% neq 0 (
    echo Linting-Fehler gefunden. Diese sollten behoben werden.
    echo Drücken Sie ENTER, um fortzufahren oder STRG+C zum Abbrechen.
    pause > nul
)
echo Linting abgeschlossen.
echo.

echo [4/5] Erstelle optimierten Android App Bundle (AAB)...
cd android && .\gradlew.bat bundleRelease --info
if %ERRORLEVEL% neq 0 (
    echo Fehler beim Erstellen des App Bundles.
    exit /b %ERRORLEVEL%
)
echo App Bundle erfolgreich erstellt.
echo.

echo [5/5] Erstelle APK (für direkte Installation)...
.\gradlew.bat assembleRelease
if %ERRORLEVEL% neq 0 (
    echo Fehler beim Erstellen der APK.
    exit /b %ERRORLEVEL%
)
echo APK erfolgreich erstellt.
echo.

echo ==========================================================
echo   BUILD ERFOLGREICH ABGESCHLOSSEN
echo ==========================================================
echo.
echo App Bundle (AAB) befindet sich in:
echo   android\app\build\outputs\bundle\release\app-release.aab
echo.
echo APK befindet sich in:
echo   android\app\build\outputs\apk\release\app-release.apk
echo.
echo Diese Dateien sind für die Produktion optimiert mit:
echo  - Aktiviertem ProGuard/R8
echo  - Hermes JavaScript-Engine
echo  - Ressourcen-Optimierung
echo  - Code-Minimierung
echo ==========================================================

cd ..\scripts
exit /b 0 