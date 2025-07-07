import { LexikonEntry } from '../types/types';

export const additionalLexikonEntries: LexikonEntry[] = [
  // PVK with extended information
  {
    id: 'pvk',
    term: 'PVK',
    definition: 'Peripherer Venenkatheter - Zugang über eine periphere Vene',
    description: 'Der periphere Venenkatheter (PVK) ist ein dünner, flexibler Kunststoffschlauch, der in eine periphere Vene eingeführt wird. Er dient zur intravenösen Verabreichung von Flüssigkeiten, Medikamenten und Blutprodukten sowie zur Blutentnahme. PVKs sind die häufigste Form des Gefäßzugangs in der Krankenhauspflege.',
    category: 'Medizinische Geräte',
    indications: [
      'Intravenöse Flüssigkeits- und Medikamentengabe',
      'Blutentnahmen für Laboruntersuchungen',
      'Notfallzugang bei kritischen Patienten',
      'Kurzzeitige intravenöse Therapie (<5 Tage)',
      'Kontrastmittelgabe bei bildgebenden Verfahren'
    ],
    contraindications: [
      'Infektion oder Hautveränderungen an der Einstichstelle',
      'Thrombose oder Sklerose der Zielvene',
      'Schwere Gerinnungsstörungen',
      'Fehlende Patientenkooperation bei wachem Patient'
    ],
    materials: [
      'Peripherer Venenkatheter (14-24 G)',
      'Desinfektionsmittel',
      'Sterile Handschuhe',
      'Stauschlauch oder Blutdruckmanschette',
      'Transparentverband oder Fixierpflaster',
      'Kochsalzlösung zum Spülen',
      'Dreiwegehahn oder Verschlussstopfen'
    ],
    procedure: '**Vorbereitung:**\n1. Patientenaufklärung und Einverständnis\n2. Handhygiene und sterile Handschuhe\n3. Geeignete Vene auswählen (meist Handrücken/Unterarm)\n\n**Durchführung:**\n1. Stauung proximal der Einstichstelle\n2. Hautdesinfektion und Einwirkzeit beachten\n3. Vene fixieren und Kanüle in 15-30° Winkel einstechen\n4. Bei Blutaspiration Mandrin zurückziehen\n5. Katheter vollständig vorschieben\n6. Stauung lösen und Durchgängigkeit prüfen\n7. Sicherer Verband und Fixierung',
    nursingConsiderations: [
      '**Venenwahl:** Distale Venen bevorzugen, proximale für späteren Zugang freihalten',
      '**Kaliber:** Größtmögliche Vene mit kleinstmöglichem Katheter wählen',
      '**Asepsis:** Sterile Technik zur Infektionsprophylaxe',
      '**Fixierung:** Sicheren Halt ohne Bewegungseinschränkung',
      '**Patientenkomfort:** Schmerzarme Technik und Lokalanästhesie erwägen'
    ],
    monitoring: [
      'Einstichstelle täglich auf Rötung, Schwellung, Schmerz kontrollieren',
      'Durchgängigkeit vor jeder Medikamentengabe prüfen',
      'Verbandswechsel alle 72h oder bei Verschmutzung',
      'Funktionsfähigkeit bei Infusionen überwachen',
      'Patientenbeschwerden ernst nehmen'
    ],
    complications: [
      '**Häufig:** Phlebitis, Infiltration, Dislokation',
      '**Gelegentlich:** Hämatom, Nervenverletzung',
      '**Selten:** Thrombose, Embolie',
      '**Sehr selten:** Sepsis, Kompartmentsyndrom'
    ],
    keyPoints: [
      '🎯 **Richtige Venenwahl:** Distale, gerade Venen bevorzugen',
      '🧼 **Aseptische Technik:** Infektionsrisiko minimieren',
      '⏰ **Wechselintervall:** Alle 72-96 Stunden oder bei Komplikationen',
      '🔍 **Tägliche Kontrolle:** Einstichstelle und Funktion prüfen',
      '💧 **Durchgängigkeit:** Regelmäßig spülen, besonders nach Medikamentengabe',
      '⚠️ **Komplikationen:** Frühe Erkennung verhindert schwere Folgen'
    ]
  },

  // Basic medical abbreviations (simple definitions only)
  {
    id: 'acls',
    term: 'ACLS',
    definition: 'Advanced Cardiac Life Support - erweiterte Maßnahmen zur Wiederbelebung bei Herzkreislaufstillstand'
  },
  {
    id: 'adh',
    term: 'ADH',
    definition: 'Antidiuretisches Hormon - reguliert den Wasserhaushalt des Körpers'
  },
  {
    id: 'adl',
    term: 'ADL',
    definition: 'Activities of Daily Living - Aktivitäten des täglichen Lebens, wichtiges Beurteilungskriterium in der Pflege'
  },
  {
    id: 'ards',
    term: 'ARDS',
    definition: 'Acute Respiratory Distress Syndrome - akutes Lungenversagen mit schwerer Hypoxämie'
  },
  {
    id: 'asd',
    term: 'ASD',
    definition: 'Atriumseptumdefekt - angeborener Herzfehler mit Öffnung zwischen den Vorhöfen'
  },
  {
    id: 'atls',
    term: 'ATLS',
    definition: 'Advanced Trauma Life Support - standardisiertes Behandlungsschema für Traumapatienten'
  },
  {
    id: 'bga',
    term: 'BGA',
    definition: 'Blutgasanalyse - Untersuchung zur Bestimmung von Sauerstoff- und Kohlendioxidgehalt sowie pH-Wert im Blut'
  },
  {
    id: 'bmi',
    term: 'BMI',
    definition: 'Body-Mass-Index - Verhältnis von Körpergewicht zu Körpergröße zum Quadrat, Maß für Unter-/Normal-/Übergewicht'
  },
  {
    id: 'bps',
    term: 'BPS',
    definition: 'Behavioral Pain Scale - Skala zur Schmerzerfassung bei nicht kommunikationsfähigen Patienten'
  },
  {
    id: 'cpap',
    term: 'CPAP',
    definition: 'Continuous Positive Airway Pressure - kontinuierlicher positiver Atemwegsdruck'
  },
  {
    id: 'cpp',
    term: 'CPP',
    definition: 'Cerebraler Perfusionsdruck - Differenz zwischen mittlerem arteriellen Druck und intrakraniellem Druck'
  },
  {
    id: 'crp',
    term: 'CRP',
    definition: 'C-reaktives Protein - Entzündungsmarker im Blut'
  },
  {
    id: 'cvvh',
    term: 'CVVH',
    definition: 'Kontinuierliche veno-venöse Hämofiltration - Nierenersatzverfahren bei akutem Nierenversagen'
  },
  {
    id: 'dka',
    term: 'DKA',
    definition: 'Diabetische Ketoazidose - lebensbedrohliche Stoffwechselentgleisung bei Diabetes mellitus'
  },
  {
    id: 'dns',
    term: 'DNS',
    definition: 'Durchblutung, Motorik, Sensibilität - wichtige neurologische Beurteilungskriterien'
  },
  {
    id: 'echo',
    term: 'ECHO',
    definition: 'Echokardiographie - Ultraschalluntersuchung des Herzens'
  },
  {
    id: 'ekg',
    term: 'EKG',
    definition: 'Elektrokardiogramm - Aufzeichnung der elektrischen Aktivität des Herzens'
  },
  {
    id: 'gcs',
    term: 'GCS',
    definition: 'Glasgow Coma Scale - Bewertungsskala für Bewusstseinsstörungen'
  },
  {
    id: 'hkt',
    term: 'HKT',
    definition: 'Hämatokrit - Anteil der Blutzellen am Gesamtblutvolumen'
  },
  {
    id: 'icp',
    term: 'ICP',
    definition: 'Intrakranieller Druck - Druck im Schädelinneren'
  },
  {
    id: 'map',
    term: 'MAP',
    definition: 'Mittlerer arterieller Blutdruck - Durchschnittswert des arteriellen Drucks'
  },
  {
    id: 'niv',
    term: 'NIV',
    definition: 'Non-invasive Ventilation - nicht-invasive Beatmung'
  },
  {
    id: 'pao2',
    term: 'PaO2',
    definition: 'Arterieller Sauerstoffpartialdruck - Sauerstoffgehalt im arteriellen Blut'
  },
  {
    id: 'peg',
    term: 'PEG',
    definition: 'Perkutane endoskopische Gastrostomie - Ernährungssonde direkt in den Magen'
  },
  {
    id: 'peep',
    term: 'PEEP',
    definition: 'Positive End-Expiratory Pressure - positiver endexpiratorischer Druck'
  },
  {
    id: 'spo2',
    term: 'SpO2',
    definition: 'Sauerstoffsättigung - prozentuale Sauerstoffsättigung des Hämoglobins'
  },
  {
    id: 'tia',
    term: 'TIA',
    definition: 'Transiente ischämische Attacke - vorübergehende Durchblutungsstörung des Gehirns'
  },
  {
    id: 'tracheostoma',
    term: 'Tracheostoma',
    definition: 'Künstliche Öffnung der Luftröhre zur Beatmung oder Sekretabsaugung'
  },
  {
    id: 'vas',
    term: 'VAS',
    definition: 'Visuelle Analogskala - Schmerzskala von 0-10'
  },
  {
    id: 'vsd',
    term: 'VSD',
    definition: 'Ventrikelseptumdefekt - angeborener Herzfehler mit Öffnung zwischen den Herzkammern'
  },
  {
    id: 'who',
    term: 'WHO',
    definition: 'World Health Organization - Weltgesundheitsorganisation'
  },
  {
    id: 'zvk',
    term: 'ZVK',
    definition: 'Zentraler Venenkatheter - Katheter in einer großen Vene zur Medikamentengabe oder Monitoring'
  },

  // Medical conditions (simple definitions)
  {
    id: 'delir',
    term: 'Delir',
    definition: 'Akute Verwirrtheit mit Bewusstseinsstörung und kognitiven Defiziten'
  },
  {
    id: 'demenz',
    term: 'Demenz',
    definition: 'Chronische Erkrankung mit fortschreitendem Verlust kognitiver Fähigkeiten'
  },
  {
    id: 'epilepsie',
    term: 'Epilepsie',
    definition: 'Neurologische Erkrankung mit wiederkehrenden Krampfanfällen'
  },
  {
    id: 'asthma',
    term: 'Asthma bronchiale',
    definition: 'Chronische Atemwegserkrankung mit reversibler Bronchialobstruktion'
  },
  {
    id: 'sepsis',
    term: 'Sepsis',
    definition: 'Systemische Entzündungsreaktion auf eine Infektion'
  },
  {
    id: 'endokarditis',
    term: 'Endokarditis',
    definition: 'Entzündung der Herzinnenhaut, meist durch bakterielle Infektion'
  },
  {
    id: 'myokardinfarkt',
    term: 'Myokardinfarkt',
    definition: 'Herzinfarkt durch Verschluss einer Herzkranzarterie'
  },
  {
    id: 'gastrointestinale_blutung',
    term: 'Gastrointestinale Blutung',
    definition: 'Blutung aus dem Verdauungstrakt'
  },
  {
    id: 'lungenembolie',
    term: 'Lungenembolie',
    definition: 'Verschluss einer Lungenarterie durch Blutgerinnsel'
  },
  {
    id: 'hypoglykämie',
    term: 'Hypoglykämie',
    definition: 'Unterzuckerung mit Blutzuckerwerten unter 50 mg/dl'
  },
  {
    id: 'dialyse',
    term: 'Dialyse',
    definition: 'Blutwäsche bei Nierenversagen'
  },
  {
    id: 'wundversorgung',
    term: 'Wundversorgung',
    definition: 'Fachgerechte Behandlung und Pflege von Wunden'
  },
  {
    id: 'herzinsuffizienz',
    term: 'Herzinsuffizienz',
    definition: 'Herzschwäche mit eingeschränkter Pumpfunktion'
  }
];
