/**
 * data.ts
 * Enthält Daten-Konstanten für die App
 */

import { EmergencyChecklistData, NursingStandard, LexikonEntry } from '../types/types';
import medizinischeAbkuerzungen from '../../data/medizinische_abkuerzungen_bereinigt.json';
import neurologieBegriffe from '../../assets/data/neurologie_abkuerzungen.json';
import kardiologieBegriffe from '../../assets/data/kardiologie_begriffe.json';
import pneumologieBegriffe from '../../assets/data/pneumologie_begriffe.json';

// Notfalldaten
export const emergencyData: Record<string, EmergencyChecklistData> = {
  atemnot: {
    id: 'atemnot',
    title: 'Atemnot',
    icon: '💨',
    steps: [
      { id: 'atemnot_1', text: 'Ruhe bewahren, Patient beruhigen.' },
      { id: 'atemnot_2', text: 'Oberkörper hochlagern.' },
      { id: 'atemnot_3', text: 'Atmung beobachten (Frequenz, Tiefe, Geräusche, Zyanose?).' },
      { id: 'atemnot_4', text: 'Sauerstoffsättigung messen (Pulsoxy). Ziel SpO2 >94%.' },
      { id: 'atemnot_5', text: 'O2-Gabe nach ärztl. Anordnung / Standard.' },
      { id: 'atemnot_6', text: 'Arzt informieren.' },
      {
        id: 'atemnot_7',
        text: 'Vitalzeichenkontrolle (Atemfrequenz, Puls, RR, SpO2, Temp, Bewusstsein).',
      },
      { id: 'atemnot_8', text: 'Dokumentation.' },
    ],
  },
  brustschmerz: {
    id: 'brustschmerz',
    title: 'Brustschmerz',
    icon: '❤️‍🔥',
    steps: [
      { id: 'brust_1', text: 'Patient beruhigen, absolute Ruhe.' },
      { id: 'brust_2', text: 'Oberkörper hochlagern (wenn Kreislauf stabil!).' },
      { id: 'brust_3', text: 'Vitalzeichen (RR, Puls (Norm ca. 60-100/min), SpO2 (>94%)).' },
      { id: 'brust_4', text: 'Schmerzassessment (Skala 0-10, Lokalisation, Art, Ausstrahlung).' },
      { id: 'brust_5', text: 'Arzt SOFORT informieren (Verdacht auf Herzinfarkt/ACS).' },
      { id: 'brust_6', text: '12-Kanal-EKG schreiben.' },
      { id: 'brust_7', text: 'O2-Gabe nach Anordnung.' },
      { id: 'brust_8', text: 'Vorbereitung Notfallmedikamente (Nitrospray etc.) nach Anordnung.' },
    ],
  },
  hypoglykaemie: {
    id: 'hypoglykaemie',
    title: 'Unterzuckerung',
    icon: '🍭',
    steps: [
      {
        id: 'hypo_1',
        text: 'Anzeichen erkennen: Kaltschweißigkeit, Zittern, Heißhunger, Blässe, Herzklopfen, Verwirrtheit, Wesensänderung, Sehstörungen.',
      },
      {
        id: 'hypo_2',
        text: 'BZ-Messung sofort durchführen. Hypoglykämie oft <60-70 mg/dl. (Normalbereich ca. 70-140 mg/dl).',
      },
      {
        id: 'hypo_3',
        text: 'Bei Bewusstsein & Schluckfähigkeit: Schnelle Kohlenhydrate geben (z.B. 2-4 Täfelchen Traubenzucker, Fruchtsaft/Cola).',
      },
      {
        id: 'hypo_4',
        text: 'Nach 10-15 Min.: Erneute BZ-Messung. Bei weiter niedrigem BZ/anhaltenden Symptomen: Erneut schnelle KH geben & Arzt informieren!',
      },
      {
        id: 'hypo_5',
        text: 'Wenn BZ stabilisiert: Langsam wirkende Kohlenhydrate geben (z.B. Brot, Joghurt, Banane).',
      },
      {
        id: 'hypo_6',
        text: 'Bei Bewusstlosigkeit/Krampfanfall: Notarzt (112)! Stabile Seitenlage. KEINE orale Nahrung/Flüssigkeit (Aspiration!).',
      },
      {
        id: 'hypo_7',
        text: 'Glukagon-Injektion i.m. nach ärztl. Anordnung (bei Bewusstlosigkeit/Schluckunfähigkeit, falls Kit vorhanden/geschult).',
      },
      {
        id: 'hypo_8',
        text: 'Vitalzeichen kontrollieren (Puls, RR, SpO2, Bewusstsein). Verlauf & Maßnahmen dokumentieren. Ursache klären.',
      },
    ],
  },
  sturz: {
    id: 'sturz',
    title: 'Sturz',
    icon: '🤕',
    steps: [
      { id: 'sturz_1', text: 'Patienten ansprechen, Ruhe vermitteln.' },
      {
        id: 'sturz_2',
        text: 'Auf offensichtliche Verletzungen prüfen (Wunden, Schwellungen, Fehlstellungen).',
      },
      {
        id: 'sturz_3',
        text: 'Schmerzen erfragen (Kopf, Nacken, Wirbelsäule, Hüfte, Extremitäten?).',
      },
      { id: 'sturz_4', text: 'Basale neurologische Prüfung (Pupillen, Orientierung, Motorik).' },
      {
        id: 'sturz_5',
        text: 'Bei Verdacht auf schwere Verletzung (z.B. Fraktur, Kopf-/WS-Verletzung): Nicht bewegen! Notarzt (112)!',
      },
      {
        id: 'sturz_6',
        text: 'Bei leichten/keinen Verletzungen: Hilfe beim sicheren Aufstehen anbieten.',
      },
      { id: 'sturz_7', text: 'Vitalzeichenkontrolle (Puls, RR, SpO2, Bewusstsein), ggf. BZ.' },
      { id: 'sturz_8', text: 'Dokumentation (Sturzprotokoll), Ursache klären.' },
    ],
  },
  fieber_sepsis: {
    id: 'fieber_sepsis',
    title: 'Fieber',
    icon: '🌡️',
    steps: [
      { id: 'fieber_1', text: 'Temperatur messen (rektal bevorzugt). Norm ca. 36.5-37.4°C.' },
      {
        id: 'fieber_2',
        text: 'Sepsiszeichen? (qSOFA: AF ≥22/min, syst. RR ≤100mmHg, Bewusstseinsänderung?). Schüttelfrost?',
      },
      { id: 'fieber_3', text: 'Bei Sepsisverdacht: Arzt SOFORT informieren!' },
      { id: 'fieber_4', text: 'Flüssigkeitszufuhr erhöhen (oral/i.v. nach Anordnung).' },
      { id: 'fieber_5', text: 'Wadenwickel / fiebersenkende Maßnahmen nach Anordnung.' },
      { id: 'fieber_6', text: 'Blutkulturen abnehmen (vor Antibiose, nach Anordnung).' },
      {
        id: 'fieber_7',
        text: 'Vitalzeichen engmaschig (AF, Puls, RR, SpO2, Temp, Bewusstsein, BZ).',
      },
      { id: 'fieber_8', text: 'Dokumentation.' },
    ],
  },
  blutung: {
    id: 'blutung',
    title: 'Blutung',
    icon: '🩸',
    steps: [
      { id: 'blut_1', text: 'Ruhe bewahren, Patient beruhigen.' },
      { id: 'blut_2', text: 'Einmalhandschuhe anziehen (Eigenschutz!).' },
      { id: 'blut_3', text: 'Direkten Druck auf die Wunde ausüben (sterile Kompresse/Tuch).' },
      { id: 'blut_4', text: 'Betroffenen Körperteil hochlagern.' },
      { id: 'blut_5', text: 'Druckverband anlegen.' },
      {
        id: 'blut_6',
        text: 'Arzt / Notarzt (112 bei starker, unkontrollierbarer Blutung) informieren.',
      },
      {
        id: 'blut_7',
        text: 'Vitalzeichenkontrolle (Puls, RR, SpO2, Bewusstsein). Schockzeichen? (Tachykardie, Hypotonie, Blässe, kalter Schweiß)',
      },
      { id: 'blut_8', text: 'Bei Nasenbluten: Kopf nach vorne beugen, Nacken kühlen.' },
    ],
  },
  allergie_anaphylaxie: {
    id: 'allergie_anaphylaxie',
    title: 'Allergie',
    icon: '🧪',
    steps: [
      { id: 'allerg_1', text: 'Allergenzufuhr stoppen (Infusion, Nahrung etc.).' },
      {
        id: 'allerg_2',
        text: 'Patient beruhigen. Lagerung: Atemnot -> Oberkörper hoch; Schock -> Flachlagerung, Beine hoch.',
      },
      { id: 'allerg_3', text: 'Notarzt rufen (112), Anaphylaxie melden!' },
      { id: 'allerg_4', text: 'Vitalzeichen prüfen (AF, Puls, RR, SpO2, Bewusstsein, Haut).' },
      { id: 'allerg_5', text: 'Adrenalin-Autoinjektor anwenden (falls vorhanden/instruiert).' },
      { id: 'allerg_6', text: 'O2-Gabe nach Anordnung.' },
      { id: 'allerg_7', text: 'Bereitschaft zur Reanimation.' },
      { id: 'allerg_8', text: 'Dokumentation, Auslöser sichern (wenn bekannt).' },
    ],
  },
  krampfanfall: {
    id: 'krampfanfall',
    title: 'Krampfanfall',
    icon: '⚡',
    steps: [
      { id: 'krampf_1', text: 'Ruhe bewahren, Umgebung sichern (Gegenstände entfernen).' },
      {
        id: 'krampf_2',
        text: 'Patient vor Verletzungen schützen (Kopf polstern), nicht festhalten.',
      },
      { id: 'krampf_3', text: 'Nichts in den Mund stecken!' },
      { id: 'krampf_4', text: 'Dauer des Anfalls beobachten (Uhrzeit!).' },
      { id: 'krampf_5', text: 'Nach dem Anfall: Stabile Seitenlage (wenn bewusstlos).' },
      { id: 'krampf_6', text: 'Atmung und SpO2 kontrollieren.' },
      {
        id: 'krampf_7',
        text: 'Arzt informieren. Bei erstem Anfall, >5 Min Dauer, Verletzung oder Serie -> Notarzt (112)!',
      },
      { id: 'krampf_8', text: 'Dokumentation (Art, Dauer, Begleitumstände).' },
    ],
  },
  schlaganfallverdacht: {
    id: 'schlaganfallverdacht',
    title: 'Schlaganfall',
    icon: '🧠',
    steps: [
      {
        id: 'fast_1',
        text: 'FAST-Test: Face (Lächeln), Arms (Arme vorhalten), Speech (Satz nachsprechen), Time (Zeitpunkt Symptombeginn!).',
      },
      { id: 'fast_2', text: 'Bei positivem Test: SOFORT Notarzt (112), Schlaganfall melden!' },
      { id: 'fast_3', text: 'Patienten beruhigen, nicht alleine lassen.' },
      { id: 'fast_4', text: 'Oberkörper leicht erhöht lagern (ca. 30 Grad).' },
      { id: 'fast_5', text: 'Nichts zu essen oder trinken geben (Aspirationsgefahr!).' },
      { id: 'fast_6', text: 'Vitalzeichen kontrollieren (AF, Puls, RR, SpO2, Temp), BZ messen!' },
      { id: 'fast_7', text: 'Genaue Uhrzeit des Symptombeginns erfragen/dokumentieren.' },
      { id: 'fast_8', text: 'Vorbereitung Transport (Akte, Medikamente).' },
    ],
  },
  dehydratation: {
    id: 'dehydratation',
    title: 'Dehydratation',
    icon: '💧',
    steps: [
      {
        id: 'dehy_1',
        text: 'Anzeichen erkennen: Trockene Schleimhäute, stehende Hautfalten, Verwirrtheit, Oligurie (<0.5ml/kg/h), Tachykardie, Hypotonie.',
      },
      { id: 'dehy_2', text: 'Flüssigkeitszufuhr anbieten/steigern (Lieblingsgetränke).' },
      { id: 'dehy_3', text: 'Trinkprotokoll führen / Ein- & Ausfuhr bilanzieren.' },
      { id: 'dehy_4', text: 'Ursache klären (Trinkmenge, Erbrechen, Diarrhoe, Fieber?).' },
      {
        id: 'dehy_5',
        text: 'Bei schwerer Exsikkose / Trinkverweigerung: Arzt informieren (Infusion notwendig?).',
      },
      { id: 'dehy_6', text: 'Vitalzeichen kontrollieren (Puls, RR, Temp, Hautturgor).' },
      { id: 'dehy_7', text: 'Mundpflege durchführen/intensivieren.' },
      { id: 'dehy_8', text: 'Dokumentation (Trinkmenge, Bilanz, Symptome, Maßnahmen).' },
    ],
  },
  erbrechen_diarrhoe: {
    id: 'erbrechen_diarrhoe',
    title: 'Erbrechen & Durchfall',
    icon: '🤢',
    steps: [
      { id: 'erbr_1', text: 'Patienten unterstützen (Nierenschale, Toilettengang).' },
      {
        id: 'erbr_2',
        text: 'Hygiene beachten (Handschuhe, Kittel), ggf. Isolation nach Standard.',
      },
      {
        id: 'erbr_3',
        text: 'Flüssigkeits-/Elektrolytverlust ausgleichen (orale Rehydratationslösung, Infusion nach Anordnung).',
      },
      { id: 'erbr_4', text: 'Hautpflege im Analbereich (bei Diarrhoe).' },
      { id: 'erbr_5', text: 'Ausscheidungen beobachten (Frequenz, Menge, Beschaffenheit, Blut?).' },
      {
        id: 'erbr_6',
        text: 'Bei Persistenz, Blut, Fieber, starkem Krankheitsgefühl: Arzt informieren.',
      },
      {
        id: 'erbr_7',
        text: 'Vitalzeichen kontrollieren (Puls, RR, Temp). Dehydratationszeichen? (Hautturgor, Schleimhäute)',
      },
      { id: 'erbr_8', text: 'Dokumentation (Frequenz, Beschaffenheit, Bilanz, Maßnahmen).' },
    ],
  },
  schmerz_akut: {
    id: 'schmerz_akut',
    title: 'Akutschmerz',
    icon: '😖',
    steps: [
      {
        id: 'schmerz_1',
        text: 'Patient ernst nehmen. Schmerzassessment (Skala 0-10, Lokalisation, Art, Auslöser).',
      },
      { id: 'schmerz_2', text: 'Ursache suchen (neue Erkrankung, Komplikation?).' },
      { id: 'schmerz_3', text: 'Lagerung anpassen, Ruhe ermöglichen.' },
      {
        id: 'schmerz_4',
        text: 'Nicht-medikamentöse Maßnahmen (Kühlung/Wärme, Entspannung, Ablenkung).',
      },
      { id: 'schmerz_5', text: 'Arzt informieren. Schmerzmittel nach Anordnung verabreichen.' },
      {
        id: 'schmerz_6',
        text: 'Wirkung der Schmerzmittel überprüfen (erneutes Assessment nach ca. 30-60 Min).',
      },
      {
        id: 'schmerz_7',
        text: 'Vitalzeichen kontrollieren (AF, Puls, RR, SpO2, Bewusstsein - insb. bei Opioiden!).',
      },
      { id: 'schmerz_8', text: 'Dokumentation (Assessment, Maßnahmen, Wirkung).' },
    ],
  },
  verwirrtheit_delir: {
    id: 'verwirrtheit_delir',
    title: 'Verwirrtheit',
    icon: '😵‍💫',
    steps: [
      { id: 'delir_1', text: 'Ruhe ausstrahlen, Reizabschirmung.' },
      { id: 'delir_2', text: 'Orientierungshilfen geben (Name, Datum, Ort, Brille/Hörgerät).' },
      {
        id: 'delir_3',
        text: 'Mögliche Ursachen prüfen (Infekt, Dehydratation, Schmerz, Medis, Hypoxie, Harnverhalt etc.).',
      },
      { id: 'delir_4', text: 'Arzt informieren, Ursachenabklärung!' },
      { id: 'delir_5', text: 'Sicherheit gewährleisten (Sturzprophylaxe), ggf. Sitzwache.' },
      { id: 'delir_6', text: 'Flüssigkeitszufuhr, Ernährung sicherstellen.' },
      { id: 'delir_7', text: 'Tag-Nacht-Rhythmus fördern.' },
      { id: 'delir_8', text: 'Dokumentation (Verhalten, Ursachen, Maßnahmen).' },
    ],
  },
  schluckstoerung: {
    id: 'schluckstoerung',
    title: 'Schluckstörung',
    icon: '🫦',
    steps: [
      {
        id: 'schluck_1',
        text: 'Anzeichen erkennen: Husten/Räuspern bei/nach Nahrungsaufnahme, gurgelnde Stimme, Nahrungsreste im Mund.',
      },
      {
        id: 'schluck_2',
        text: 'Bei akuter Aspiration (Luftnot, Zyanose): Notfall! Oberkörper vorbeugen, Husten auffordern, ggf. Heimlich-Manöver, Notarzt (112)!',
      },
      { id: 'schluck_3', text: 'Bei Verdacht: Nahrungs-/Flüssigkeitszufuhr sofort stoppen!' },
      { id: 'schluck_4', text: 'Arzt informieren, logopädisches Konsil anregen.' },
      { id: 'schluck_5', text: 'Kostform anpassen (Andicken etc.) nach Anordnung/Standard.' },
      { id: 'schluck_6', text: 'Oberkörper aufrecht bei & nach Nahrungsaufnahme (mind. 30 Min).' },
      { id: 'schluck_7', text: 'Mundpflege nach Mahlzeiten durchführen.' },
      {
        id: 'schluck_8',
        text: 'Atmung/Vitalzeichen beobachten (AF, SpO2, Temp - Aspirationspneumonie?).',
      },
    ],
  },
  harnverhalt: {
    id: 'harnverhalt',
    title: 'Harnverhalt',
    icon: '🚽',
    steps: [
      { id: 'harn_1', text: 'Patient nach Miktionsproblemen fragen (Harndrang? Schmerzen?).' },
      { id: 'harn_2', text: 'Unterbauch palpieren (pralle Blase?).' },
      { id: 'harn_3', text: 'Blasenscan durchführen.' },
      { id: 'harn_4', text: 'Letzte Miktion? Ein-/Ausfuhr bilanzieren.' },
      { id: 'harn_5', text: 'Unterstützende Maßnahmen (Wasser laufen lassen, Intimsphäre).' },
      { id: 'harn_6', text: 'Arzt informieren (Einmalkatheterisierung/DK nach Anordnung?).' },
      {
        id: 'harn_7',
        text: 'Anurie (<100ml/24h) oder <6h keine Miktion trotz Harndrang/Flüssigkeitszufuhr? DRINGEND Arztinfo! (Nierenversagen?).',
      },
      { id: 'harn_8', text: 'Dokumentation (Symptome, Bilanz, Maßnahmen, Restharn).' },
    ],
  },
  hypertensive_krise: {
    id: 'hypertensive_krise',
    title: 'Hypertonie',
    icon: '📈',
    steps: [
      { id: 'hyper_1', text: 'Blutdruck messen (beidseitig). Norm ca. 120/80 mmHg.' },
      { id: 'hyper_2', text: 'Patienten beruhigen, Oberkörper hochlagern.' },
      {
        id: 'hyper_3',
        text: 'Symptome erfragen (Kopfschmerz, Schwindel, Sehstörung, Brustschmerz, Atemnot, Übelkeit?).',
      },
      {
        id: 'hyper_4',
        text: 'Arzt SOFORT informieren bei RR >180/110 (Krise) oder RR >230/120 / mit Symptomen (Notfall)!',
      },
      { id: 'hyper_5', text: 'Blutdrucksenkende Medikamente nach ärztl. Anordnung verabreichen.' },
      { id: 'hyper_6', text: 'Engmaschige RR-Kontrolle (Ziel: langsame Senkung!).' },
      { id: 'hyper_7', text: 'Ursache klären (Medikamentenadhärenz?).' },
      { id: 'hyper_8', text: 'Dokumentation (RR-Werte, Symptome, Medikation).' },
    ],
  },
  wundinfektion: {
    id: 'wundinfektion',
    title: 'Wundinfektion',
    icon: '🦠',
    steps: [
      {
        id: 'wunde_1',
        text: 'Wunde inspizieren: Rötung, Schwellung, Überwärmung, Schmerz, Exsudat (Menge, Farbe, Geruch?), Wundrand.',
      },
      { id: 'wunde_2', text: 'Verbandwechsel nach hygienischen Prinzipien.' },
      { id: 'wunde_3', text: 'Wundabstrich nach ärztl. Anordnung (vor Antiseptik!).' },
      { id: 'wunde_4', text: 'Arzt über Wundzustand informieren.' },
      {
        id: 'wunde_5',
        text: 'Systemische Infektionszeichen prüfen (Fieber, Schüttelfrost, Tachykardie, Labor?).',
      },
      { id: 'wunde_6', text: 'Wundspülung / Antiseptika / Wundauflagen nach Anordnung.' },
      { id: 'wunde_7', text: 'Schmerzmanagement.' },
      { id: 'wunde_8', text: 'Dokumentation (Wundzustand, Maßnahmen, Material).' },
    ],
  },
  synkope_kollaps: {
    id: 'synkope_kollaps',
    title: 'Bewusstlosigkeit',
    icon: '😑',
    steps: [
      { id: 'synk_1', text: 'Patient ansprechen, Bewusstsein prüfen.' },
      {
        id: 'synk_2',
        text: 'Bei Bewusstlosigkeit: Atmung prüfen! -> Stabile Seitenlage oder Reanimation!',
      },
      {
        id: 'synk_3',
        text: 'Bei kurzer Bewusstlosigkeit / Präsynkope: Hinlegen, Beine hochlagern.',
      },
      { id: 'synk_4', text: 'Vitalzeichen messen (Puls, RR - auch orthostatisch, SpO2).' },
      { id: 'synk_5', text: 'Ursache erfragen (Situation, Medikamente, Herzerkrankung?).' },
      {
        id: 'synk_6',
        text: 'Arzt informieren (insb. bei erstem Auftreten, Verletzung, kardialem Verdacht).',
      },
      { id: 'synk_7', text: 'BZ messen.' },
      { id: 'synk_8', text: 'Langsam mobilisieren, Sturzprophylaxe.' },
    ],
  },
  verhaltensnotfall: {
    id: 'verhaltensnotfall',
    title: 'Aggression',
    icon: '🤬',
    steps: [
      {
        id: 'aggro_1',
        text: 'Eigenschutz beachten! Ruhe bewahren, Abstand halten, Fluchtweg sichern.',
      },
      {
        id: 'aggro_2',
        text: 'Situation deeskalieren (ruhige Ansprache, Ich-Botschaften, validieren).',
      },
      { id: 'aggro_3', text: 'Keine Diskussionen, keine Provokation.' },
      { id: 'aggro_4', text: 'Hilfe holen (Kollegen, Sicherheit).' },
      { id: 'aggro_5', text: 'Mögliche Auslöser suchen (Schmerz, Angst, Delir, Medis?).' },
      { id: 'aggro_6', text: 'Arzt informieren (medikamentöse Sedierung nach Anordnung?).' },
      {
        id: 'aggro_7',
        text: 'Fixierung nur als Ultima Ratio bei akuter Gefahr nach ärztl. Anordnung!',
      },
      { id: 'aggro_8', text: 'Dokumentation (Auslöser, Verhalten, Maßnahmen).' },
    ],
  },
  lungenembolie_verdacht: {
    id: 'lungenembolie_verdacht',
    title: 'Lungenembolie',
    icon: '🫁',
    steps: [
      {
        id: 'lunge_1',
        text: 'Anzeichen erkennen: Plötzliche Dyspnoe, atemabhängiger Thoraxschmerz, Tachykardie (>100/min), Tachypnoe, Husten, Angst, Zyanose?',
      },
      { id: 'lunge_2', text: 'Patient beruhigen, Oberkörper hochlagern.' },
      { id: 'lunge_3', text: 'Arzt SOFORT informieren, Verdacht äußern!' },
      { id: 'lunge_4', text: 'O2-Gabe nach Anordnung (hoher Fluss).' },
      { id: 'lunge_5', text: 'Vitalzeichen engmaschig (AF, Puls, RR, SpO2).' },
      { id: 'lunge_6', text: 'Vorbereitung Diagnostik (EKG, BGA, D-Dimere, CT).' },
      { id: 'lunge_7', text: 'Antikoagulation nach Anordnung vorbereiten/verabreichen.' },
      { id: 'lunge_8', text: 'Reanimationsbereitschaft.' },
    ],
  },
};

