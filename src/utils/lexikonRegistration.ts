import { additionalLexikonEntries } from './additionalLexikonEntries';
import { extendedLexikonEntries } from './extendedLexikonEntries';
import { lexikonEntries } from './data';
import { LexikonEntry } from '../types/types';
import i18n from './i18n';

// Import der JSON-Daten
const medicalAbbreviationsData = require('../../data/medizinische_abkuerzungen_bereinigt.json');
const laborParameterData = require('../../data/laborparameter.json');

/**
 * Gets translated lexicon entries from i18n for basic terms
 * Falls back to original entries if translation is not available
 * @returns Array of translated basic lexicon entries
 */
export const getTranslatedBasicLexikonEntries = (): LexikonEntry[] => {
  const basicTermsKeys = [
    'dekubitus', 'dysphagie', 'exsikkose', 'pvk', 'zvk', 'bz', 'rr', 'copd', 'peg', 'ekg',
    'aspiration', 'kontraktur', 'bradykardie', 'tachykardie', 'orthopnoe', 'dyspnoe', 'thrombose',
    'embolie', 'hypertonie', 'hypotonie', 'anamnese', 'auskultation', 'biopsie', 'bradypnoe',
    'compliance', 'defibrillation', 'dialyse', 'epidemiologie', 'fatigue', 'gcs', 'habitus', 'ileostoma'
  ];

  return basicTermsKeys.map(key => {
    const termKey = `lexicon.basic_terms.${key}.term`;
    const definitionKey = `lexicon.basic_terms.${key}.definition`;
    
    // Check if translation exists and is not the fallback key
    const translatedTerm = i18n.t(termKey);
    const translatedDefinition = i18n.t(definitionKey);
    
    // If translation is available and not the fallback key, use it
    if (translatedTerm !== termKey && translatedDefinition !== definitionKey) {
      return {
        id: key,
        term: translatedTerm,
        definition: translatedDefinition
      };
    }
    
    // Otherwise, find the original entry from lexikonEntries
    const originalEntry = lexikonEntries.find(entry => entry.id === key);
    if (originalEntry) {
      return originalEntry;
    }
    
    // Fallback if neither exists
    return {
      id: key,
      term: key.charAt(0).toUpperCase() + key.slice(1),
      definition: 'Definition not available'
    };
  });
};

/**
 * Gets translated additional lexicon entries from i18n
 * Falls back to original entries if translation is not available
 * @returns Array of translated additional lexicon entries
 */
export const getTranslatedAdditionalLexikonEntries = (): LexikonEntry[] => {
  const categories = {
    'medical_abbreviations': [
      'acls', 'adh', 'adl', 'ards', 'asd', 'atls', 'bga', 'bmi', 'bps', 'cpap',
      'cpp', 'crp', 'cvvh', 'dka', 'dns', 'echo'
    ],
    'diagnoses': [
      'aortenaneurysma', 'aplastische-anaemie', 'asthma-bronchiale', 'atriale-fibrillation',
      'bandscheibenvorfall', 'basalzellkarzinom', 'cholelithiasis', 'colitis-ulcerosa',
      'delir', 'demenz', 'divertikulitis', 'endokarditis', 'epilepsie', 'fibromyalgie',
      'gicht', 'harnwegsinfekt'
    ],
    'medications': [
      'ace-hemmer', 'analgetika', 'antibiotika', 'antikoagulanzien', 'antidepressiva',
      'antiemetika', 'antihypertensiva', 'antikonvulsiva', 'antipyretika', 'antipsychotika',
      'benzodiazepine', 'beta-blocker', 'bisphosphonate', 'diuretika', 'glukokortikoide'
    ],
    'nursing_terms': [
      'aktivierende-pflege', 'assessment', 'basale-stimulation', 'bobath-konzept',
      'dekubitusprophylaxe', 'expertenstandard', 'kinaesthetics', 'kontrakturprophylaxe',
      'pflegediagnose', 'pflegeplanung', 'prophylaxen', 'thromboseprophylaxe'
    ],
    'anatomy': [
      'appendix', 'axilla', 'bronchien', 'duodenum', 'epigastrium', 'faszie',
      'foramen-magnum', 'gyrus', 'hypophyse', 'ileum', 'jejunum', 'mediastinum',
      'meninges', 'miktion', 'niere', 'perikard', 'peritoneum', 'pleura'
    ]
  };

  const results: LexikonEntry[] = [];

  Object.entries(categories).forEach(([category, keys]) => {
    keys.forEach(key => {
      const termKey = `lexicon.additional_terms.${category}.${key}.term`;
      const definitionKey = `lexicon.additional_terms.${category}.${key}.definition`;
      
      // Check if translation exists and is not the fallback key
      const translatedTerm = i18n.t(termKey);
      const translatedDefinition = i18n.t(definitionKey);
      
      // If translation is available and not the fallback key, use it
      if (translatedTerm !== termKey && translatedDefinition !== definitionKey) {
        results.push({
          id: key,
          term: translatedTerm,
          definition: translatedDefinition
        });
      } else {
        // Otherwise, find the original entry from additionalLexikonEntries
        const originalEntry = additionalLexikonEntries.find(entry => entry.id === key);
        if (originalEntry) {
          results.push(originalEntry);
        }
      }
    });
  });

  return results;
};

