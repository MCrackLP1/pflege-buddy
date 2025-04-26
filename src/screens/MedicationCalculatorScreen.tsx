/**
 * MedicationCalculatorScreen.tsx
 * Enthält verschiedene medizinische Rechner für Infusionen und Medikationen
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import Typen
import { RootStackParamList } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

type MedicationCalculatorNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Typ für unsere Rechner-History
interface CalculationHistoryItem {
  type: string;       // Art des Rechners
  input: any;         // Eingabewerte
  result: any;        // Ergebnis
  timestamp: number;  // Zeitstempel
}

// Aufzählung der verfügbaren Rechner
enum CalculatorType {
  DRIP_RATE = 'Tropfenzahl-Rechner',
  ML_PER_HOUR = 'ml/h-Rechner',
  MG_KG_MIN = 'mg/kg/min-Rechner',
  CONCENTRATION = 'Konzentrations-Rechner',
  INSULIN = 'Insulin-Rechner',
  GCS = 'Glasgow Coma Scale'
}

// Helfer-Objekt für Tab-Icons und Beschreibungen
const calculatorInfo = {
  [CalculatorType.DRIP_RATE]: {
    icon: 'water-outline',
    description: 'Tropfenzahl einer Infusion berechnen'
  },
  [CalculatorType.ML_PER_HOUR]: {
    icon: 'time-outline',
    description: 'Flussrate in ml/h berechnen'
  },
  [CalculatorType.MG_KG_MIN]: {
    icon: 'calculator-outline',
    description: 'Dosis nach Körpergewicht berechnen'
  },
  [CalculatorType.CONCENTRATION]: {
    icon: 'flask-outline',
    description: 'Konzentration und Menge umrechnen'
  },
  [CalculatorType.INSULIN]: {
    icon: 'fitness-outline',
    description: 'Einfache Insulindosisberechnung'
  },
  [CalculatorType.GCS]: {
    icon: 'brain-outline',
    description: 'Glasgow Coma Scale (GCS) berechnen und bewerten'
  }
};

/**
 * MedicationCalculatorScreen Component
 * 
 * A screen component that provides various medication-related calculations
 * including drip rates, ml/hour calculations, and other medical dosage calculations.
 * 
 * @component
 * @returns {React.FC} MedicationCalculatorScreen component
 */
