# PflegeBuddy

Eine React Native Anwendung für die Pflegeverwaltung.

## Inhaltsverzeichnis
- [Übersicht](#übersicht)
- [Projektstruktur](#projektstruktur)
- [Komponenten](#komponenten)
- [Datenstrukturen](#datenstrukturen)
- [API-Endpunkte](#api-endpunkte)
- [Entwicklung](#entwicklung)
- [Splash Screen Video](#splash-screen-video)
- [Tests](#tests)
- [Deployment](#deployment)

## Übersicht

Die PflegeBuddy ist eine mobile Anwendung zur Verwaltung von Pflegeaufgaben und -dokumentation. Sie bietet Funktionen für Pflegekräfte, Patienten und Verwaltungspersonal.

## Projektstruktur

```
src/
├── components/     # Wiederverwendbare UI-Komponenten
├── screens/        # Bildschirm-Komponenten
├── navigation/     # Navigationslogik
├── store/         # State Management
├── services/      # API und Backend-Services
├── utils/         # Hilfsfunktionen
├── context/       # React Context
├── types/         # TypeScript Typdefinitionen
└── scripts/       # Build- und Deployment-Skripte
```

## Komponenten

### Hauptkomponenten

- **App.tsx**: Root-Komponente der Anwendung
- **NavigationContainer**: Verwaltet die App-Navigation
- **AuthStack**: Authentifizierungs-Flow
- **MainStack**: Hauptanwendungs-Flow

### UI-Komponenten

- **Button**: Angepasste Button-Komponente
- **Input**: Formular-Eingabefelder
- **Card**: Container für zusammengehörige Informationen
- **Modal**: Dialog-Fenster
- **List**: Listenansicht mit Sortier- und Filterfunktionen

## Datenstrukturen

### Benutzer
```typescript
interface User {
  id: string;
  email: string;
  role: 'admin' | 'nurse' | 'patient';
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Pflegeaufgabe
```typescript
interface CareTask {
  id: string;
  patientId: string;
  nurseId: string;
  type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: Date;
  completedAt?: Date;
}
```

### Patient
```typescript
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  careLevel: number;
  roomNumber: string;
  medicalHistory: string[];
  currentMedication: string[];
}
```

## API-Endpunkte

### Authentifizierung
- `POST /auth/login`: Benutzeranmeldung
- `POST /auth/register`: Benutzerregistrierung
- `POST /auth/refresh`: Token-Aktualisierung

### Benutzer
- `GET /users`: Benutzerliste abrufen
- `GET /users/:id`: Benutzerdetails abrufen
- `PUT /users/:id`: Benutzer aktualisieren

### Patienten
- `GET /patients`: Patientenliste abrufen
- `GET /patients/:id`: Patientendetails abrufen
- `POST /patients`: Neuen Patienten anlegen
- `PUT /patients/:id`: Patienten aktualisieren

### Pflegeaufgaben
- `GET /tasks`: Aufgabenliste abrufen
- `GET /tasks/:id`: Aufgabendetails abrufen
- `POST /tasks`: Neue Aufgabe anlegen
- `PUT /tasks/:id`: Aufgabe aktualisieren
- `PUT /tasks/:id/complete`: Aufgabe als erledigt markieren

## Entwicklung

### Voraussetzungen
- Node.js (v14 oder höher)
- npm oder yarn
- React Native CLI
- Android Studio (für Android-Entwicklung)
- Xcode (für iOS-Entwicklung)

### Installation
```bash
# Dependencies installieren
npm install

# Metro Server starten
npm start

# App starten (Android)
npm run android

# App starten (iOS)
npm run ios
```

### Entwicklungsumgebung
- ESLint für Code-Linting
- Prettier für Code-Formatierung
- TypeScript für statische Typisierung
- Jest für Tests

## Splash Screen Video

Die App zeigt beim Start ein Video als Splash Screen an. Um das Standardvideo zu ersetzen:

1. Erstellen Sie ein MP4-Video mit dem Namen `splash.mp4`
2. Kopieren Sie das Video in den Ordner `assets/videos/`
3. Bauen Sie die App neu

Das Video sollte kurz sein (3-5 Sekunden) und ein Format haben, das von mobilen Geräten gut verarbeitet werden kann (empfohlen: H.264-Codec, Auflösung 720p oder weniger).

## Tests

```bash
# Tests ausführen
npm test

# Tests mit Coverage
npm run test:coverage
```

## Deployment

### Android
1. Build erstellen: `npm run android:build`
2. APK signieren
3. Play Store Deployment

### iOS
1. Build erstellen: `npm run ios:build`
2. App Store Deployment

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