// ACHTUNG: Alle Texte (title, ziel, kriterien, details) werden jetzt über i18n/Übersetzungsdateien geladen!
export const nursingStandardsData: NursingStandard[] = [
  { id: 'standard-dekubitus' },
  { id: 'standard-sturz' },
  { id: 'standard-schmerz' },
  { id: 'standard-ernaehrung' },
  { id: 'mobilisation' },
  { id: 'entlassungsmanagement' },
  { id: 'harnkontinenz' },
  { id: 'chronische_wunden' },
  { id: 'geburt' },
  // ... ggf. weitere Standards ...
];

// Lexikon-Einträge

// Basiseinträge für das Lexikon (werden mit medizinischen Abkürzungen aus der JSON-Datei ergänzt)
const basisLexikonEntries: LexikonEntry[] = [
  {
    id: 'dekubitus',
    term: 'Dekubitus',
    definition:
      'Ein Dekubitus (Druckgeschwür, Wundliegen) ist eine lokale Schädigung der Haut und/oder des darunterliegenden Gewebes, typischerweise über knöchernen Vorsprüngen, infolge von Druck oder Druck in Kombination mit Scherkräften. Risikofaktoren umfassen eingeschränkte Mobilität, schlechte Durchblutung, Mangelernährung und Feuchtigkeit. Die Vorbeugung umfasst regelmäßige Positionswechsel, druckentlastende Hilfsmittel und sorgfältige Hautpflege.',
  },
  {
    id: 'dysphagie',
    term: 'Dysphagie',
    definition:
      'Dysphagie bezeichnet Schluckstörungen, die das sichere und effiziente Transportieren von Nahrung und Flüssigkeiten vom Mund in den Magen beeinträchtigen. Ursachen können neurologische Erkrankungen (z.B. Schlaganfall, Parkinson), strukturelle Veränderungen oder altersbedingte Faktoren sein. Symptome umfassen Husten beim Essen/Trinken, gurgelnde Stimme, Nahrungsreste im Mund und häufige Atemwegsinfektionen durch Aspiration. Das Management beinhaltet logopädische Therapie, angepasste Konsistenzen und Schlucktechniken.',
  },
  {
    id: 'exsikkose',
    term: 'Exsikkose',
    definition:
      'Exsikkose bezeichnet einen Wassermangel im Körper, bei dem mehr Flüssigkeit verloren geht als aufgenommen wird. Ursachen können unzureichende Flüssigkeitszufuhr, erhöhte Verluste (Fieber, Erbrechen, Durchfall) oder Medikamentenwirkungen sein. Erkennbar ist sie an trockenen Schleimhäuten, vermindertem Hautturgor, Müdigkeit, Verwirrtheit und konzentriertem Urin. Die Behandlung umfasst kontrollierte Flüssigkeitszufuhr, bei schweren Fällen intravenöse Hydratation.',
  },
  {
    id: 'pvk',
    term: 'PVK (Peripherer Venenkatheter)',
    definition:
      'Ein dünner Kunststoffschlauch, der in eine periphere Vene (meist am Arm oder Handrücken) eingeführt wird, um Infusionen oder Medikamente zu verabreichen.',
  },
  {
    id: 'zvk',
    term: 'ZVK (Zentraler Venenkatheter)',
    definition:
      'Ein Katheter, dessen Spitze in einer großen, herznahen Vene liegt. Dient zur Verabreichung hochkonzentrierter Lösungen, Medikamente oder zur Messung des zentralen Venendrucks.',
  },
  {
    id: 'bz',
    term: 'BZ (Blutzucker)',
    definition:
      'Die Konzentration von Glukose im Blut. Wichtig für die Diagnostik und Therapie von Diabetes mellitus.',
  },
  {
    id: 'rr',
    term: 'RR (Riva-Rocci)',
    definition:
      'Abkürzung für den Blutdruck, gemessen nach der Methode von Scipione Riva-Rocci (indirekte Messung mittels Manschette).',
  },
  {
    id: 'copd',
    term: 'COPD (Chronisch obstruktive Lungenerkrankung)',
    definition:
      'Eine fortschreitende Lungenkrankheit, gekennzeichnet durch chronische Entzündung der Atemwege und Zerstörung des Lungengewebes, oft verbunden mit Rauchen.',
  },
  {
    id: 'peg',
    term: 'PEG (Perkutane endoskopische Gastrostomie)',
    definition:
      'Eine durch die Bauchwand direkt in den Magen gelegte Sonde zur künstlichen Ernährung.',
  },
  {
    id: 'ekg',
    term: 'EKG (Elektrokardiogramm)',
    definition:
      'Aufzeichnung der elektrischen Aktivität des Herzens zur Beurteilung von Herzrhythmus und -funktion.',
  },
  {
    id: 'aspiration',
    term: 'Aspiration',
    definition:
      'Das Einatmen von Fremdkörpern, Flüssigkeiten (z.B. Speichel, Nahrung, Mageninhalt) in die Atemwege.',
  },
  {
    id: 'kontraktur',
    term: 'Kontraktur',
    definition:
      'Eine dauerhafte Verkürzung von Muskeln, Sehnen oder Bändern, die zu einer Bewegungseinschränkung oder Fehlstellung eines Gelenks führt.',
  },
  {
    id: 'bradykardie',
    term: 'Bradykardie',
    definition:
      'Eine verlangsamte Herzfrequenz unter 60 Schläge pro Minute. Kann symptomlos sein oder zu Schwindel, Müdigkeit und Synkopen führen.',
  },
  {
    id: 'tachykardie',
    term: 'Tachykardie',
    definition:
      'Eine erhöhte Herzfrequenz über 100 Schläge pro Minute. Symptome können Herzklopfen, Kurzatmigkeit und Brustschmerzen umfassen.',
  },
  {
    id: 'orthopnoe',
    term: 'Orthopnoe',
    definition:
      'Atemnot im Liegen, die sich beim Aufrichten bessert. Typisches Symptom bei Herzinsuffizienz.',
  },
  {
    id: 'dyspnoe',
    term: 'Dyspnoe',
    definition:
      'Subjektives Gefühl der Atemnot oder Kurzatmigkeit, oft als "Lufthunger" beschrieben. Kann verschiedene Ursachen haben, z.B. kardiale, pulmonale oder psychische.',
  },
  {
    id: 'thrombose',
    term: 'Thrombose',
    definition:
      'Bildung eines Blutgerinnsels in einem Blutgefäß. Häufig in den tiefen Beinvenen (Tiefe Venenthrombose), kann bei Lösung eine Lungenembolie verursachen.',
  },
  {
    id: 'embolie',
    term: 'Embolie',
    definition:
      'Verschleppung eines Thrombus oder anderen Materials im Blutkreislauf mit Verstopfung eines Gefäßes. Lungenembolie ist die häufigste schwerwiegende Form.',
  },
  {
    id: 'hypertonie',
    term: 'Hypertonie (Bluthochdruck)',
    definition:
      'Dauerhaft erhöhter Blutdruck über 140/90 mmHg. Risikofaktor für Herz-Kreislauf-Erkrankungen, oft symptomlos ("stiller Killer").',
  },
  {
    id: 'hypotonie',
    term: 'Hypotonie (niedriger Blutdruck)',
    definition:
      'Blutdruck unter 100/60 mmHg. Kann zu Schwindel, Müdigkeit und Synkopen führen, muss aber nicht behandlungsbedürftig sein.',
  },

  // Neue medizinische Fachbegriffe
  {
    id: 'anamnese',
    term: 'Anamnese',
    definition:
      'Die systematische Befragung des Patienten durch medizinisches Fachpersonal zur Erhebung der Krankengeschichte. Sie umfasst Informationen zu aktuellen Beschwerden, Vorerkrankungen, Familienanamnese, Medikation, Allergien und Lebensgewohnheiten und bildet die Grundlage für Diagnose und Therapie.',
  },
  {
    id: 'auskultation',
    term: 'Auskultation',
    definition:
      'Untersuchungsmethode, bei der mit Stethoskop oder bloßem Ohr Körpergeräusche (z.B. Herztöne, Atemgeräusche, Darmgeräusche) wahrgenommen und beurteilt werden, um Rückschlüsse auf den Funktionszustand von Organen zu ziehen.',
  },
  {
    id: 'biopsie',
    term: 'Biopsie',
    definition:
      'Entnahme einer Gewebeprobe aus dem lebenden Organismus zur anschließenden histologischen, mikrobiologischen oder genetischen Untersuchung. Dient der Diagnostik von Erkrankungen, besonders zur Abklärung von Tumorverdacht.',
  },
  {
    id: 'bradypnoe',
    term: 'Bradypnoe',
    definition:
      'Verlangsamte Atmung mit einer Atemfrequenz unter 12 Atemzügen pro Minute beim Erwachsenen. Kann durch Medikamente (Opioide), erhöhten Hirndruck, metabolische Störungen oder als Zeichen einer Erschöpfung bei Ateminsuffizienz auftreten.',
  },
  {
    id: 'compliance',
    term: 'Compliance/Adhärenz',
    definition:
      'Das Ausmaß, in dem das Verhalten eines Patienten mit den medizinischen Empfehlungen (Medikamenteneinnahme, Lebensstiländerungen, Wahrnehmung von Terminen) übereinstimmt. Neuere Begriffe wie "Adhärenz" oder "Therapietreue" betonen die aktive Patientenbeteiligung.',
  },
  {
    id: 'defibrillation',
    term: 'Defibrillation',
    definition:
      'Therapiemaßnahme bei bestimmten lebensbedrohlichen Herzrhythmusstörungen (Kammerflimmern, pulslose ventrikuläre Tachykardie), bei der durch gezielte Stromabgabe eine Synchronisation des Herzrhythmus erreicht werden soll. Erfolgt manuell oder automatisiert (AED).',
  },
  {
    id: 'dialyse',
    term: 'Dialyse',
    definition:
      'Blutreinigungsverfahren bei Nierenversagen, das die Entfernung von harnpflichtigen Substanzen, Wasser und Elektrolyten aus dem Blut ermöglicht. Hauptformen sind Hämodialyse (Filterung durch semipermeable Membran) und Peritonealdialyse (Bauchhöhle als Filter).',
  },
  {
    id: 'epidemiologie',
    term: 'Epidemiologie',
    definition:
      'Wissenschaft, die sich mit der Verteilung und den Determinanten von Krankheiten in Bevölkerungsgruppen befasst. Untersucht Krankheitshäufigkeiten, Risikofaktoren, Krankheitsfolgen und dient als Grundlage für präventive Maßnahmen und Gesundheitspolitik.',
  },
  {
    id: 'fatigue',
    term: 'Fatigue-Syndrom',
    definition:
      'Zustand anhaltender Erschöpfung und Leistungsminderung, der durch Ruhe nicht ausreichend gebessert wird. Tritt häufig als Begleitsymptom bei chronischen Erkrankungen, insbesondere bei Krebs (Cancer-related Fatigue), aber auch nach Infektionen oder bei psychischen Erkrankungen auf.',
  },
  {
    id: 'gcs',
    term: 'Glasgow Coma Scale (GCS)',
    definition:
      'Bewertungssystem zur Beurteilung des Bewusstseinszustands. Bewertet werden Augenöffnen (1-4 Punkte), verbale Reaktion (1-5 Punkte) und motorische Reaktion (1-6 Punkte). Die Summe (3-15 Punkte) gibt Hinweise auf die Schwere einer Bewusstseinsstörung.',
  },
  {
    id: 'habitus',
    term: 'Habitus',
    definition:
      'Das äußere Erscheinungsbild, die Körperhaltung und das Verhalten eines Patienten, das wichtige diagnostische Hinweise liefern kann. Bestimmte Erkrankungen zeigen charakteristische Habitusformen (z.B. Cushing-Habitus, Marfan-Habitus).',
  },
  {
    id: 'ileostoma',
    term: 'Ileostoma',
    definition:
      'Künstlicher Dünndarmausgang in der Bauchwand (meist im rechten Unterbauch), bei dem der Dünndarm (Ileum) nach außen verlegt wird. Kann temporär oder permanent sein und dient der Ausleitung von Stuhl bei verschiedenen Darmerkrankungen oder nach Operationen.',
  },
];