/**
 * Gets translated extended lexicon entries from i18n
 * Falls back to original entries if translation is not available
 * @returns Array of translated extended lexicon entries
 */
export const getTranslatedExtendedLexikonEntries = (): LexikonEntry[] => {
  const categories = {
    'medical_abbreviations': [
      'abvd', 'acb', 'aed', 'ami', 'asa', 'avk', 'bipap', 'bls', 'cap', 'ckd',
      'cmv', 'crf', 'crrt', 'crt', 'cva', 'dcm', 'dvt', 'ebm', 'ecmo', 'eeg',
      'ercp', 'esbl', 'fev1', 'fsme', 'gbs', 'gerd', 'gfr'
    ],
    'diagnoses': [
      'alzheimer', 'angina-pectoris', 'apoplex', 'arteriosklerose', 'bronchitis',
      'diabetes-mellitus', 'herzinfarkt', 'herzinsuffizienz', 'hypertonie', 'hypotonie',
      'koronare-herzkrankheit', 'lungenembolie', 'myokardinfarkt', 'osteoporose',
      'pneumonie', 'sepsis', 'schlaganfall', 'vorhofflimmern'
    ],
    'medications': [
      'adrenalin', 'aspirin', 'cortison', 'digitalis', 'heparin', 'insulin',
      'morphin', 'nitroglycerin', 'paracetamol', 'penicillin', 'warfarin'
    ],
    'nursing_terms': [
      'atemtherapie', 'beatmung', 'documentation', 'mobilisation', 'palliativpflege',
      'rehabilitation', 'vitalzeichen', 'wundversorgung'
    ],
    'anatomy': [
      'aorta', 'cerebrum', 'herz', 'leber', 'lunge', 'myokard', 'pankreas', 'trachea', 'ventrikel'
    ],
    'units': [
      'mmhg', 'bpm', 'ml', 'mg', 'iu'
    ],
    'laboratory': [
      'albumin', 'bilirubin', 'cholesterin', 'creatinin', 'glucose', 'haemoglobin', 'leukocytes', 'platelets'
    ]
  };

  const results: LexikonEntry[] = [];

  Object.entries(categories).forEach(([category, keys]) => {
    keys.forEach(key => {
      const termKey = `lexicon.extended_terms.${category}.${key}.term`;
      const definitionKey = `lexicon.extended_terms.${category}.${key}.definition`;
      
      // Check if translation exists and is not the fallback key
      const translatedTerm = i18n.t(termKey);
      const translatedDefinition = i18n.t(definitionKey);
      
      // If translation is available and not the fallback key, use it
      if (translatedTerm !== termKey && translatedDefinition !== definitionKey) {
        results.push({
          id: key,
          term: translatedTerm,
          definition: translatedDefinition
        });
      } else {
        // Otherwise, find the original entry from extendedLexikonEntries
        const originalEntry = extendedLexikonEntries.find(entry => entry.id === key);
        if (originalEntry) {
          results.push(originalEntry);
        }
      }
    });
  });

  return results;
};