const MedicationCalculatorScreen: React.FC = () => {
  const navigation = useNavigation<MedicationCalculatorNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();

  // States
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>(CalculatorType.DRIP_RATE);
  const [calculationHistory, setCalculationHistory] = useState<CalculationHistoryItem[]>([]);
  
  // Eingabe-States für Tropfenzahl-Rechner
  const [dripRateInput, setDripRateInput] = useState({
    volume: '', // in ml
    duration: '', // in min
    dropFactor: '20' // Standard-Tropfenfaktor: 20 Tropfen/ml
  });
  
  // Eingabe-States für ml/h-Rechner
  const [mlPerHourInput, setMlPerHourInput] = useState({
    volume: '', // in ml
    duration: '' // in Stunden
  });
  
  // Eingabe-States für mg/kg/min-Rechner
  const [mgKgMinInput, setMgKgMinInput] = useState({
    weight: '', // in kg
    targetDose: '', // in mg/kg/min
    concentration: '' // in mg/ml
  });
  
  // Eingabe-States für Konzentrations-Rechner
  const [concentrationMode, setConcentrationMode] = useState<'A' | 'B'>('A'); // A: mg in X ml, B: ml für X mg
  const [concentrationInput, setConcentrationInput] = useState({
    mg: '', // mg gesamt
    ml: '', // ml gesamt
    concentration: '' // in mg/ml (wird automatisch berechnet)
  });
  
  // Vereinfachter Insulin-Rechner mit weniger Eingabefeldern
  const [insulinInput, setInsulinInput] = useState({
    currentBG: '', // Aktueller Blutzucker (mg/dl)
    carbIntake: '', // Kohlenhydrat-Aufnahme (g)
    profile: 'standard', // Profil für vordefinierte Werte
  });
  
  // Profile mit vordefinierten Werten
  const insulinProfiles = {
    standard: {
      label: 'Standard Erwachsener',
      targetBG: 120, // mg/dl
      insulinSensitivity: 50, // mg/dl pro 1 IE
      carbRatio: 10, // g KH pro 1 IE
    },
    sensitive: {
      label: 'Insulinsensitiv',
      targetBG: 120, // mg/dl
      insulinSensitivity: 70, // mg/dl pro 1 IE
      carbRatio: 15, // g KH pro 1 IE
    },
    resistant: {
      label: 'Insulinresistent',
      targetBG: 120, // mg/dl
      insulinSensitivity: 30, // mg/dl pro 1 IE
      carbRatio: 6, // g KH pro 1 IE
    },
    child: {
      label: 'Kind',
      targetBG: 120, // mg/dl
      insulinSensitivity: 100, // mg/dl pro 1 IE
      carbRatio: 20, // g KH pro 1 IE
    }
  };
  
  // Eingabe-States für GCS-Rechner
  const [gcsInput, setGcsInput] = useState({
    eyeResponse: 4, // Augen öffnen (1-4)
    verbalResponse: 5, // Verbale Antwort (1-5)
    motorResponse: 6, // Motorische Antwort (1-6)
  });

  // States für die Ergebnisse
  const [dripRateResult, setDripRateResult] = useState<number | null>(null);
  const [mlPerHourResult, setMlPerHourResult] = useState<number | null>(null);
  const [mgKgMinResult, setMgKgMinResult] = useState<number | null>(null);
  const [concentrationResult, setConcentrationResult] = useState<number | null>(null);
  const [insulinResult, setInsulinResult] = useState<{mealDose: number; correctionDose: number; totalDose: number} | null>(null);
  const [gcsResult, setGcsResult] = useState<{total: number; severity: string} | null>(null);

  // Farbdefinitionen
  const colors = {
    primary: '#32b8ca',
    primaryLight: theme === 'dark' ? 'rgba(50, 184, 202, 0.15)' : 'rgba(50, 184, 202, 0.1)',
    highlight: theme === 'dark' ? '#1f1f1f' : '#f0f0f0',
    background: theme === 'dark' ? '#121212' : '#ffffff',
    card: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    border: theme === 'dark' ? '#333333' : '#eeeeee',
    text: theme === 'dark' ? '#ffffff' : '#333333',
    textSecondary: theme === 'dark' ? '#aaaaaa' : '#666666',
    error: '#ff5252',
    inputBackground: theme === 'dark' ? '#2a2a2a' : '#f7f7f7',
  };
  
  // Formular-Styles
  const formStyles = StyleSheet.create({
    formContainer: {
      marginTop: 8,
      marginBottom: 24,
      paddingHorizontal: 16,
    },
    inputRow: {
      marginBottom: 16,
    },
    label: {
      fontSize: baseFontSize * fontSizeScale,
      fontWeight: '600',
      marginBottom: 8,
      color: colors.text,
      letterSpacing: 0.2,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      fontSize: baseFontSize * fontSizeScale,
      color: colors.text,
      width: '100%',
    },
    inputIcon: {
      position: 'absolute',
      right: 14,
      top: 14,
    },
    inputHelper: {
      fontSize: baseFontSize * fontSizeScale * 0.8,
      color: colors.textSecondary,
      marginTop: 4,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: baseFontSize * fontSizeScale,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    resultContainer: {
      marginTop: 24,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.primaryLight,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
    },
    resultText: {
      fontSize: baseFontSize * fontSizeScale * 1.4,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    resultLabel: {
      fontSize: baseFontSize * fontSizeScale * 0.9,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    resultUnit: {
      fontSize: baseFontSize * fontSizeScale * 1.1,
      fontWeight: '500',
      color: colors.primary,
      marginTop: 4,
    },
    resultIcon: {
      marginBottom: 12,
    },
    resultDetails: {
      fontSize: baseFontSize * fontSizeScale * 0.9,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
    },
    tabContainer: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      marginVertical: 8,
    },
    tab: {
      paddingVertical: 12,
      paddingHorizontal: 18,
      marginRight: 12,
      marginBottom: 8,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 110,
    },
    tabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabText: {
      fontSize: baseFontSize * fontSizeScale * 0.85,
      color: colors.text,
      textAlign: 'center',
    },
    tabTextActive: {
      color: 'white',
      fontWeight: 'bold',
    },
    toggleContainer: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    toggleButton: {
      flex: 1,
      padding: 10,
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleButtonLeft: {
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    toggleButtonRight: {
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
    },
    toggleButtonActive: {
      backgroundColor: colors.primary,
    },
    toggleButtonText: {
      color: colors.text,
      fontSize: baseFontSize * fontSizeScale * 0.9,
    },
    toggleButtonTextActive: {
      color: 'white',
      fontWeight: 'bold',
    },
    errorText: {
      color: colors.error,
      fontSize: baseFontSize * fontSizeScale * 0.8,
      marginTop: 4,
    },
    historyContainer: {
      marginTop: 24,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    historyTitle: {
      fontSize: baseFontSize * fontSizeScale * 1.1,
      fontWeight: 'bold',
      color: colors.text,
    },
    historyItem: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    historyItemText: {
      color: colors.text,
      fontSize: baseFontSize * fontSizeScale * 0.9,
    },
    historyItemDate: {
      color: colors.textSecondary,
      fontSize: baseFontSize * fontSizeScale * 0.8,
    },
    sectionTitle: {
      fontSize: baseFontSize * fontSizeScale * 1.1,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    descriptionText: {
      fontSize: baseFontSize * fontSizeScale * 0.9,
      color: colors.textSecondary,
      marginBottom: 16,
      fontStyle: 'italic',
    },
    infoBox: {
      backgroundColor: colors.primaryLight,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoText: {
      color: colors.text,
      fontSize: baseFontSize * fontSizeScale * 0.85,
      flex: 1,
      marginLeft: 8,
    },
    dropdownContainer: {
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    dropdown: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 0,
    },
    dropdownButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    dropdownButtonText: {
      color: colors.text,
      fontSize: baseFontSize * fontSizeScale,
      fontWeight: '500',
    },
    dropdownContent: {
      position: 'absolute',
      top: 65,
      left: 16,
      right: 16,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      zIndex: 1000,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dropdownItemLast: {
      borderBottomWidth: 0,
    },
    dropdownItemText: {
      flex: 1,
      marginLeft: 12,
      color: colors.text,
      fontSize: baseFontSize * fontSizeScale,
    },
  });

  // State für Dropdown-Anzeige
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Funktionen zum Berechnen der verschiedenen Werte

  /**
   * Calculates the drip rate (drops per minute) for intravenous medication
   * 
   * @private
   * @function calculateDripRate
   * @returns {void}
   * @throws {Error} If invalid input values are provided
   */
  const calculateDripRate = () => {
    const volume = parseFloat(dripRateInput.volume);
    const duration = parseFloat(dripRateInput.duration);
    const dropFactor = parseFloat(dripRateInput.dropFactor);
    
    if (isNaN(volume) || isNaN(duration) || isNaN(dropFactor) || 
        volume <= 0 || duration <= 0 || dropFactor <= 0) {
      Alert.alert('Fehler', 'Bitte geben Sie gültige positive Zahlen ein.');
      return;
    }
    
    // Formel: (Volumen in ml × Tropfenfaktor) / (Laufzeit in Minuten × 60) = Tropfen/Sekunde
    const result = ((volume * dropFactor) / (duration * 60)).toFixed(2);
    setDripRateResult(parseFloat(result));
    
    // Zur History hinzufügen
    addToHistory({
      type: CalculatorType.DRIP_RATE,
      input: { ...dripRateInput },
      result: result,
      timestamp: Date.now()
    });
  };
  
  /**
   * Calculates the milliliters per hour rate for intravenous medication
   * 
   * @private
   * @function calculateMlPerHour
   * @returns {void}
   * @throws {Error} If invalid input values are provided
   */
  const calculateMlPerHour = () => {
    const volume = parseFloat(mlPerHourInput.volume);
    const duration = parseFloat(mlPerHourInput.duration);
    
    if (isNaN(volume) || isNaN(duration) || volume <= 0 || duration <= 0) {
      Alert.alert('Fehler', 'Bitte geben Sie gültige positive Zahlen ein.');
      return;
    }
    
    // Formel: Volumen / Zeit in Stunden = ml/h
    const result = Math.round(volume / duration);
    setMlPerHourResult(result);
    
    // Zur History hinzufügen
    addToHistory({
      type: CalculatorType.ML_PER_HOUR,
      input: { ...mlPerHourInput },
      result: result,
      timestamp: Date.now()
    });
  };
  
  // 3. mg/kg/min Rechner (ergibt ml/h)
  const calculateMgKgMin = () => {
    const weight = parseFloat(mgKgMinInput.weight);
    const targetDose = parseFloat(mgKgMinInput.targetDose);
    const concentration = parseFloat(mgKgMinInput.concentration);
    
    if (isNaN(weight) || isNaN(targetDose) || isNaN(concentration) || 
        weight <= 0 || targetDose <= 0 || concentration <= 0) {
      Alert.alert('Fehler', 'Bitte geben Sie gültige positive Zahlen ein.');
      return;
    }
    
    // Formel: (Gewicht × Zieldosis × 60) / Konzentration = ml/h
    const result = Math.round((weight * targetDose * 60) / concentration);
    setMgKgMinResult(result);
    
    // Zur History hinzufügen
    addToHistory({
      type: CalculatorType.MG_KG_MIN,
      input: { ...mgKgMinInput },
      result: result,
      timestamp: Date.now()
    });
  };
  
  // 4. Konzentrations-Rechner
  const calculateConcentration = () => {
    if (concentrationMode === 'A') {
      // Variante A: Wie viele mg sind in X ml?
      const ml = parseFloat(concentrationInput.ml);
      const conc = parseFloat(concentrationInput.concentration);
      
      if (isNaN(ml) || isNaN(conc) || ml <= 0 || conc <= 0) {
        Alert.alert('Fehler', 'Bitte geben Sie gültige positive Zahlen ein.');
        return;
      }
      
      const result = ml * conc;
      setConcentrationResult(result);
      
      // Zur History hinzufügen
      addToHistory({
        type: `${CalculatorType.CONCENTRATION} (A)`,
        input: { ml, concentration: conc },
        result: result,
        timestamp: Date.now()
      });
    } else {
      // Variante B: Wie viele ml benötige ich für X mg?
      const mg = parseFloat(concentrationInput.mg);
      const conc = parseFloat(concentrationInput.concentration);
      
      if (isNaN(mg) || isNaN(conc) || mg <= 0 || conc <= 0) {
        Alert.alert('Fehler', 'Bitte geben Sie gültige positive Zahlen ein.');
        return;
      }
      
      const result = mg / conc;
      setConcentrationResult(result);
      
      // Zur History hinzufügen
      addToHistory({
        type: `${CalculatorType.CONCENTRATION} (B)`,
        input: { mg, concentration: conc },
        result: result,
        timestamp: Date.now()
      });
    }
  };
  
  // Vereinfachter Insulindosierungsrechner
  const calculateInsulin = () => {
    const currentBG = parseFloat(insulinInput.currentBG);
    const carbIntake = parseFloat(insulinInput.carbIntake) || 0;
    const selectedProfile = insulinProfiles[insulinInput.profile as keyof typeof insulinProfiles];
    
    // Profil-Werte abrufen
    const targetBG = selectedProfile.targetBG;
    const insulinSensitivity = selectedProfile.insulinSensitivity;
    const carbRatio = selectedProfile.carbRatio;
    
    if (isNaN(currentBG) || currentBG <= 0) {
      Alert.alert('Fehler', 'Bitte geben Sie einen gültigen Blutzuckerwert ein.');
      return;
    }
    
    // Berechnung der Korrektur-Dosis: (aktueller BZ - Ziel-BZ) / Insulinempfindlichkeit
    let correctionDose = 0;
    if (currentBG > targetBG) {
      correctionDose = (currentBG - targetBG) / insulinSensitivity;
    }
    
    // Berechnung der Mahlzeiten-Dosis: KH-Menge / KH-Verhältnis
    const mealDose = carbIntake / carbRatio;
    
    // Gesamtdosis
    const totalDose = correctionDose + mealDose;
    
    // Ergebnisse auf ganze Zahlen runden
    setInsulinResult({
      correctionDose: Math.round(correctionDose),
      mealDose: Math.round(mealDose),
      totalDose: Math.round(totalDose)
    });
    
    // Zur History hinzufügen
    addToHistory({
      type: CalculatorType.INSULIN,
      input: { 
        ...insulinInput,
        profileLabel: selectedProfile.label 
      },
      result: {
        correctionDose: Math.round(correctionDose),
        mealDose: Math.round(mealDose),
        totalDose: Math.round(totalDose)
      },
      timestamp: Date.now()
    });
  };
  
  // Glasgow Coma Scale Berechner
  const calculateGCS = () => {
    const eyeResponse = gcsInput.eyeResponse;
    const verbalResponse = gcsInput.verbalResponse;
    const motorResponse = gcsInput.motorResponse;
    
    // Gesamtpunktzahl berechnen
    const total = eyeResponse + verbalResponse + motorResponse;
    
    // Schweregrad bestimmen
    let severity = "";
    if (total >= 13) {
      severity = "Leicht (13-15)";
    } else if (total >= 9) {
      severity = "Mittel (9-12)";
    } else {
      severity = "Schwer (3-8)";
    }
    
    setGcsResult({
      total,
      severity
    });
    
    // Zur History hinzufügen
    addToHistory({
      type: CalculatorType.GCS,
      input: { ...gcsInput },
      result: { total, severity },
      timestamp: Date.now()
    });
  };
  
  // Zur History hinzufügen und auf maximal 5 Einträge begrenzen
  const addToHistory = (item: CalculationHistoryItem) => {
    setCalculationHistory(prev => {
      const newHistory = [item, ...prev];
      if (newHistory.length > 5) {
        return newHistory.slice(0, 5);
      }
      return newHistory;
    });
  };

  // Render-Funktion für den Tab-Selector als Dropdown
  const renderTabSelector = () => {
    return (
      <View style={formStyles.dropdownContainer}>
        <Text style={formStyles.sectionTitle}>Wählen Sie einen Rechner:</Text>
        
        <View style={formStyles.dropdown}>
          <TouchableOpacity 
            style={formStyles.dropdownButton}
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon 
                name={calculatorInfo[activeCalculator].icon} 
                size={24} 
                color={colors.primary} 
                style={{ marginRight: 10 }} 
              />
              <Text style={formStyles.dropdownButtonText}>{activeCalculator}</Text>
            </View>
            <Icon 
              name={dropdownVisible ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>

        {dropdownVisible && (
          <View style={formStyles.dropdownContent}>
            {Object.values(CalculatorType).map((type, index, array) => (
              <TouchableOpacity
                key={type}
                style={[
                  formStyles.dropdownItem,
                  index === array.length - 1 && formStyles.dropdownItemLast
                ]}
                onPress={() => {
                  setActiveCalculator(type);
                  setDropdownVisible(false);
                }}
              >
                <Icon 
                  name={calculatorInfo[type].icon} 
                  size={24} 
                  color={type === activeCalculator ? colors.primary : colors.text} 
                />
                <Text
                  style={[
                    formStyles.dropdownItemText,
                    type === activeCalculator && { color: colors.primary, fontWeight: 'bold' }
                  ]}
                >
                  {type}
                </Text>
                {type === activeCalculator && (
                  <Icon name="checkmark" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <Text style={formStyles.descriptionText}>{calculatorInfo[activeCalculator].description}</Text>
      </View>
    );
  };

  // Render-Funktion für den Tropfenzahl-Rechner mit verbesserten Eingabefeldern
  const renderDripRateCalculator = () => {
    return (
      <View style={formStyles.formContainer}>
        <View style={formStyles.infoBox}>
          <Icon name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={formStyles.infoText}>
            Berechnen Sie die Tropfenzahl bei Schwerkraftinfusionen basierend auf Volumen, Laufzeit und Tropfenfaktor.
          </Text>
        </View>
        
        <View style={formStyles.inputRow}>
          <Text style={formStyles.label}>Volumen (ml)</Text>
          <TextInput
            style={formStyles.input}
            keyboardType="numeric"
            value={dripRateInput.volume}
            onChangeText={(text) => setDripRateInput({ ...dripRateInput, volume: text })}
            placeholder="z.B. 500"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={formStyles.inputHelper}>Gesamtvolumen der Infusion in Millilitern</Text>
        </View>
        
        <View style={formStyles.inputRow}>
          <Text style={formStyles.label}>Laufzeit (min)</Text>
          <TextInput
            style={formStyles.input}
            keyboardType="numeric"
            value={dripRateInput.duration}
            onChangeText={(text) => setDripRateInput({ ...dripRateInput, duration: text })}
            placeholder="z.B. 60"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={formStyles.inputHelper}>Gewünschte Laufzeit in Minuten</Text>
        </View>
        
        <View style={formStyles.inputRow}>
          <Text style={formStyles.label}>Tropfenfaktor (Tropfen/ml)</Text>
          <TextInput
            style={formStyles.input}
            keyboardType="numeric"
            value={dripRateInput.dropFactor}
            onChangeText={(text) => setDripRateInput({ ...dripRateInput, dropFactor: text })}
            placeholder="Standardwert: 20"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={formStyles.inputHelper}>Typisch: 20 (Standard), 15 (Blut), 60 (Mikro)</Text>
        </View>
        
        <TouchableOpacity
          style={formStyles.button}
          onPress={calculateDripRate}
        >
          <Icon name="calculator-outline" size={20} color="#ffffff" />
          <Text style={formStyles.buttonText}>Berechnen</Text>
        </TouchableOpacity>
        
        {dripRateResult !== null && (
          <View style={formStyles.resultContainer}>
            <Icon name="water-outline" size={30} color={colors.primary} style={formStyles.resultIcon} />
            <Text style={formStyles.resultLabel}>Erforderliche Tropfenanzahl:</Text>
            <Text style={formStyles.resultText}>{dripRateResult}</Text>
            <Text style={formStyles.resultUnit}>Tropfen/Sekunde</Text>
            <Text style={formStyles.resultDetails}>
              {dripRateInput.volume}ml über {dripRateInput.duration}min mit {dripRateInput.dropFactor} Tropfen/ml
            </Text>
            <Text style={[formStyles.resultDetails, { color: '#888', marginTop: 8 }]}>Hinweis: Dieses Ergebnis dient ausschließlich zu Lern- und Informationszwecken und ist nicht zur Anwendung am Patienten bestimmt.</Text>
          </View>
        )}
      </View>
    );
  };
  
  // Render-Funktion für den ml/h-Rechner
  const renderMlPerHourCalculator = () => {
    return (
      <View style={formStyles.formContainer}>
        <View style={formStyles.infoBox}>
          <Icon name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={formStyles.infoText}>
            Berechnen Sie die stündliche Flussrate in ml/h für ein bestimmtes Volumen über eine gewünschte Zeit.
          </Text>
        </View>
        
        <View style={formStyles.inputRow}>
          <Text style={formStyles.label}>Volumen (ml)</Text>
          <TextInput
            style={formStyles.input}
            keyboardType="numeric"
            value={mlPerHourInput.volume}
            onChangeText={(text) => setMlPerHourInput({ ...mlPerHourInput, volume: text })}
            placeholder="z.B. 1000"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={formStyles.inputHelper}>Gesamtvolumen der Infusion in Millilitern</Text>
        </View>
        
        <View style={formStyles.inputRow}>
          <Text style={formStyles.label}>Zeit (Stunden)</Text>
          <TextInput
            style={formStyles.input}
            keyboardType="numeric"
            value={mlPerHourInput.duration}
            onChangeText={(text) => setMlPerHourInput({ ...mlPerHourInput, duration: text })}
            placeholder="z.B. 8"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={formStyles.inputHelper}>Gewünschte Laufzeit in Stunden</Text>
        </View>
        
        <TouchableOpacity
          style={formStyles.button}
          onPress={calculateMlPerHour}
        >
          <Icon name="calculator-outline" size={20} color="#ffffff" />
          <Text style={formStyles.buttonText}>Berechnen</Text>
        </TouchableOpacity>
        
        {mlPerHourResult !== null && (
          <View style={formStyles.resultContainer}>
            <Icon name="time-outline" size={30} color={colors.primary} style={formStyles.resultIcon} />
            <Text style={formStyles.resultLabel}>Flussrate:</Text>
            <Text style={formStyles.resultText}>{mlPerHourResult}</Text>
            <Text style={formStyles.resultUnit}>ml/h</Text>
            <Text style={formStyles.resultDetails}>
              {mlPerHourInput.volume}ml über {mlPerHourInput.duration} Stunden
            </Text>
            <Text style={[formStyles.resultDetails, { color: '#888', marginTop: 8 }]}>Hinweis: Dieses Ergebnis dient ausschließlich zu Lern- und Informationszwecken und ist nicht zur Anwendung am Patienten bestimmt.</Text>
          </View>
        )}
      </View>
    );
  };
  
  // Render-Funktion für den mg/kg/min-Rechner mit verbesserten Eingabefeldern
  const renderMgKgMinCalculator = () => {
    return (
      <View style={formStyles.formContainer}>
        <View style={formStyles.infoBox}>
          <Icon name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={formStyles.infoText}>
            Berechnen Sie die Flussrate in ml/h für gewichtsbasierte Dosierungen wie bei Katecholaminen.
          </Text>
        </View>
        
        <View style={formStyles.inputRow}>
          <Text style={formStyles.label}>Gewicht (kg)</Text>
          <TextInput
            style={formStyles.input}
            keyboardType="numeric"
            value={mgKgMinInput.weight}
            onChangeText={(text) => setMgKgMinInput({ ...mgKgMinInput, weight: text })}
            placeholder="z.B. 75"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={formStyles.inputHelper}>Körpergewicht des Patienten in kg</Text>
        </View>
        
        <View style={formStyles.inputRow}>
          <Text style={formStyles.label}>Zieldosis (mg/kg/min)</Text>
          <TextInput
            style={formStyles.input}
            keyboardType="numeric"
            value={mgKgMinInput.targetDose}
            onChangeText={(text) => setMgKgMinInput({ ...mgKgMinInput, targetDose: text })}
            placeholder="z.B. 0.005"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={formStyles.inputHelper}>Zieldosierung des Medikaments (oft als Dezimalzahl, z.B. 0,005)</Text>
        </View>
        
        <View style={formStyles.inputRow}>
          <Text style={formStyles.label}>Konzentration (mg/ml)</Text>
          <TextInput
            style={formStyles.input}
            keyboardType="numeric"
            value={mgKgMinInput.concentration}
            onChangeText={(text) => setMgKgMinInput({ ...mgKgMinInput, concentration: text })}
            placeholder="z.B. 1"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={formStyles.inputHelper}>Konzentration der Lösung in mg pro ml</Text>
        </View>
        
        <TouchableOpacity
          style={formStyles.button}
          onPress={calculateMgKgMin}
        >
          <Icon name="calculator-outline" size={20} color="#ffffff" />
          <Text style={formStyles.buttonText}>Berechnen</Text>
        </TouchableOpacity>
        
        {mgKgMinResult !== null && (
          <View style={formStyles.resultContainer}>
            <Icon name="calculator-outline" size={30} color={colors.primary} style={formStyles.resultIcon} />
            <Text style={formStyles.resultLabel}>Erforderliche Flussrate:</Text>
            <Text style={formStyles.resultText}>{mgKgMinResult}</Text>
            <Text style={formStyles.resultUnit}>ml/h</Text>
            <Text style={formStyles.resultDetails}>
              {mgKgMinInput.weight}kg × {mgKgMinInput.targetDose}mg/kg/min bei {mgKgMinInput.concentration}mg/ml
            </Text>
            <Text style={[formStyles.resultDetails, { color: '#888', marginTop: 8 }]}>Hinweis: Dieses Ergebnis dient ausschließlich zu Lern- und Informationszwecken und ist nicht zur Anwendung am Patienten bestimmt.</Text>
          </View>
        )}
      </View>
    );
  };
  
  // Render-Funktion für den Konzentrations-Rechner mit verbesserter Ergebnisanzeige
  const renderConcentrationCalculator = () => {
    return (
      <View style={formStyles.formContainer}>
        <View style={formStyles.toggleContainer}>
          <TouchableOpacity
            style={[
              formStyles.toggleButton,
              formStyles.toggleButtonLeft,
              concentrationMode === 'A' && formStyles.toggleButtonActive
            ]}
            onPress={() => setConcentrationMode('A')}
          >
            <Text
              style={[
                formStyles.toggleButtonText,
                concentrationMode === 'A' && formStyles.toggleButtonTextActive
              ]}
            >
              Wie viele mg sind in X ml?
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              formStyles.toggleButton,
              formStyles.toggleButtonRight,
              concentrationMode === 'B' && formStyles.toggleButtonActive
            ]}
            onPress={() => setConcentrationMode('B')}
          >
            <Text
              style={[
                formStyles.toggleButtonText,
                concentrationMode === 'B' && formStyles.toggleButtonTextActive
              ]}
            >
              Wie viele ml für X mg?
            </Text>
          </TouchableOpacity>
        </View>
        
        {concentrationMode === 'A' ? (
          // Variante A
          <>
            <View style={formStyles.inputRow}>
              <Text style={formStyles.label}>ml</Text>
              <TextInput
                style={formStyles.input}
                keyboardType="numeric"
                value={concentrationInput.ml}
                onChangeText={(text) => setConcentrationInput({ ...concentrationInput, ml: text })}
                placeholder="z.B. 5"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={formStyles.inputRow}>
              <Text style={formStyles.label}>Konzentration (mg/ml)</Text>
              <TextInput
                style={formStyles.input}
                keyboardType="numeric"
                value={concentrationInput.concentration}
                onChangeText={(text) => setConcentrationInput({ ...concentrationInput, concentration: text })}
                placeholder="z.B. 2"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <TouchableOpacity
              style={formStyles.button}
              onPress={calculateConcentration}
            >
              <Text style={formStyles.buttonText}>Berechnen</Text>
            </TouchableOpacity>
            
            {concentrationResult !== null && (
              <View style={formStyles.resultContainer}>
                <Icon name="flask-outline" size={30} color={colors.primary} style={formStyles.resultIcon} />
                <Text style={formStyles.resultLabel}>Enthaltene Menge:</Text>
                <Text style={formStyles.resultText}>{concentrationResult}</Text>
                <Text style={formStyles.resultUnit}>mg</Text>
                <Text style={formStyles.resultDetails}>
                  In {concentrationInput.ml}ml bei {concentrationInput.concentration}mg/ml Konzentration
                </Text>
                <Text style={[formStyles.resultDetails, { color: '#888', marginTop: 8 }]}>Hinweis: Dieses Ergebnis dient ausschließlich zu Lern- und Informationszwecken und ist nicht zur Anwendung am Patienten bestimmt.</Text>
              </View>
            )}
          </>
        ) : (
          // Variante B
          <>
            <View style={formStyles.inputRow}>
              <Text style={formStyles.label}>mg</Text>
              <TextInput
                style={formStyles.input}
                keyboardType="numeric"
                value={concentrationInput.mg}
                onChangeText={(text) => setConcentrationInput({ ...concentrationInput, mg: text })}
                placeholder="z.B. 50"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={formStyles.inputRow}>
              <Text style={formStyles.label}>Konzentration (mg/ml)</Text>
              <TextInput
                style={formStyles.input}
                keyboardType="numeric"
                value={concentrationInput.concentration}
                onChangeText={(text) => setConcentrationInput({ ...concentrationInput, concentration: text })}
                placeholder="z.B. 5"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <TouchableOpacity
              style={formStyles.button}
              onPress={calculateConcentration}
            >
              <Text style={formStyles.buttonText}>Berechnen</Text>
            </TouchableOpacity>
            
            {concentrationResult !== null && (
              <View style={formStyles.resultContainer}>
                <Icon name="flask-outline" size={30} color={colors.primary} style={formStyles.resultIcon} />
                <Text style={formStyles.resultLabel}>Benötigtes Volumen:</Text>
                <Text style={formStyles.resultText}>{concentrationResult.toFixed(2)}</Text>
                <Text style={formStyles.resultUnit}>ml</Text>
                <Text style={formStyles.resultDetails}>
                  Für {concentrationInput.mg}mg bei {concentrationInput.concentration}mg/ml Konzentration
                </Text>
                <Text style={[formStyles.resultDetails, { color: '#888', marginTop: 8 }]}>Hinweis: Dieses Ergebnis dient ausschließlich zu Lern- und Informationszwecken und ist nicht zur Anwendung am Patienten bestimmt.</Text>
              </View>
            )}
          </>
        )}
      </View>
    );
  };
  
  // Render-Funktion für den Insulin-Rechner
  const renderInsulinCalculator = () => {
    return (
      <View style={formStyles.formContainer}>
        <View style={formStyles.infoBox}>
          <Icon name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={formStyles.infoText}>
            Berechnen Sie Insulindosen basierend auf aktuellem Blutzucker und Kohlenhydraten mit vordefinierten Profilen.
          </Text>
        </View>
        
        {/* Profil-Auswahl */}
        <View style={formStyles.inputRow}>
          <Text style={formStyles.label}>Patientenprofil</Text>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginTop: 8
          }}>
            {Object.entries(insulinProfiles).map(([key, profile]) => (
              <TouchableOpacity
                key={key}
                style={{
                  width: '48%',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: insulinInput.profile === key ? colors.primary : colors.inputBackground,
                  borderWidth: 1,
                  borderColor: insulinInput.profile === key ? colors.primary : colors.border,
                }}
                onPress={() => setInsulinInput({...insulinInput, profile: key})}
              >
                <Text style={{
                  textAlign: 'center',
                  color: insulinInput.profile === key ? 'white' : colors.text,
                  fontWeight: insulinInput.profile === key ? 'bold' : 'normal',
                }}>
                  {profile.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={formStyles.inputHelper}>
            Profile enthalten vordefinierte Werte für Ziel-BZ, Insulinempfindlichkeit und KH-Verhältnis
          </Text>
        </View>
        
        <View style={formStyles.inputRow}>
          <Text style={formStyles.label}>Aktueller Blutzucker (mg/dl)</Text>
          <TextInput
            style={formStyles.input}
            keyboardType="numeric"
            value={insulinInput.currentBG}
            onChangeText={(text) => setInsulinInput({ ...insulinInput, currentBG: text })}
            placeholder="z.B. 180"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={formStyles.inputHelper}>Aktueller gemessener Blutzuckerwert</Text>
        </View>
        
        <View style={formStyles.inputRow}>
          <Text style={formStyles.label}>Kohlenhydrate (g) - optional</Text>
          <TextInput
            style={formStyles.input}
            keyboardType="numeric"
            value={insulinInput.carbIntake}
            onChangeText={(text) => setInsulinInput({ ...insulinInput, carbIntake: text })}
            placeholder="z.B. 45"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={formStyles.inputHelper}>Kohlenhydratmenge der aktuellen/nächsten Mahlzeit (0 wenn keine Mahlzeit)</Text>
        </View>
        
        {/* Profil-Informationen anzeigen */}
        <View style={{
          backgroundColor: colors.primaryLight, 
          padding: 12, 
          borderRadius: 8,
          marginBottom: 16
        }}>
          <Text style={{fontWeight: 'bold', color: colors.text, marginBottom: 8}}>
            Ausgewähltes Profil: {insulinProfiles[insulinInput.profile as keyof typeof insulinProfiles].label}
          </Text>
          <Text style={{color: colors.text}}>
            Ziel-BZ: {insulinProfiles[insulinInput.profile as keyof typeof insulinProfiles].targetBG} mg/dl
          </Text>
          <Text style={{color: colors.text}}>
            Insulinempfindlichkeit: {insulinProfiles[insulinInput.profile as keyof typeof insulinProfiles].insulinSensitivity} mg/dl pro 1 IE
          </Text>
          <Text style={{color: colors.text}}>
            KH-Verhältnis: {insulinProfiles[insulinInput.profile as keyof typeof insulinProfiles].carbRatio} g KH pro 1 IE
          </Text>
        </View>
        
        <TouchableOpacity
          style={formStyles.button}
          onPress={calculateInsulin}
        >
          <Icon name="calculator-outline" size={20} color="#ffffff" />
          <Text style={formStyles.buttonText}>Berechnen</Text>
        </TouchableOpacity>
        
        {insulinResult !== null && (
          <View style={formStyles.resultContainer}>
            <Icon name="fitness-outline" size={30} color={colors.primary} style={formStyles.resultIcon} />
            
            <View style={{width: '100%', marginBottom: 16}}>
              <Text style={formStyles.resultLabel}>Ergebnis der Berechnung:</Text>
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
                <Text style={[formStyles.resultText, {fontSize: baseFontSize * fontSizeScale * 1.1}]}>Korrektur-Dosis:</Text>
                <Text style={[formStyles.resultText, {fontSize: baseFontSize * fontSizeScale * 1.1}]}>{insulinResult.correctionDose} IE</Text>
              </View>
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
                <Text style={[formStyles.resultText, {fontSize: baseFontSize * fontSizeScale * 1.1}]}>Mahlzeiten-Dosis:</Text>
                <Text style={[formStyles.resultText, {fontSize: baseFontSize * fontSizeScale * 1.1}]}>{insulinResult.mealDose} IE</Text>
              </View>
              
              <View style={{height: 1, backgroundColor: colors.primary, marginVertical: 8}} />
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 4}}>
                <Text style={[formStyles.resultText, {fontSize: baseFontSize * fontSizeScale * 1.2, fontWeight: 'bold'}]}>Gesamtdosis:</Text>
                <Text style={[formStyles.resultText, {fontSize: baseFontSize * fontSizeScale * 1.2, fontWeight: 'bold'}]}>{insulinResult.totalDose} IE</Text>
              </View>
            </View>
            
            <Text style={formStyles.resultDetails}>
              BZ: {insulinInput.currentBG} mg/dl, KH: {insulinInput.carbIntake || 0}g, Profil: {insulinProfiles[insulinInput.profile as keyof typeof insulinProfiles].label}
            </Text>
            <Text style={[formStyles.resultDetails, { color: '#888', marginTop: 8 }]}>Hinweis: Dieses Ergebnis dient ausschließlich zu Lern- und Informationszwecken und ist nicht zur Anwendung am Patienten bestimmt.</Text>
          </View>
        )}
      </View>
    );
  };
  
  // Render-Funktion für den GCS-Rechner
  const renderGCSCalculator = () => {
    const renderSelectorRow = (
      title: string, 
      value: number, 
      options: {value: number, label: string}[], 
      onChange: (newValue: number) => void
    ) => (
      <View style={{marginBottom: 16}}>
        <Text style={formStyles.label}>{title}</Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
          {options.map(option => (
            <TouchableOpacity
              key={option.value}
              style={{
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
                width: '48%',
                backgroundColor: value === option.value ? colors.primary : colors.inputBackground,
                borderWidth: 1,
                borderColor: value === option.value ? colors.primary : colors.border,
              }}
              onPress={() => onChange(option.value)}
            >
              <Text 
                style={{
                  color: value === option.value ? 'white' : colors.text,
                  fontWeight: value === option.value ? 'bold' : 'normal',
                  textAlign: 'center',
                }}
              >
                {option.value}: {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
    
    return (
      <View style={formStyles.formContainer}>
        <View style={formStyles.infoBox}>
          <Icon name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={formStyles.infoText}>
            Bewerten Sie den Bewusstseinszustand eines Patienten anhand der Glasgow Coma Scale (GCS).
          </Text>
        </View>
        
        {renderSelectorRow(
          'Augen öffnen', 
          gcsInput.eyeResponse, 
          [
            {value: 4, label: 'Spontan'},
            {value: 3, label: 'Auf Aufforderung'},
            {value: 2, label: 'Auf Schmerzreiz'},
            {value: 1, label: 'Keine Reaktion'}
          ],
          (newValue) => setGcsInput({...gcsInput, eyeResponse: newValue})
        )}
        
        {renderSelectorRow(
          'Verbale Antwort', 
          gcsInput.verbalResponse, 
          [
            {value: 5, label: 'Orientiert'},
            {value: 4, label: 'Verwirrt'},
            {value: 3, label: 'Unzusammenhängend'},
            {value: 2, label: 'Unverständlich'},
            {value: 1, label: 'Keine Antwort'}
          ],
          (newValue) => setGcsInput({...gcsInput, verbalResponse: newValue})
        )}
        
        {renderSelectorRow(
          'Motorische Antwort', 
          gcsInput.motorResponse, 
          [
            {value: 6, label: 'Befolgt Aufforderungen'},
            {value: 5, label: 'Gezielte Schmerzabwehr'},
            {value: 4, label: 'Ungezielte Schmerzabwehr'},
            {value: 3, label: 'Beugesynergismen'},
            {value: 2, label: 'Strecksynergismen'},
            {value: 1, label: 'Keine Reaktion'}
          ],
          (newValue) => setGcsInput({...gcsInput, motorResponse: newValue})
        )}
        
        <TouchableOpacity
          style={formStyles.button}
          onPress={calculateGCS}
        >
          <Icon name="calculator-outline" size={20} color="#ffffff" />
          <Text style={formStyles.buttonText}>Bewerten</Text>
        </TouchableOpacity>
        
        {gcsResult !== null && (
          <View style={formStyles.resultContainer}>
            <Icon name="brain-outline" size={30} color={colors.primary} style={formStyles.resultIcon} />
            <Text style={formStyles.resultLabel}>GCS-Wert:</Text>
            <Text style={formStyles.resultText}>{gcsResult.total} Punkte</Text>
            <View style={{
              marginTop: 8,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: 
                gcsResult.total >= 13 ? 'rgba(76, 175, 80, 0.2)' : 
                gcsResult.total >= 9 ? 'rgba(255, 152, 0, 0.2)' : 
                'rgba(244, 67, 54, 0.2)',
            }}>
              <Text style={{
                color: 
                  gcsResult.total >= 13 ? '#4caf50' : 
                  gcsResult.total >= 9 ? '#ff9800' : 
                  '#f44336',
                fontWeight: 'bold',
              }}>
                {gcsResult.severity}
              </Text>
            </View>
            <Text style={formStyles.resultDetails}>
              Augen: {gcsInput.eyeResponse}, Verbal: {gcsInput.verbalResponse}, Motorisch: {gcsInput.motorResponse}
            </Text>
            <Text style={[formStyles.resultDetails, { color: '#888', marginTop: 8 }]}>Hinweis: Dieses Ergebnis dient ausschließlich zu Lern- und Informationszwecken und ist nicht zur Anwendung am Patienten bestimmt.</Text>
          </View>
        )}
      </View>
    );
  };

  // Rendere den aktiven Rechner
  const renderActiveCalculator = () => {
    switch(activeCalculator) {
      case CalculatorType.DRIP_RATE:
        return renderDripRateCalculator();
      case CalculatorType.ML_PER_HOUR:
        return renderMlPerHourCalculator();
      case CalculatorType.MG_KG_MIN:
        return renderMgKgMinCalculator();
      case CalculatorType.CONCENTRATION:
        return renderConcentrationCalculator();
      case CalculatorType.INSULIN:
        return renderInsulinCalculator();
      case CalculatorType.GCS:
        return renderGCSCalculator();
      default:
        return null;
    }
  };

  // Render-Funktion für die Historie mit verbessertem Layout
  const renderHistory = () => {
    if (calculationHistory.length === 0) {
      return null;
    }
    
    return (
      <View style={formStyles.historyContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
          <Icon name="time-outline" size={22} color={colors.primary} style={{marginRight: 8}} />
          <Text style={formStyles.historyTitle}>Letzte Berechnungen</Text>
        </View>
        
        {calculationHistory.map((item, index) => {
          let resultText = '';
          let inputText = '';
          let iconName = 'calculator-outline';
          
          switch(item.type) {
            case CalculatorType.DRIP_RATE:
              resultText = `${item.result} Tropfen/min`;
              inputText = `${item.input.volume} ml, ${item.input.duration} min, ${item.input.dropFactor} Tropfen/ml`;
              iconName = 'water-outline';
              break;
            case CalculatorType.ML_PER_HOUR:
              resultText = `${item.result} ml/h`;
              inputText = `${item.input.volume} ml, ${item.input.duration} h`;
              iconName = 'time-outline';
              break;
            case CalculatorType.MG_KG_MIN:
              resultText = `${item.result} ml/h`;
              inputText = `${item.input.weight} kg, ${item.input.targetDose} mg/kg/min, ${item.input.concentration} mg/ml`;
              iconName = 'calculator-outline';
              break;
            case `${CalculatorType.CONCENTRATION} (A)`:
              resultText = `${item.result} mg`;
              inputText = `${item.input.ml} ml, ${item.input.concentration} mg/ml`;
              iconName = 'flask-outline';
              break;
            case `${CalculatorType.CONCENTRATION} (B)`:
              resultText = `${item.result.toFixed(2)} ml`;
              inputText = `${item.input.mg} mg, ${item.input.concentration} mg/ml`;
              iconName = 'flask-outline';
              break;
            case CalculatorType.INSULIN:
              resultText = `${item.result.totalDose} IE`;
              inputText = `BZ: ${item.input.currentBG} mg/dl, KH: ${item.input.carbIntake || 0}g, Profil: ${item.input.profileLabel}`;
              iconName = 'fitness-outline';
              break;
            case CalculatorType.GCS:
              resultText = `${item.result.total} Punkte (${item.result.severity})`;
              inputText = `Augen: ${item.input.eyeResponse}, Verbal: ${item.input.verbalResponse}, Motorisch: ${item.input.motorResponse}`;
              iconName = 'brain-outline';
              break;
          }
          
          return (
            <View key={index} style={formStyles.historyItem}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon name={iconName} size={20} color={colors.primary} style={{marginRight: 8}} />
                <Text style={[formStyles.historyItemText, {fontWeight: 'bold', flex: 1}]}>
                  {item.type}
                </Text>
                <Text style={formStyles.historyItemDate}>
                  {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </View>
              <View style={{marginLeft: 28}}>
                <Text style={[formStyles.historyItemText, {fontWeight: '500'}]}>
                  {resultText}
                </Text>
                <Text style={formStyles.historyItemText}>
                  {inputText}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView>
        <View style={{ padding: 16 }}>
          {/* Kein prominenter Warnhinweis mehr hier */}
        </View>
        {renderTabSelector()}
        {renderActiveCalculator()}
        {renderHistory()}
      </ScrollView>
    </View>
  );
};

export default MedicationCalculatorScreen; 