// Kombiniere die Basiseinträge mit den medizinischen Abkürzungen aus der JSON-Datei
// Verwende Map um sicherzustellen, dass keine doppelten IDs existieren
const combinedEntries = new Map<string, LexikonEntry>();

// Füge erst die Basiseinträge hinzu
basisLexikonEntries.forEach(entry => {
  combinedEntries.set(entry.id, entry);
});

// Füge dann die medizinischen Abkürzungen hinzu, überschreibt ggf. vorhandene Einträge mit gleicher ID
// Bereinige dabei Klammern am Ende des Terms
medizinischeAbkuerzungen.forEach(entry => {
  // Bereinige Klammern am Ende des Terms
  const cleanedTerm = entry.term.replace(/\)$/, '');

  if (!combinedEntries.has(entry.id)) {
    combinedEntries.set(entry.id, {
      id: entry.id,
      term: cleanedTerm,
      definition: entry.definition,
    });
  }
});

// Füge neurologische Fachbegriffe hinzu
neurologieBegriffe.forEach(entry => {
  if (!combinedEntries.has(entry.id)) {
    combinedEntries.set(entry.id, entry);
  }
});

// Füge kardiologische Fachbegriffe hinzu
kardiologieBegriffe.forEach(entry => {
  if (!combinedEntries.has(entry.id)) {
    combinedEntries.set(entry.id, entry);
  }
});

// Füge pneumologische Fachbegriffe hinzu
pneumologieBegriffe.forEach(entry => {
  if (!combinedEntries.has(entry.id)) {
    combinedEntries.set(entry.id, entry);
  }
});

// Konvertiere die Map zurück zu einem Array
export const lexikonEntries: LexikonEntry[] = Array.from(combinedEntries.values());