/**
 * Gets translated medical abbreviations from i18n
 * Falls back to original entries from JSON if translation is not available
 * @returns Array of translated medical abbreviation entries
 */
export const getTranslatedMedicalAbbreviationsEntries = (): LexikonEntry[] => {
  const results: LexikonEntry[] = [];

  // Get the IDs of medical abbreviations we have i18n translations for
  const translationKeys = [
    'aa', 'aaa', 'abg', 'acb', 'adh', 'aed', 'all', 'alv', 'ami', 'aml', 'anv',
    'arf', 'ari', 'ass', 'av', 'avk', 'az', 'bal', 'bga', 'bks', 'bmi', 'bs',
    'bvh', 'bzd', 'cd', 'cf', 'cml', 'dka', 'dpt', 'ekg', 'er', 'eswl', 'ga',
    'gfr', 'gi', 'got', 'gpt', 'hb', 'hcc', 'hcm', 'hit', 'hlw', 'hno', 'icu',
    'kh', 'lfu', 'mrt', 'niv', 'nstemi', 'op', 'pavk', 'pci', 'peg', 'pvk',
    'rr', 'stemi', 'tee', 'tte', 'usg', 'vt', 'vvt', 'zvk'
  ];

  translationKeys.forEach(key => {
    const termKey = `lexicon.medical_abbreviations_json.common_abbreviations.${key}.term`;
    const definitionKey = `lexicon.medical_abbreviations_json.common_abbreviations.${key}.definition`;
    
    // Check if translation exists and is not the fallback key
    const translatedTerm = i18n.t(termKey);
    const translatedDefinition = i18n.t(definitionKey);
    
    // If translation is available and not the fallback key, use it
    if (translatedTerm !== termKey && translatedDefinition !== definitionKey) {
      results.push({
        id: key,
        term: translatedTerm,
        definition: translatedDefinition
      });
    } else {
      // Otherwise, find the original entry from medicalAbbreviationsData
      const originalEntry = medicalAbbreviationsData.find((entry: any) => entry.id === key);
      if (originalEntry) {
        results.push({
          id: originalEntry.id,
          term: originalEntry.term,
          definition: originalEntry.definition
        });
      }
    }
  });

  return results;
};

/**
 * Gets translated laboratory parameters from i18n
 * Falls back to original entries from JSON if translation is not available
 * @returns Array of translated laboratory parameter entries
 */
export const getTranslatedLaboratoryParametersEntries = (): LexikonEntry[] => {
  const results: LexikonEntry[] = [];

  // Get the IDs of laboratory parameters we have i18n translations for
  const translationKeys = [
    'albumin', 'acth', 'aldosteron', 'alkalische_phosphatase', 'afp', 'ammoniak',
    'bilirubin', 'bnp', 'calcium', 'cholesterin', 'ck', 'crp', 'd_dimer',
    'ferritin', 'glucose', 'gpt', 'got', 'haemoglobin', 'hba1c', 'inr',
    'kalium', 'kreatinin', 'leukozyten', 'magnesium', 'natrium', 'phosphat',
    'psa', 'ptt', 'quick', 'thrombozyten', 'troponin', 'tsh', 'vitamin_d'
  ];

  translationKeys.forEach(key => {
    const nameKey = `lexicon.laboratory_parameters_json.essential_parameters.${key}.name`;
    const kuerzelKey = `lexicon.laboratory_parameters_json.essential_parameters.${key}.kuerzel`;
    const bedeutungKey = `lexicon.laboratory_parameters_json.essential_parameters.${key}.bedeutung`;
    const relevanzKey = `lexicon.laboratory_parameters_json.essential_parameters.${key}.relevanz_pflege`;
    
    // Check if translation exists and is not the fallback key
    const translatedName = i18n.t(nameKey);
    const translatedKuerzel = i18n.t(kuerzelKey);
    const translatedBedeutung = i18n.t(bedeutungKey);
    const translatedRelevanz = i18n.t(relevanzKey);
    
    // If translation is available and not the fallback key, use it
    if (translatedName !== nameKey && translatedBedeutung !== bedeutungKey) {
      results.push({
        id: key,
        term: `${translatedName} (${translatedKuerzel})`,
        definition: `${translatedBedeutung} ${translatedRelevanz ? 'Pflegerelevanz: ' + translatedRelevanz : ''}`
      });
    }
  });

  return results;
};

