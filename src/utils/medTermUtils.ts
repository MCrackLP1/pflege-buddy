/**
 * Interface representing a medical term
 */
export interface MedicalTerm {
  id: string;
  term: string;
  definition: string;
  synonyms?: string[];
  examples?: string[];
  category?: string;
}

/**
 * Validates if an object is a valid medical term
 * @param term - The object to validate
 * @returns boolean indicating if the object is a valid medical term
 */
export function isValidMedicalTerm(term: unknown): term is MedicalTerm {
  if (typeof term !== 'object' || term === null) return false;

  const medicalTerm = term as MedicalTerm;
  return (
    typeof medicalTerm.id === 'string' &&
    typeof medicalTerm.term === 'string' &&
    typeof medicalTerm.definition === 'string' &&
    medicalTerm.term.length > 0 &&
    medicalTerm.definition.length > 0
  );
}

/**
 * Formats a medical term for display
 * @param term - The medical term to format
 * @returns A formatted string representation of the medical term
 */
export function formatMedicalTerm(term: MedicalTerm): string {
  return `${term.term}: ${term.definition}`;
}
