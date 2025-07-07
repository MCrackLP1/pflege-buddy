/**
 * LineEndingConfigurator.js
 * 
 * Dieses Skript standardisiert Zeilenende-Zeichen (Line Endings) in allen Projektdateien.
 * Es konvertiert alle Zeilenenden in LF (Unix-Style), unabhängig vom Betriebssystem.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const config = {
  // Zu durchsuchende Verzeichnisse
  includeDirs: ['src', '__tests__', 'scripts'],
  
  // Dateitypen, die konvertiert werden sollen
  includeExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.md'],
  
  // Zu ignorierende Verzeichnisse
  excludeDirs: ['node_modules', '.git', 'android/build', 'ios/build', 'build'],
  
  // Line ending to use (LF is recommended for cross-platform projects)
  lineEnding: 'LF', // 'LF' for Unix style, 'CRLF' for Windows style
};

/**
 * Rekursiv Dateien in einem Verzeichnis durchsuchen und konvertieren
 * @param {string} dir Verzeichnispfad
 */
function processDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Verzeichnisse rekursiv verarbeiten
      if (entry.isDirectory()) {
        if (!config.excludeDirs.includes(entry.name)) {
          processDirectory(fullPath);
        }
        continue;
      }
      
      // Dateien verarbeiten
      if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (config.includeExtensions.includes(ext)) {
          convertLineEndings(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Fehler beim Verarbeiten von ${dir}:`, error);
  }
}

/**
 * Konvertiert Zeilenenden in einer Datei
 * @param {string} filePath Dateipfad
 */
function convertLineEndings(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Konvertiere zu LF
    if (config.lineEnding === 'LF') {
      // Windows-style (CRLF) zu Unix-style (LF)
      content = content.replace(/\r\n/g, '\n');
    } 
    // Konvertiere zu CRLF
    else if (config.lineEnding === 'CRLF') {
      // Zuerst alle zu LF konvertieren
      content = content.replace(/\r\n/g, '\n');
      // Dann zu CRLF konvertieren
      content = content.replace(/\n/g, '\r\n');
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Konvertiert: ${filePath}`);
  } catch (error) {
    console.error(`Fehler beim Konvertieren von ${filePath}:`, error);
  }
}

/**
 * Hauptfunktion des Skripts
 */
function main() {
  console.log(`Starte Konvertierung von Zeilenenden zu ${config.lineEnding}...`);
  
  for (const dir of config.includeDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      console.log(`Verarbeite Verzeichnis: ${dirPath}`);
      processDirectory(dirPath);
    } else {
      console.warn(`Verzeichnis existiert nicht: ${dirPath}`);
    }
  }
  
  console.log('Zeilenenden-Konvertierung abgeschlossen!');
  
  // Optional: Konfiguriere Git, um Zeilenenden automatisch zu behandeln
  try {
    console.log('Konfiguriere Git für konsistente Zeilenenden...');
    execSync('git config --local core.autocrlf input');
    console.log('Git-Konfiguration abgeschlossen!');
  } catch (error) {
    console.error('Fehler bei der Git-Konfiguration:', error);
  }
}

// Führe Hauptfunktion aus
main(); 