/**
 * Combines the existing lexicon entries with the additional entries and i18n translations
 * Prioritizes i18n translations over hardcoded entries where available
 * @returns An array of all lexicon entries
 */
export const getCombinedLexikonEntries = (): LexikonEntry[] => {
  const entriesMap = new Map<string, LexikonEntry>();

  // Add original entries first
  lexikonEntries.forEach(entry => {
    entriesMap.set(entry.id, entry);
  });

  // Add extended entries, also overriding duplicates if they exist
  extendedLexikonEntries.forEach(entry => {
    entriesMap.set(entry.id, entry);
  });

  // Try to add i18n translated basic entries, overriding hardcoded ones if translations are available
  try {
    const translatedBasicEntries = getTranslatedBasicLexikonEntries();
    translatedBasicEntries.forEach(entry => {
      entriesMap.set(entry.id, entry);
    });
  } catch (error) {
    console.warn('Failed to load i18n basic lexicon entries:', error);
  }

  // Try to add i18n translated additional entries, overriding hardcoded ones if translations are available
  try {
    const translatedAdditionalEntries = getTranslatedAdditionalLexikonEntries();
    translatedAdditionalEntries.forEach(entry => {
      entriesMap.set(entry.id, entry);
    });
  } catch (error) {
    console.warn('Failed to load i18n additional lexicon entries:', error);
  }

  // Try to add i18n translated extended entries, overriding hardcoded ones if translations are available
  try {
    const translatedExtendedEntries = getTranslatedExtendedLexikonEntries();
    translatedExtendedEntries.forEach(entry => {
      entriesMap.set(entry.id, entry);
    });
  } catch (error) {
    console.warn('Failed to load i18n extended lexicon entries:', error);
  }

  // Try to add i18n translated medical abbreviations from JSON, overriding hardcoded ones if translations are available
  try {
    const translatedMedicalAbbreviations = getTranslatedMedicalAbbreviationsEntries();
    translatedMedicalAbbreviations.forEach(entry => {
      entriesMap.set(entry.id, entry);
    });
  } catch (error) {
    console.warn('Failed to load i18n medical abbreviations entries:', error);
  }

  // Try to add i18n translated laboratory parameters from JSON, overriding hardcoded ones if translations are available
  try {
    const translatedLaboratoryParameters = getTranslatedLaboratoryParametersEntries();
    translatedLaboratoryParameters.forEach(entry => {
      entriesMap.set(entry.id, entry);
    });
  } catch (error) {
    console.warn('Failed to load i18n laboratory parameters entries:', error);
  }

  // Add additional entries with HIGHEST priority, overriding ALL previous entries
  additionalLexikonEntries.forEach(entry => {
    entriesMap.set(entry.id, entry);
  });



  return Array.from(entriesMap.values());
};

/**
 * Gets the total count of all lexicon entries after combining
 * @returns The total number of entries
 */
export const getTotalLexikonEntriesCount = (): number => {
  return getCombinedLexikonEntries().length;
};

/**
 * Finds a lexicon entry by its ID from the combined entries
 * @param id The ID of the entry to find
 * @returns The lexicon entry or undefined if not found
 */
export const findLexikonEntryById = (id: string): LexikonEntry | undefined => {
  return getCombinedLexikonEntries().find(entry => entry.id === id);
};
