/**
 * Repräsentiert die Koordinaten und Einstellungen eines Arbeitsortes
 */
export interface WorkLocation {
  /** Breitengrad (latitude) des Arbeitsortes */
  latitude: number;
  
  /** Längengrad (longitude) des Arbeitsortes */
  longitude: number;
  
  /** Radius in Metern, innerhalb dessen der Benutzer als 'am Arbeitsort' gilt */
  radius: number;
  
  /** Name/Bezeichnung des Arbeitsortes (optional) */
  name?: string;
} 