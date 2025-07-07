/**
 * NutritionCalculatorScreen.tsx
 * Berechnet BMI, Energiebedarf und Nährstoffverteilung
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Import Typen
import { RootStackParamList } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

type NutritionCalculatorNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Interface für die Nutzerdaten
interface UserData {
  height: string; // in cm
  weight: string; // in kg
  age: string;
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
}

// Aktivitätslevel-Typ
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

// Interface für die Berechnungsergebnisse
interface CalculationResults {
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  macros: {
    protein: { grams: number; calories: number; percentage: number };
    carbs: { grams: number; calories: number; percentage: number };
    fat: { grams: number; calories: number; percentage: number };
  };
}

// Aktivitätslevel mit Beschreibungen und Faktoren als Funktion für Übersetzungen
const getActivityLevels = (t: any) => [
  {
    id: 'sedentary' as ActivityLevel,
    label: t('sedentary_inactive'),
    description: t('sedentary_description'),
    factor: 1.2,
  },
  {
    id: 'light' as ActivityLevel,
    label: t('light_active'),
    description: t('light_active_description'),
    factor: 1.375,
  },
  {
    id: 'moderate' as ActivityLevel,
    label: t('moderately_active'),
    description: t('moderately_active_description'),
    factor: 1.55,
  },
  {
    id: 'active' as ActivityLevel,
    label: t('very_active'),
    description: t('very_active_description'),
    factor: 1.725,
  },
  {
    id: 'veryActive' as ActivityLevel,
    label: t('extremely_active'),
    description: t('extremely_active_description'),
    factor: 1.9,
  },
];

/**
 * NutritionCalculatorScreen Component
 *
 * A screen component that calculates nutritional requirements based on user input
 * including BMI, daily caloric needs, and macronutrient distribution.
 *
 * @component
 * @returns {React.FC} NutritionCalculatorScreen component
 */
