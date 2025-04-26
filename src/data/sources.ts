// Zentrale Quellenstruktur für medizinische und pflegerische Inhalte
export interface Source {
  id: string;
  name: string;
  link?: string;
  description?: string;
}

export const SOURCES: Source[] = [
  {
    id: 'awmf',
    name: 'AWMF-Leitlinien',
    link: 'https://www.awmf.org/leitlinien',
    description: 'Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften – Offizielle medizinische Leitlinien für Deutschland.'
  },
  {
    id: 'icd10',
    name: 'ICD-10-GM Version 2024',
    link: 'https://www.dimdi.de/dynamic/de/klassifikationen/icd/icd-10-gm/',
    description: 'Internationale Klassifikation der Krankheiten, herausgegeben vom Bundesinstitut für Arzneimittel und Medizinprodukte (BfArM).'
  },
  {
    id: 'rki',
    name: 'Robert Koch-Institut (RKI)',
    link: 'https://www.rki.de/',
    description: 'Zentrale Einrichtung der Bundesregierung auf dem Gebiet der Krankheitsüberwachung und -prävention.'
  },
  {
    id: 'bzga',
    name: 'Bundeszentrale für gesundheitliche Aufklärung (BZgA)',
    link: 'https://www.bzga.de/',
    description: 'Offizielle Informationen zu Gesundheit, Prävention und Pflege.'
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia (deutschsprachig)',
    link: 'https://de.wikipedia.org/',
    description: 'Allgemeine medizinische und pflegerische Begriffe, Scores und Hintergrundinformationen.'
  },
  {
    id: 'pflege-heute',
    name: 'Pflege Heute',
    link: 'https://shop.elsevier.de/pflege-heute-9783437265222.html',
    description: 'Standardlehrbuch für die Pflegeausbildung, Elsevier/Urban & Fischer.'
  },
  {
    id: 'pschyrembel',
    name: 'Pschyrembel Klinisches Wörterbuch',
    link: 'https://www.pschyrembel.de/',
    description: 'Klassisches Nachschlagewerk für medizinische Begriffe, De Gruyter.'
  },
  {
    id: 'thieme-pflege',
    name: 'Thieme Pflege',
    link: 'https://www.thieme.de/de/pflege-gesundheit/buecher-4307.htm',
    description: 'Pflegefachbuchreihe, Thieme Verlag.'
  },
  {
    id: 'amboss',
    name: 'AMBOSS',
    link: 'https://www.amboss.com/de',
    description: 'Online-Plattform für medizinisches Wissen.'
  },
  {
    id: 'doccheck',
    name: 'DocCheck Flexikon',
    link: 'https://flexikon.doccheck.com/',
    description: 'Freies medizinisches Lexikon.'
  },
  {
    id: 'ki-hinweis',
    name: 'Transparenzhinweis KI',
    description: 'Teile der Inhalte wurden mit Unterstützung von Künstlicher Intelligenz (KI) erstellt. Die Quellen wurden nach bestem Wissen recherchiert und zugeordnet.'
  }
]; 