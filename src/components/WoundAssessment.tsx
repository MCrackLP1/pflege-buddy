import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTranslation } from 'react-i18next';

// Import Hooks
import { useSettings } from '../context/SettingsContext';
import { getDynamicStyles } from '../utils/styleUtils';
import CustomModalPicker from './CustomModalPicker';

interface WoundAssessmentOption {
  id: string;
  label?: string;
  isRiskFactor?: boolean;
  icon?: string;
  description?: string;
}

const WoundAssessment: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const { t } = useTranslation();

  // Assessment options (jetzt nur noch IDs, Texte kommen aus i18n)
  const woundEdgeOptions: WoundAssessmentOption[] = [
    { id: 'healthy', icon: 'leaf-outline', isRiskFactor: false },
    { id: 'reddened', icon: 'color-filter-outline', isRiskFactor: true },
    { id: 'undermined', icon: 'remove-circle-outline', isRiskFactor: true },
    { id: 'macerated', icon: 'water-outline', isRiskFactor: true },
  ];

  const woundBaseOptions: WoundAssessmentOption[] = [
    { id: 'necrosis', icon: 'skull-outline', isRiskFactor: true },
    { id: 'fibrin', icon: 'layers-outline', isRiskFactor: true },
    { id: 'granulation', icon: 'flower-outline', isRiskFactor: false },
    { id: 'epithelialization', icon: 'color-wand-outline', isRiskFactor: false },
  ];

  const exudateAmountOptions: WoundAssessmentOption[] = [
    { id: 'none', icon: 'remove-outline', isRiskFactor: false },
    { id: 'little', icon: 'water-outline', isRiskFactor: false },
    { id: 'medium', icon: 'water-outline', isRiskFactor: false },
    { id: 'much', icon: 'water-outline', isRiskFactor: true },
  ];

  const exudateTypeOptions: WoundAssessmentOption[] = [
    { id: 'clear', icon: 'water-outline', isRiskFactor: false },
    { id: 'purulent', icon: 'alert-circle-outline', isRiskFactor: true },
    { id: 'bloody', icon: 'blood-outline', isRiskFactor: true },
  ];

  const odorOptions: WoundAssessmentOption[] = [
    { id: 'none', icon: 'close-outline', isRiskFactor: false },
    { id: 'light', icon: 'cloud-outline', isRiskFactor: false },
    { id: 'strong', icon: 'warning-outline', isRiskFactor: true },
  ];

  const painOptions: WoundAssessmentOption[] = [
    { id: 'none', icon: 'happy-outline', isRiskFactor: false },
    { id: 'light', icon: 'alert-outline', isRiskFactor: false },
    { id: 'strong', icon: 'sad-outline', isRiskFactor: true },
  ];

  const woundSurroundingOptions: WoundAssessmentOption[] = [
    { id: 'healthy', icon: 'leaf-outline', isRiskFactor: false },
    { id: 'reddened', icon: 'color-filter-outline', isRiskFactor: true },
    { id: 'edema', icon: 'water-outline', isRiskFactor: true },
    { id: 'maceration', icon: 'water-outline', isRiskFactor: true },
  ];

  const healingProgressOptions: WoundAssessmentOption[] = [
    { id: 'improvement', icon: 'trending-up-outline', isRiskFactor: false },
    { id: 'stagnation', icon: 'pause-outline', isRiskFactor: true },
    { id: 'deterioration', icon: 'trending-down-outline', isRiskFactor: true },
  ];

  // State for selected values
  const [woundEdge, setWoundEdge] = useState(woundEdgeOptions[0].id);
  const [woundBase, setWoundBase] = useState(woundBaseOptions[0].id);
  const [exudateAmount, setExudateAmount] = useState(exudateAmountOptions[0].id);
  const [exudateType, setExudateType] = useState(exudateTypeOptions[0].id);
  const [odor, setOdor] = useState(odorOptions[0].id);
  const [pain, setPain] = useState(painOptions[0].id);
  const [woundSurrounding, setWoundSurrounding] = useState(woundSurroundingOptions[0].id);
  const [healingProgress, setHealingProgress] = useState(healingProgressOptions[0].id);

  const [showResult, setShowResult] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // State für Kopier-Feedback
  const [copied, setCopied] = useState(false);

  // Function to toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
  };

  // Function to get option label from ID
  const getLabelById = (options: WoundAssessmentOption[], id: string): string => {
    const option = options.find(option => option.id === id);
    return option && option.label ? option.label : '';
  };

  // Function to calculate risk score and generate result
  const calculateRiskAndGenerate = () => {
    setShowResult(true);

    // Optionally hide form
    if (showForm) {
      setShowForm(false);
    }
  };

  // Generate result text
  const generateResultText = (): string => {
    // Verwende den übersetzten Text mit Interpolation
    return t('wound_assessment.result_text', {
      woundEdge: t(`wound_assessment.options.wound_edge.${woundEdge}.label`).toLowerCase(),
      woundBase: t(`wound_assessment.options.wound_base.${woundBase}.label`).toLowerCase(),
      exudateAmount: t(`wound_assessment.options.exudate_amount.${exudateAmount}.label`).toLowerCase(),
      exudateType: t(`wound_assessment.options.exudate_type.${exudateType}.label`).toLowerCase(),
      odor: t(`wound_assessment.options.odor.${odor}.label`).toLowerCase(),
      pain: t(`wound_assessment.options.pain.${pain}.label`).toLowerCase(),
      woundSurrounding: t(`wound_assessment.options.wound_surrounding.${woundSurrounding}.label`).toLowerCase(),
      healingProgress: t(`wound_assessment.options.healing_progress.${healingProgress}.label`).toLowerCase(),
    });
  };

  // Calculate risk points
  const calculateRiskPoints = (): number => {
    let points = 0;

    // Check each parameter for risk factors
    const selectedOptions = [
      woundEdgeOptions.find(o => o.id === woundEdge),
      woundBaseOptions.find(o => o.id === woundBase),
      exudateAmountOptions.find(o => o.id === exudateAmount),
      exudateTypeOptions.find(o => o.id === exudateType),
      odorOptions.find(o => o.id === odor),
      painOptions.find(o => o.id === pain),
      woundSurroundingOptions.find(o => o.id === woundSurrounding),
      healingProgressOptions.find(o => o.id === healingProgress),
    ];

    // Count risk factors
    selectedOptions.forEach(option => {
      if (option && option.isRiskFactor) {
        points++;
      }
    });

    return points;
  };

  // Get risk level and color based on points
  const getRiskLevel = (): { level: string; color: string; text: string } => {
    const points = calculateRiskPoints();

    if (points <= 2) {
      return {
        level: t('wound_assessment.risk_levels.green.level'),
        color: theme === 'dark' ? '#4caf50' : '#2e7d32',
        text: t('wound_assessment.risk_levels.green.text'),
      };
    } else if (points <= 4) {
      return {
        level: t('wound_assessment.risk_levels.orange.level'),
        color: theme === 'dark' ? '#ff9800' : '#ef6c00',
        text: t('wound_assessment.risk_levels.orange.text'),
      };
    } else {
      return {
        level: t('wound_assessment.risk_levels.red.level'),
        color: theme === 'dark' ? '#f44336' : '#c62828',
        text: t('wound_assessment.risk_levels.red.text'),
      };
    }
  };

  // Get risk explanation
  const getRiskExplanation = (): string => {
    const riskFactors: string[] = [];

    // Füge Risiko-Faktoren mit übersetzten Suffixen hinzu
    if (woundEdgeOptions.find(o => o.id === woundEdge)?.isRiskFactor) {
      riskFactors.push(t(`wound_assessment.options.wound_edge.${woundEdge}.label`) + t('wound_assessment.risk_explanation_wound_edge_suffix'));
    }

    if (woundBaseOptions.find(o => o.id === woundBase)?.isRiskFactor) {
      riskFactors.push(t(`wound_assessment.options.wound_base.${woundBase}.label`) + t('wound_assessment.risk_explanation_wound_base_suffix'));
    }

    if (exudateAmountOptions.find(o => o.id === exudateAmount)?.isRiskFactor) {
      riskFactors.push(t(`wound_assessment.options.exudate_amount.${exudateAmount}.label`) + t('wound_assessment.risk_explanation_exudate_amount_suffix'));
    }

    if (exudateTypeOptions.find(o => o.id === exudateType)?.isRiskFactor) {
      riskFactors.push(t(`wound_assessment.options.exudate_type.${exudateType}.label`) + t('wound_assessment.risk_explanation_exudate_type_suffix'));
    }

    if (odorOptions.find(o => o.id === odor)?.isRiskFactor) {
      riskFactors.push(t(`wound_assessment.options.odor.${odor}.label`));
    }

    if (painOptions.find(o => o.id === pain)?.isRiskFactor) {
      riskFactors.push(t(`wound_assessment.options.pain.${pain}.label`));
    }

    if (woundSurroundingOptions.find(o => o.id === woundSurrounding)?.isRiskFactor) {
      riskFactors.push(
        t(`wound_assessment.options.wound_surrounding.${woundSurrounding}.label`) + t('wound_assessment.risk_explanation_wound_surrounding_suffix')
      );
    }

    if (healingProgressOptions.find(o => o.id === healingProgress)?.isRiskFactor) {
      riskFactors.push(
        t(`wound_assessment.options.healing_progress.${healingProgress}.label`) + t('wound_assessment.risk_explanation_healing_progress_suffix')
      );
    }

    if (riskFactors.length > 0) {
      return t('wound_assessment.risk_explanation_prefix') + riskFactors.join(', ');
    } else {
      return t('wound_assessment.risk_explanation_fallback');
    }
  };

  // Hilfsfunktion für Picker-Items mit Übersetzung
  const getPickerItems = (options: WoundAssessmentOption[], optionType: string) =>
    options.map(opt => ({
      id: opt.id,
      icon: opt.icon,
      label: t(`wound_assessment.options.${optionType}.${opt.id}.label`),
      description: t(`wound_assessment.options.${optionType}.${opt.id}.description`),
    }));

  const bgColor = theme === 'dark' ? styles.card.backgroundColor : styles.card.backgroundColor;
  const borderColor = theme === 'dark' ? '#444' : '#ccc';

  // Funktion zum Kopieren des Fließtexts
  const handleCopyResultText = () => {
    Clipboard.setString(generateResultText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <ScrollView style={[styles.container, localStyles.container]}>
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={[styles.headerTitle, localStyles.title]}>{t('wound_assessment.title')}</Text>

        {showForm && (
          <View style={localStyles.formContainer}>
            <CustomModalPicker
              label={t('wound_edge')}
              items={getPickerItems(woundEdgeOptions, 'wound_edge')}
              selectedValue={woundEdge}
              onValueChange={itemValue => setWoundEdge(itemValue)}
              theme={theme}
              fontSize={baseFontSize * fontSizeScale}
            />

            <CustomModalPicker
              label={t('wound_base')}
              items={getPickerItems(woundBaseOptions, 'wound_base')}
              selectedValue={woundBase}
              onValueChange={itemValue => setWoundBase(itemValue)}
              theme={theme}
              fontSize={baseFontSize * fontSizeScale}
            />

            <CustomModalPicker
              label={t('exudate_amount')}
              items={getPickerItems(exudateAmountOptions, 'exudate_amount')}
              selectedValue={exudateAmount}
              onValueChange={itemValue => setExudateAmount(itemValue)}
              theme={theme}
              fontSize={baseFontSize * fontSizeScale}
            />

            <CustomModalPicker
              label={t('exudate_type')}
              items={getPickerItems(exudateTypeOptions, 'exudate_type')}
              selectedValue={exudateType}
              onValueChange={itemValue => setExudateType(itemValue)}
              theme={theme}
              fontSize={baseFontSize * fontSizeScale}
            />

            <CustomModalPicker
              label={t('odor')}
              items={getPickerItems(odorOptions, 'odor')}
              selectedValue={odor}
              onValueChange={itemValue => setOdor(itemValue)}
              theme={theme}
              fontSize={baseFontSize * fontSizeScale}
            />

            <CustomModalPicker
              label={t('pain')}
              items={getPickerItems(painOptions, 'pain')}
              selectedValue={pain}
              onValueChange={itemValue => setPain(itemValue)}
              theme={theme}
              fontSize={baseFontSize * fontSizeScale}
            />

            <CustomModalPicker
              label={t('wound_assessment.fields.wound_surrounding')}
              items={getPickerItems(woundSurroundingOptions, 'wound_surrounding')}
              selectedValue={woundSurrounding}
              onValueChange={itemValue => setWoundSurrounding(itemValue)}
              theme={theme}
              fontSize={baseFontSize * fontSizeScale}
            />

            <CustomModalPicker
              label={t('wound_assessment.fields.healing_progress')}
              items={getPickerItems(healingProgressOptions, 'healing_progress')}
              selectedValue={healingProgress}
              onValueChange={itemValue => setHealingProgress(itemValue)}
              theme={theme}
              fontSize={baseFontSize * fontSizeScale}
            />
          </View>
        )}

        {!showResult ? (
          <TouchableOpacity
            style={[styles.button, localStyles.button, { backgroundColor: '#32b8ca' }]}
            onPress={calculateRiskAndGenerate}
          >
            <Text style={styles.buttonText}>{t('wound_assessment.show_assessment_button')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={localStyles.resultContainer}>
            <TouchableOpacity
              style={[
                localStyles.formToggle,
                {
                  borderColor: borderColor,
                },
              ]}
              onPress={toggleForm}
            >
              <Icon
                name={showForm ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={22}
                color={theme === 'dark' ? '#e1e1e1' : '#333333'}
              />
              <Text style={[styles.itemTitle, localStyles.toggleText]}>
                {showForm ? t('collapse_form') : t('expand_form')}
              </Text>
            </TouchableOpacity>

            <View
              style={[
                localStyles.resultTextContainer,
                {
                  backgroundColor:
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.itemTitle, localStyles.resultTitle]} selectable={true}>
                  {t('wound_assessment.title')}
                </Text>
                <TouchableOpacity
                  onPress={handleCopyResultText}
                  style={{ marginLeft: 8, padding: 4 }}
                >
                  <Icon
                    name={copied ? 'checkmark-done-outline' : 'copy-outline'}
                    size={22}
                    color={copied ? '#4caf50' : theme === 'dark' ? '#e1e1e1' : '#333'}
                  />
                </TouchableOpacity>
                {copied && (
                  <Text style={{ marginLeft: 6, color: '#4caf50', fontSize: 13 }}>{t('copied')}</Text>
                )}
              </View>
              <Text style={[styles.itemSubtitle, localStyles.resultText]} selectable={true}>
                {generateResultText()}
              </Text>
            </View>

            <View style={localStyles.riskContainer}>
              <View style={[localStyles.riskIndicator, { backgroundColor: getRiskLevel().color }]}>
                <Text style={localStyles.riskLevel}>{getRiskLevel().level}</Text>
                <Text style={localStyles.riskText}>{getRiskLevel().text}</Text>
              </View>

              <Text style={[styles.itemSubtitle, localStyles.riskExplanation]} selectable={true}>
                {getRiskExplanation()}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, localStyles.resetButton, { backgroundColor: '#32b8ca' }]}
              onPress={() => {
                setShowResult(false);
                setShowForm(true);
              }}
            >
              <Text style={styles.buttonText}>{t('wound_assessment.new_assessment_button')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
  },
  formContainer: {
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    marginBottom: 4,
  },
  pickerWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        borderWidth: 1,
      },
      android: {
        borderWidth: 1,
      },
    }),
  },
  picker: {
    ...Platform.select({
      android: {
        paddingHorizontal: 8,
        height: 50,
      },
      ios: {
        height: 150,
      },
    }),
  },
  button: {
    marginTop: 8,
  },
  resultContainer: {
    marginTop: 16,
  },
  formToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  toggleText: {
    marginLeft: 8,
  },
  resultTextContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultTitle: {
    marginBottom: 8,
  },
  resultText: {
    lineHeight: 22,
  },
  riskContainer: {
    marginBottom: 16,
  },
  riskIndicator: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  riskLevel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  riskText: {
    color: '#fff',
    fontSize: 16,
  },
  riskExplanation: {
    paddingHorizontal: 8,
    lineHeight: 20,
  },
  resetButton: {
    marginTop: 8,
  },
});

export default WoundAssessment;