const NutritionCalculatorScreen: React.FC = () => {
  const navigation = useNavigation<NutritionCalculatorNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const { t } = useTranslation();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();

  // States
  const [userData, setUserData] = useState<UserData>({
    height: '',
    weight: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
  });

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showErrors, setShowErrors] = useState(false);

  // Berechnung bei Änderung der Eingabewerte
  const handleCalculate = () => {
    setShowErrors(true);
    if (isFormValid()) {
      calculateResults();
    } else {
      setResults(null);
    }
  };

  // Formularvalidierung
  const isFormValid = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!userData.height || isNaN(Number(userData.height)) || Number(userData.height) <= 0) {
      newErrors.height = t('enter_valid_height');
      isValid = false;
    }

    if (!userData.weight || isNaN(Number(userData.weight)) || Number(userData.weight) <= 0) {
      newErrors.weight = t('enter_valid_weight');
      isValid = false;
    }

    if (!userData.age || isNaN(Number(userData.age)) || Number(userData.age) <= 0) {
      newErrors.age = t('enter_valid_age');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Aktualisiere Benutzerdaten
  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Calculates nutritional results including BMI, daily caloric needs, and macronutrient distribution
   *
   * @private
   * @function calculateResults
   * @returns {void}
   */
  const calculateResults = () => {
    const height = Number(userData.height) / 100; // cm zu m umrechnen
    const weight = Number(userData.weight);
    const age = Number(userData.age);
    // Get activity levels with translations
    const ACTIVITY_LEVELS = getActivityLevels(t);
    const activityFactor =
      ACTIVITY_LEVELS.find(level => level.id === userData.activityLevel)?.factor || 1.55;

    // BMI berechnen
    const bmi = weight / (height * height);

    // BMI-Kategorie bestimmen
    let bmiCategory = '';
    if (bmi < 16) bmiCategory = t('severe_underweight');
    else if (bmi < 17) bmiCategory = t('moderate_underweight');
    else if (bmi < 18.5) bmiCategory = t('mild_underweight');
    else if (bmi < 25) bmiCategory = t('normal_weight');
    else if (bmi < 30) bmiCategory = t('pre_obesity');
    else if (bmi < 35) bmiCategory = t('obesity_class_1');
    else if (bmi < 40) bmiCategory = t('obesity_class_2');
    else bmiCategory = t('obesity_class_3');

    // Grundumsatz berechnen (Harris-Benedict-Formel)
    let bmr = 0;
    if (userData.gender === 'male') {
      bmr = 66.47 + 13.7 * weight + 5 * (height * 100) - 6.8 * age;
    } else {
      bmr = 655.1 + 9.6 * weight + 1.8 * (height * 100) - 4.7 * age;
    }

    // Gesamtenergiebedarf berechnen
    const dailyCalories = Math.round(bmr * activityFactor);

    // Makronährstoffe berechnen (standardmäßige Verteilung)
    const proteinPercentage = 20; // 20% Protein
    const fatPercentage = 30; // 30% Fett
    const carbsPercentage = 50; // 50% Kohlenhydrate

    const proteinCalories = dailyCalories * (proteinPercentage / 100);
    const fatCalories = dailyCalories * (fatPercentage / 100);
    const carbsCalories = dailyCalories * (carbsPercentage / 100);

    // Umrechnung in Gramm
    const proteinGrams = Math.round(proteinCalories / 4); // 1g Protein = 4 kcal
    const fatGrams = Math.round(fatCalories / 9); // 1g Fett = 9 kcal
    const carbsGrams = Math.round(carbsCalories / 4); // 1g KH = 4 kcal

    setResults({
      bmi: Math.round(bmi * 10) / 10, // Auf eine Nachkommastelle runden
      bmiCategory,
      dailyCalories,
      macros: {
        protein: {
          grams: proteinGrams,
          calories: Math.round(proteinCalories),
          percentage: proteinPercentage,
        },
        carbs: {
          grams: carbsGrams,
          calories: Math.round(carbsCalories),
          percentage: carbsPercentage,
        },
        fat: { grams: fatGrams, calories: Math.round(fatCalories), percentage: fatPercentage },
      },
    });
  };

  /**
   * Formats a number with thousand separators
   *
   * @private
   * @function formatNumber
   * @param {number} num - The number to format
   * @returns {string} Formatted number string
   */
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Farbdefinitionen
  const colors = {
    primary: '#32b8ca',
    primaryLight: theme === 'dark' ? 'rgba(50, 184, 202, 0.15)' : 'rgba(50, 184, 202, 0.1)',
    background: theme === 'dark' ? '#121212' : '#ffffff',
    card: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    border: theme === 'dark' ? '#333333' : '#eeeeee',
    text: theme === 'dark' ? '#ffffff' : '#333333',
    textSecondary: theme === 'dark' ? '#aaaaaa' : '#666666',
    error: '#ff5252',
    protein: '#4caf50',
    carbs: '#2196f3',
    fat: '#ff9800',
    inputBackground: theme === 'dark' ? '#2a2a2a' : '#f7f7f7',
  };

  // Inline Styles
  const formStyles = StyleSheet.create({
    formContainer: {
      marginTop: 8,
      marginBottom: 24,
    },
    inputRow: {
      marginBottom: 24,
    },
    label: {
      fontSize: baseFontSize * fontSizeScale,
      fontWeight: '500',
      marginBottom: 8,
      color: colors.text,
      letterSpacing: 0.2,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      fontSize: baseFontSize * fontSizeScale,
      color: colors.text,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme === 'dark' ? 0.2 : 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    errorText: {
      color: colors.error,
      fontSize: baseFontSize * fontSizeScale * 0.8,
      marginTop: 6,
      marginLeft: 4,
    },
    genderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    genderOption: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme === 'dark' ? 0.2 : 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    genderText: {
      fontWeight: '500',
      fontSize: baseFontSize * fontSizeScale,
      marginTop: 6,
    },
    activityOption: {
      flexDirection: 'row',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme === 'dark' ? 0.2 : 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    activityTextContainer: {
      marginLeft: 16,
      flex: 1,
    },
    activityTitle: {
      fontWeight: '500',
      fontSize: baseFontSize * fontSizeScale,
    },
    activityDescription: {
      fontSize: baseFontSize * fontSizeScale * 0.8,
      color: colors.textSecondary,
      marginTop: 4,
    },
    resultContainer: {
      marginTop: 32,
      paddingBottom: 40,
    },
    resultSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: baseFontSize * fontSizeScale * 1.1,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: 0.3,
    },
    resultCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    resultLabel: {
      fontSize: baseFontSize * fontSizeScale,
      color: colors.textSecondary,
    },
    resultValue: {
      fontSize: baseFontSize * fontSizeScale * 1.1,
      fontWeight: '600',
      color: colors.text,
    },
    resultEmphasis: {
      fontSize: baseFontSize * fontSizeScale * 1.4,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
      marginVertical: 12,
    },
    macroBar: {
      height: 30,
      flexDirection: 'row',
      borderRadius: 8,
      overflow: 'hidden',
      marginVertical: 16,
    },
    macroBarSection: {
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    macroLabel: {
      color: '#ffffff',
      fontSize: baseFontSize * fontSizeScale * 0.8,
      fontWeight: '600',
    },
    macroDetails: {
      marginTop: 16,
    },
    macroRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    macroName: {
      fontSize: baseFontSize * fontSizeScale,
      fontWeight: '500',
      width: '25%',
    },
    macroValue: {
      fontSize: baseFontSize * fontSizeScale,
      color: colors.text,
      width: '25%',
      textAlign: 'right',
    },
    disclaimer: {
      fontSize: baseFontSize * fontSizeScale * 0.8,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 24,
      lineHeight: baseFontSize * fontSizeScale * 1.2,
      paddingHorizontal: 16,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: baseFontSize * fontSizeScale,
      fontWeight: '600',
      color: '#ffffff',
    },
  });

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom, backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={formStyles.formContainer}>
          {/* Größe */}
          <View style={formStyles.inputRow}>
            <Text style={formStyles.label}>{t('height_cm')}</Text>
            <TextInput
              style={formStyles.input}
                              placeholder={t('height_cm_placeholder')}
              placeholderTextColor={colors.textSecondary}
              value={userData.height}
              onChangeText={value => handleInputChange('height', value)}
              keyboardType="numeric"
            />
            {showErrors && errors.height && (
              <Text style={formStyles.errorText}>{errors.height}</Text>
            )}
          </View>

          {/* Gewicht */}
          <View style={formStyles.inputRow}>
            <Text style={formStyles.label}>{t('weight_kg')}</Text>
            <TextInput
              style={formStyles.input}
                              placeholder={t('weight_kg_placeholder')}
              placeholderTextColor={colors.textSecondary}
              value={userData.weight}
              onChangeText={value => handleInputChange('weight', value)}
              keyboardType="numeric"
            />
            {showErrors && errors.weight && (
              <Text style={formStyles.errorText}>{errors.weight}</Text>
            )}
          </View>

          {/* Alter */}
          <View style={formStyles.inputRow}>
            <Text style={formStyles.label}>{t('age')}</Text>
            <TextInput
              style={formStyles.input}
                              placeholder={t('age_placeholder')}
              placeholderTextColor={colors.textSecondary}
              value={userData.age}
              onChangeText={value => handleInputChange('age', value)}
              keyboardType="numeric"
            />
            {showErrors && errors.age && <Text style={formStyles.errorText}>{errors.age}</Text>}
          </View>

          {/* Geschlecht */}
          <View style={formStyles.inputRow}>
            <Text style={formStyles.label}>{t('gender')}</Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              {[
                { id: 'male', label: t('male'), icon: 'male-outline' },
                { id: 'female', label: t('female'), icon: 'female-outline' },
              ].map(option => {
                const isActive = userData.gender === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      formStyles.genderOption,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        marginHorizontal: 6,
                        marginBottom: 10,
                        backgroundColor: isActive ? colors.primary : colors.inputBackground,
                        borderColor: isActive ? colors.primary : colors.border,
                        shadowColor: isActive ? colors.primary : 'transparent',
                        shadowOpacity: isActive ? 0.18 : 0,
                        shadowRadius: isActive ? 6 : 0,
                        elevation: isActive ? 4 : 0,
                      },
                    ]}
                    onPress={() =>
                      setUserData({ ...userData, gender: option.id as 'male' | 'female' })
                    }
                    activeOpacity={0.85}
                  >
                    <Icon
                      name={option.icon}
                      size={26}
                      color={isActive ? '#fff' : colors.primary}
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={[
                        formStyles.genderText,
                        {
                          color: isActive ? '#fff' : colors.text,
                          fontWeight: isActive ? 'bold' : '500',
                          fontSize: baseFontSize * fontSizeScale * 1.0,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Aktivitätslevel */}
          <View style={formStyles.inputRow}>
            <Text style={formStyles.label}>{t('activity_level')}</Text>
            {getActivityLevels(t).map(level => (
              <TouchableOpacity
                key={level.id}
                style={[
                  formStyles.activityOption,
                  {
                    backgroundColor:
                      userData.activityLevel === level.id
                        ? colors.primaryLight
                        : colors.inputBackground,
                    borderColor:
                      userData.activityLevel === level.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setUserData({ ...userData, activityLevel: level.id })}
              >
                <Icon
                  name={
                    userData.activityLevel === level.id ? 'checkmark-circle' : 'ellipse-outline'
                  }
                  size={22}
                  color={
                    userData.activityLevel === level.id ? colors.primary : colors.textSecondary
                  }
                />
                <View style={formStyles.activityTextContainer}>
                  <Text
                    style={[
                      formStyles.activityTitle,
                      { color: userData.activityLevel === level.id ? colors.primary : colors.text },
                    ]}
                  >
                    {level.label}
                  </Text>
                  <Text style={formStyles.activityDescription}>{level.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Berechnen-Button */}
          <TouchableOpacity
            style={[formStyles.button, { marginTop: 8, marginBottom: 16 }]}
            onPress={handleCalculate}
          >
            <Text style={formStyles.buttonText}>{t('calculate')}</Text>
          </TouchableOpacity>
        </View>

        {/* Ergebnisse */}
        {results && showErrors && Object.keys(errors).length === 0 && (
          <View style={formStyles.resultContainer}>
            {/* BMI */}
            <View style={formStyles.resultSection}>
              <Text style={formStyles.sectionTitle}>{t('body_mass_index_bmi')}</Text>
              <View style={formStyles.resultCard}>
                <Text style={formStyles.resultEmphasis}>{results.bmi}</Text>
                <View style={formStyles.resultRow}>
                  <Text style={formStyles.resultLabel}>{t('category')}</Text>
                  <Text style={formStyles.resultValue}>{results.bmiCategory}</Text>
                </View>
              </View>
            </View>

            {/* Kalorienbedarf */}
            <View style={formStyles.resultSection}>
              <Text style={formStyles.sectionTitle}>{t('daily_energy_requirement')}</Text>
              <View style={formStyles.resultCard}>
                <Text style={formStyles.resultEmphasis}>
                  {formatNumber(results.dailyCalories)} kcal
                </Text>
              </View>
            </View>

            {/* Makronährstoffe */}
            <View style={formStyles.resultSection}>
              <Text style={formStyles.sectionTitle}>{t('nutrient_distribution')}</Text>
              <View style={formStyles.resultCard}>
                {/* Makronährstoffbalken */}
                <View style={formStyles.macroBar}>
                  <View
                    style={[
                      formStyles.macroBarSection,
                      {
                        width: `${results.macros.protein.percentage}%`,
                        backgroundColor: colors.protein,
                      },
                    ]}
                  >
                    <Text style={formStyles.macroLabel}>{t('protein_short')}</Text>
                  </View>
                  <View
                    style={[
                      formStyles.macroBarSection,
                      {
                        width: `${results.macros.carbs.percentage}%`,
                        backgroundColor: colors.carbs,
                      },
                    ]}
                  >
                    <Text style={formStyles.macroLabel}>{t('carbs_short')}</Text>
                  </View>
                  <View
                    style={[
                      formStyles.macroBarSection,
                      {
                        width: `${results.macros.fat.percentage}%`,
                        backgroundColor: colors.fat,
                      },
                    ]}
                  >
                    <Text style={formStyles.macroLabel}>{t('fat_short')}</Text>
                  </View>
                </View>

                <View style={formStyles.macroDetails}>
                  {/* Tabellenkopf */}
                  <View style={[formStyles.macroRow, { borderBottomWidth: 2 }]}>
                    <Text style={[formStyles.macroName, { color: colors.textSecondary }]}>
                      {t('nutrient')}
                    </Text>
                    <Text style={[formStyles.macroValue, { color: colors.textSecondary }]}>
                      {t('grams')}
                    </Text>
                    <Text style={[formStyles.macroValue, { color: colors.textSecondary }]}>
                      {t('calories')}
                    </Text>
                    <Text style={[formStyles.macroValue, { color: colors.textSecondary }]}>
                      {t('proportion')}
                    </Text>
                  </View>

                  {/* Protein */}
                  <View style={formStyles.macroRow}>
                    <Text style={[formStyles.macroName, { color: colors.protein }]}>{t('protein')}</Text>
                    <Text style={formStyles.macroValue}>{results.macros.protein.grams}g</Text>
                    <Text style={formStyles.macroValue}>
                      {formatNumber(results.macros.protein.calories)}
                    </Text>
                    <Text style={formStyles.macroValue}>{results.macros.protein.percentage}%</Text>
                  </View>

                  {/* Kohlenhydrate */}
                  <View style={formStyles.macroRow}>
                    <Text style={[formStyles.macroName, { color: colors.carbs }]}>{t('carbohydrates')}</Text>
                    <Text style={formStyles.macroValue}>{results.macros.carbs.grams}g</Text>
                    <Text style={formStyles.macroValue}>
                      {formatNumber(results.macros.carbs.calories)}
                    </Text>
                    <Text style={formStyles.macroValue}>{results.macros.carbs.percentage}%</Text>
                  </View>

                  {/* Fette */}
                  <View style={[formStyles.macroRow, { borderBottomWidth: 0 }]}>
                    <Text style={[formStyles.macroName, { color: colors.fat }]}>{t('fat')}</Text>
                    <Text style={formStyles.macroValue}>{results.macros.fat.grams}g</Text>
                    <Text style={formStyles.macroValue}>
                      {formatNumber(results.macros.fat.calories)}
                    </Text>
                    <Text style={formStyles.macroValue}>{results.macros.fat.percentage}%</Text>
                  </View>
                </View>
              </View>
            </View>

            <Text style={formStyles.disclaimer}>
              {t('nutrition_disclaimer')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NutritionCalculatorScreen;
