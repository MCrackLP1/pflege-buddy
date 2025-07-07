@echo off
echo Building and installing PflegeBuddy...

echo Cleaning project...
cd android
call .\gradlew clean
cd ..

echo Clearing Metro bundler cache...
call npx react-native start --reset-cache --no-interactive

echo Building debug version...
cd android
call .\gradlew assembleDebug
cd ..

echo Installing app...
adb uninstall com.pflegeapp
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

echo Done!
pause 