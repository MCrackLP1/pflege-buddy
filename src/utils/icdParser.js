/**
 * icdParser.js
 * Parser für die ICD-10-GM ClaML XML-Datei
 * Konvertiert die ClaML-Daten in ein kompaktes JSON-Format für die App
 */

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

// Pfade konfigurieren
const INPUT_FILE = path.join(__dirname, '../../icd10gm2025syst-claml/Klassifikationsdateien/icd10gm2025syst_claml_20240913.xml');
const OUTPUT_FILE = path.join(__dirname, '../../assets/data/icd10gm.json');

// Main-Funktion zum Parsen der XML-Datei
async function parseICD10GM() {
  console.log('Starte Parsing der ICD-10-GM ClaML XML-Datei...');
  
  try {
    // XML-Datei einlesen
    const xmlData = fs.readFileSync(INPUT_FILE, 'utf8');
    console.log(`XML-Datei geladen (${(xmlData.length / 1024 / 1024).toFixed(2)} MB)`);
    
    // XML parsen
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    
    // Ergebnisarray für ICD-Codes
    const icdCodes = [];
    
    // Alle Klassen (ICD-Codes) extrahieren
    const classes = xmlDoc.getElementsByTagName('Class');
    console.log(`${classes.length} Klassen gefunden`);
    
    // Alle Rubrics (Titel, Inklusiva, Exklusiva) zur schnellen Referenz sammeln
    const rubrics = {};
    const allRubrics = xmlDoc.getElementsByTagName('Rubric');
    
    for (let i = 0; i < allRubrics.length; i++) {
      const rubric = allRubrics[i];
      const id = rubric.getAttribute('id');
      if (id) {
        const labels = rubric.getElementsByTagName('Label');
        if (labels.length > 0) {
          rubrics[id] = labels[0].textContent;
        }
      }
    }
    
    // Durch alle Klassen iterieren und relevante Informationen extrahieren
    for (let i = 0; i < classes.length; i++) {
      const classNode = classes[i];
      const kind = classNode.getAttribute('kind');
      
      // Nur reguläre Codes und Kapitel berücksichtigen
      if (kind === "category" || kind === "chapter") {
        const code = classNode.getAttribute('code');
        
        // Titel der Klasse finden
        let title = "";
        const rubricRefs = classNode.getElementsByTagName('Rubric');
        for (let j = 0; j < rubricRefs.length; j++) {
          const rubric = rubricRefs[j];
          const kind = rubric.getAttribute('kind');
          if (kind === "preferred") {
            const labels = rubric.getElementsByTagName('Label');
            if (labels.length > 0) {
              title = labels[0].textContent;
              break;
            }
          }
        }
        
        // Fachgebiet basierend auf dem Code bestimmen
        const fachgebiet = getFachgebietFromICDCode(code);
        
        // ICD-Code zur Liste hinzufügen
        if (code && title) {
          icdCodes.push({
            code,
            name: title,
            fachgebiet
          });
          
          // Statusanzeige alle 1000 Einträge
          if (icdCodes.length % 1000 === 0) {
            console.log(`${icdCodes.length} Codes verarbeitet...`);
          }
        }
      }
    }
    
    // Ergebnis sortieren
    icdCodes.sort((a, b) => a.code.localeCompare(b.code));
    
    // JSON-Datei schreiben
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(icdCodes, null, 2), 'utf8');
    console.log(`Parsing abgeschlossen. ${icdCodes.length} ICD-Codes wurden in ${OUTPUT_FILE} gespeichert.`);
    
  } catch (error) {
    console.error('Fehler beim Parsen der ICD-10-GM Datei:', error);
  }
}

/**
 * Leitet das Fachgebiet aus dem ICD-10 Code ab
 */
function getFachgebietFromICDCode(code) {
  const firstChar = code.charAt(0);
  
  // ICD-10 Kapitel nach ersten Buchstaben
  switch(firstChar) {
    case 'A':
    case 'B': return 'Infektiologie';
    case 'C':
    case 'D': return firstChar === 'C' || code.startsWith('D0') ? 'Onkologie' : 'Hämatologie';
    case 'E': return 'Endokrinologie';
    case 'F': return 'Psychiatrie';
    case 'G': return 'Neurologie';
    case 'H': return code.startsWith('H0') || code.startsWith('H1') || code.startsWith('H2') ? 'Augenheilkunde' : 'HNO';
    case 'I': return 'Kardiologie';
    case 'J': return 'Pneumologie';
    case 'K': return 'Gastroenterologie';
    case 'L': return 'Dermatologie';
    case 'M': return 'Orthopädie';
    case 'N': return 'Nephrologie';
    case 'O': return 'Gynäkologie';
    case 'P': return 'Pädiatrie';
    case 'Q': return 'Genetik';
    case 'R': return 'Allgemeinmedizin';
    case 'S':
    case 'T': return 'Chirurgie';
    case 'V':
    case 'W':
    case 'X':
    case 'Y': return 'Externe Ursachen';
    case 'Z': return 'Gesundheitsstatus';
    default: return 'Sonstige';
  }
}

// Script ausführen
parseICD10GM(); 