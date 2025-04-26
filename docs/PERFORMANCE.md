# PflegeBuddy Performance-Optimierungen

Dieses Dokument beschreibt die Performance-Optimierungen, die in der PflegeBuddy implementiert wurden.

## Build-Optimierungen

### Native App-Größe reduzieren

1. **ProGuard/R8 aktiviert**
   - Code-Minimierung und -Optimierung im Release-Build
   - Entfernung von ungenutztem Code
   - Umbenennung von Klassen und Methoden

2. **Ressourcen-Optimierung**
   - `shrinkResources=true` - Entfernt ungenutzte Ressourcen
   - `resConfigs="de"` - Beschränkt auf deutsche Sprachressourcen

3. **App Bundle Unterstützung**
   - Erstellung von App Bundles für den Google Play Store
   - Dynamische Feature-Verteilung nach Geräteanforderungen

4. **Gradle-Optimierungen**
   - Parallele Builds aktiviert
   - Gradle-Daemon für schnellere Builds
   - Build-Caching für inkrementelle Builds

### JavaScript-Engine Optimierungen

1. **Hermes Engine**
   - Hermes ist aktiviert und optimiert
   - Schnellerer App-Start
   - Geringerer Speicherverbrauch
   - Verbesserte JavaScript-Ausführung

2. **Hermes-Flags**
   - Optimierung für schnellere Ausführung
   - Aktivierte Garbage Collection für besseres Speichermanagement

## Code-Optimierungen

In der Datei `src/utils/performance.ts` wurden mehrere Hilfsfunktionen implementiert:

### 1. Interaktionen verzögern

```typescript
runAfterInteractions(task: () => any)
```

Führt einen Task aus, nachdem alle Interaktionen und Animationen abgeschlossen sind.
Dies verbessert die wahrgenommene Leistung, da die UI nicht blockiert wird.

**Verwendung:**

```typescript
import { runAfterInteractions } from '../utils/performance';

// Anstatt direkt:
loadData();

// Besser:
runAfterInteractions(() => {
  loadData();
});
```

### 2. Memoization

```typescript
memoize<T>(func: T): T
```

Eine Funktion, die Berechnungsergebnisse zwischenspeichert, um redundante Berechnungen zu vermeiden.

**Verwendung:**

```typescript
import { memoize } from '../utils/performance';

const calculateExpensiveResult = memoize((param1, param2) => {
  // Komplexe Berechnung
  return result;
});
```

### 3. Komponenten-Optimierung

```typescript
optimizeComponent<T>(Component: T): T
```

Optimiert eine Komponente mit React.memo, um unnötige Renderings zu vermeiden.

**Verwendung:**

```typescript
import { optimizeComponent } from '../utils/performance';

const MyComponent = (props) => {
  // Komponenten-Code
};

export default optimizeComponent(MyComponent);
```

### 4. Aufgaben verschieben

```typescript
deferTask(task: () => void, delay: number = 300)
```

Verschiebt nicht-kritische Aufgaben, um die Hauptausführung nicht zu blockieren.

**Verwendung:**

```typescript
import { deferTask } from '../utils/performance';

// Anstatt direkt:
analyticsSend();

// Besser:
deferTask(() => {
  analyticsSend();
});
```

### 5. Berechnungs-Cache

```typescript
cachedComputation<T>(key: string, compute: () => T, expireAfter?: number): T
```

Speichert Ergebnisse komplexer Berechnungen zwischen.

**Verwendung:**

```typescript
import { cachedComputation } from '../utils/performance';

const result = cachedComputation('uniqueKey', () => {
  return expensiveCalculation();
}, 60000); // Optional: Verfällt nach 60 Sekunden
```

## Weitere Empfehlungen

1. **Flatlist-Optimierung**
   - Verwende immer `keyExtractor`
   - Nutze `getItemLayout` wenn möglich
   - Verwende `windowSize`, `initialNumToRender` und `maxToRenderPerBatch`

2. **Bilder optimieren**
   - Verwende WebP oder optimierte JPEG/PNG
   - Implementiere Lazy Loading

3. **Vermeidung von Bridge-Übergängen**
   - Reduziere Aufrufe zwischen JavaScript und Native
   - Bündle Aufrufe wenn möglich

4. **Layout-Optimierungen**
   - Vermeide tiefe Nesting-Hierarchien
   - Verwende Memory-Profiling zum Erkennen von Speicherlecks

## Build-Skript

Ein optimierter Build kann mit dem bereitgestellten Build-Skript erstellt werden:

```
cd scripts
.\build-optimized.bat 