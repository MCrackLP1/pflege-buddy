import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';

// Import Hooks
import { useSettings } from '../context/SettingsContext';
import { getDynamicStyles } from '../utils/styleUtils';
import CustomModalPicker from './CustomModalPicker';

interface WoundAssessmentOption {
  id: string;
  label: string;
  isRiskFactor?: boolean;
  icon?: string;
  description?: string;
}

const WoundAssessment: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  
  // Assessment options
  const woundEdgeOptions: WoundAssessmentOption[] = [
    { id: 'healthy', label: 'Gesund', icon: 'leaf-outline', description: 'Unauffälliger, gesunder Wundrand' },
    { id: 'reddened', label: 'Gerötet', icon: 'color-filter-outline', description: 'Rötung als Entzündungszeichen' , isRiskFactor: true },
    { id: 'undermined', label: 'Unterminiert', icon: 'remove-circle-outline', description: 'Unterminierung des Wundrandes', isRiskFactor: true },
    { id: 'macerated', label: 'Mazeriert', icon: 'water-outline', description: 'Aufgeweichter, weißlicher Wundrand', isRiskFactor: true },
  ];

  const woundBaseOptions: WoundAssessmentOption[] = [
    { id: 'necrosis', label: 'Nekrose', icon: 'skull-outline', description: 'Abgestorbenes Gewebe', isRiskFactor: true },
    { id: 'fibrin', label: 'Fibrinbelag', icon: 'layers-outline', description: 'Gelblich-weißer Belag', isRiskFactor: true },
    { id: 'granulation', label: 'Granulation', icon: 'flower-outline', description: 'Rötlich, gut durchblutet' },
    { id: 'epithelialization', label: 'Epithelisierung', icon: 'color-wand-outline', description: 'Neubildung der Haut' },
  ];

  const exudateAmountOptions: WoundAssessmentOption[] = [
    { id: 'none', label: 'Kein', icon: 'remove-outline', description: 'Kein Exsudat sichtbar' },
    { id: 'little', label: 'Wenig', icon: 'water-outline', description: 'Geringe Flüssigkeitsmenge' },
    { id: 'medium', label: 'Mittel', icon: 'water-outline', description: 'Mäßige Flüssigkeitsmenge' },
    { id: 'much', label: 'Viel', icon: 'water-outline', description: 'Starke Exsudation', isRiskFactor: true },
  ];

  const exudateTypeOptions: WoundAssessmentOption[] = [
    { id: 'clear', label: 'Klar', icon: 'water-outline', description: 'Klares, seröses Exsudat' },
    { id: 'purulent', label: 'Eitrig', icon: 'alert-circle-outline', description: 'Gelblich, trüb, eitrig', isRiskFactor: true },
    { id: 'bloody', label: 'Blutig', icon: 'blood-outline', description: 'Rötlich, blutiges Exsudat', isRiskFactor: true },
  ];

  const odorOptions: WoundAssessmentOption[] = [
    { id: 'none', label: 'Kein Geruch', icon: 'close-outline', description: 'Kein auffälliger Geruch' },
    { id: 'light', label: 'Leichter Geruch', icon: 'cloud-outline', description: 'Leicht wahrnehmbar' },
    { id: 'strong', label: 'Starker Geruch', icon: 'warning-outline', description: 'Deutlich wahrnehmbar', isRiskFactor: true },
  ];

  const painOptions: WoundAssessmentOption[] = [
    { id: 'none', label: 'Kein Schmerz', icon: 'happy-outline', description: 'Keine Schmerzen' },
    { id: 'light', label: 'Leichter Schmerz', icon: 'alert-outline', description: 'Leichte Schmerzen' },
    { id: 'strong', label: 'Starker Schmerz', icon: 'sad-outline', description: 'Starke Schmerzen', isRiskFactor: true },
  ];

  const woundSurroundingOptions: WoundAssessmentOption[] = [
    { id: 'healthy', label: 'Gesund', icon: 'leaf-outline', description: 'Unauffällige Umgebung' },
    { id: 'reddened', label: 'Rötung', icon: 'color-filter-outline', description: 'Rötung der Umgebung', isRiskFactor: true },
    { id: 'edema', label: 'Ödem', icon: 'water-outline', description: 'Schwellung/Ödem', isRiskFactor: true },
    { id: 'maceration', label: 'Mazeration', icon: 'water-outline', description: 'Aufgeweichte Umgebung', isRiskFactor: true },
  ];

  const healingProgressOptions: WoundAssessmentOption[] = [
    { id: 'improvement', label: 'Verbesserung', icon: 'trending-up-outline', description: 'Heilung schreitet voran' },
    { id: 'stagnation', label: 'Stagnation', icon: 'pause-outline', description: 'Keine Veränderung' },
    { id: 'deterioration', label: 'Verschlechterung', icon: 'trending-down-outline', description: 'Zustand verschlechtert sich', isRiskFactor: true },
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
    return option ? option.label : '';
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
    return `Die Wunde zeigt einen ${getLabelById(woundEdgeOptions, woundEdge).toLowerCase()} Wundrand, der Wundgrund ist von ${getLabelById(woundBaseOptions, woundBase).toLowerCase()} geprägt. Es ist ${getLabelById(exudateAmountOptions, exudateAmount).toLowerCase()} ${getLabelById(exudateTypeOptions, exudateType).toLowerCase()}es Exsudat vorhanden. Es besteht ${getLabelById(odorOptions, odor).toLowerCase()} und ${getLabelById(painOptions, pain).toLowerCase()}. Die Wundumgebung ist ${getLabelById(woundSurroundingOptions, woundSurrounding).toLowerCase()} und der Heilungsverlauf zeigt eine ${getLabelById(healingProgressOptions, healingProgress).toLowerCase()}.`;
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
        level: 'Grün', 
        color: theme === 'dark' ? '#4caf50' : '#2e7d32', 
        text: 'Normale Heilung' 
      };
    } else if (points <= 4) {
      return { 
        level: 'Orange', 
        color: theme === 'dark' ? '#ff9800' : '#ef6c00', 
        text: 'Beobachtung empfohlen' 
      };
    } else {
      return { 
        level: 'Rot', 
        color: theme === 'dark' ? '#f44336' : '#c62828', 
        text: 'Arztkontakt dringend empfohlen' 
      };
    }
  };

  // Get risk explanation
  const getRiskExplanation = (): string => {
    const riskFactors: string[] = [];
    
    if (woundEdgeOptions.find(o => o.id === woundEdge)?.isRiskFactor) {
      riskFactors.push(getLabelById(woundEdgeOptions, woundEdge) + 'er Wundrand');
    }
    
    if (woundBaseOptions.find(o => o.id === woundBase)?.isRiskFactor) {
      riskFactors.push(getLabelById(woundBaseOptions, woundBase) + ' am Wundgrund');
    }
    
    if (exudateAmountOptions.find(o => o.id === exudateAmount)?.isRiskFactor) {
      riskFactors.push(getLabelById(exudateAmountOptions, exudateAmount) + ' Exsudat');
    }
    
    if (exudateTypeOptions.find(o => o.id === exudateType)?.isRiskFactor) {
      riskFactors.push(getLabelById(exudateTypeOptions, exudateType) + 'es Exsudat');
    }
    
    if (odorOptions.find(o => o.id === odor)?.isRiskFactor) {
      riskFactors.push(getLabelById(odorOptions, odor));
    }
    
    if (painOptions.find(o => o.id === pain)?.isRiskFactor) {
      riskFactors.push(getLabelById(painOptions, pain));
    }
    
    if (woundSurroundingOptions.find(o => o.id === woundSurrounding)?.isRiskFactor) {
      riskFactors.push(getLabelById(woundSurroundingOptions, woundSurrounding) + ' der Wundumgebung');
    }
    
    if (healingProgressOptions.find(o => o.id === healingProgress)?.isRiskFactor) {
      riskFactors.push(getLabelById(healingProgressOptions, healingProgress) + ' des Heilungsverlaufs');
    }
    
    if (riskFactors.length > 0) {
      return 'Begründung: ' + riskFactors.join(', ');
    } else {
      return 'Begründung: Arztkontakt empfohlen aufgrund der Gesamtsituation.';
    }
  };

  // Custom picker component mit Modal für Darkmode
  const CustomPicker = ({ selectedValue, onValueChange, items, label }) => (
    <CustomModalPicker
      label={label}
      items={items}
      selectedValue={selectedValue}
      onValueChange={onValueChange}
      theme={theme}
      fontSize={baseFontSize * fontSizeScale}
    />
  );
  
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
      <View style={[
        styles.card, 
        { marginTop: 16 }
      ]}>
        <Text style={[styles.headerTitle, localStyles.title]}>Wundbeurteilung</Text>
      
        {showForm && (
          <View style={localStyles.formContainer}>
            <CustomPicker
              label="Wundrand"
              selectedValue={woundEdge}
              onValueChange={(itemValue) => setWoundEdge(itemValue)}
              items={woundEdgeOptions}
            />
            
            <CustomPicker
              label="Wundgrund"
              selectedValue={woundBase}
              onValueChange={(itemValue) => setWoundBase(itemValue)}
              items={woundBaseOptions}
            />
            
            <CustomPicker
              label="Exsudatmenge"
              selectedValue={exudateAmount}
              onValueChange={(itemValue) => setExudateAmount(itemValue)}
              items={exudateAmountOptions}
            />
            
            <CustomPicker
              label="Exsudatart"
              selectedValue={exudateType}
              onValueChange={(itemValue) => setExudateType(itemValue)}
              items={exudateTypeOptions}
            />
            
            <CustomPicker
              label="Geruch"
              selectedValue={odor}
              onValueChange={(itemValue) => setOdor(itemValue)}
              items={odorOptions}
            />
            
            <CustomPicker
              label="Schmerz"
              selectedValue={pain}
              onValueChange={(itemValue) => setPain(itemValue)}
              items={painOptions}
            />
            
            <CustomPicker
              label="Wundumgebung"
              selectedValue={woundSurrounding}
              onValueChange={(itemValue) => setWoundSurrounding(itemValue)}
              items={woundSurroundingOptions}
            />
            
            <CustomPicker
              label="Heilungsverlauf"
              selectedValue={healingProgress}
              onValueChange={(itemValue) => setHealingProgress(itemValue)}
              items={healingProgressOptions}
            />
          </View>
        )}
        
        {!showResult ? (
          <TouchableOpacity 
            style={[
              styles.button, 
              localStyles.button, 
              { backgroundColor: '#32b8ca' }
            ]} 
            onPress={calculateRiskAndGenerate}
          >
            <Text style={styles.buttonText}>Beurteilung anzeigen</Text>
          </TouchableOpacity>
        ) : (
          <View style={localStyles.resultContainer}>
            <TouchableOpacity 
              style={[
                localStyles.formToggle,
                {
                  borderColor: borderColor
                }
              ]} 
              onPress={toggleForm}
            >
              <Icon 
                name={showForm ? 'chevron-up-outline' : 'chevron-down-outline'} 
                size={22} 
                color={theme === 'dark' ? '#e1e1e1' : '#333333'} 
              />
              <Text style={[styles.itemTitle, localStyles.toggleText]}>
                {showForm ? 'Formular einklappen' : 'Formular ausklappen'}
              </Text>
            </TouchableOpacity>
            
            <View style={[
              localStyles.resultTextContainer,
              {
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
              }
            ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text 
                  style={[styles.itemTitle, localStyles.resultTitle]}
                  selectable={true}
                >
                  Wundbeurteilung
                </Text>
                <TouchableOpacity onPress={handleCopyResultText} style={{ marginLeft: 8, padding: 4 }}>
                  <Icon name={copied ? 'checkmark-done-outline' : 'copy-outline'} size={22} color={copied ? '#4caf50' : (theme === 'dark' ? '#e1e1e1' : '#333')} />
                </TouchableOpacity>
                {copied && (
                  <Text style={{ marginLeft: 6, color: '#4caf50', fontSize: 13 }}>Kopiert!</Text>
                )}
              </View>
              <Text 
                style={[styles.itemSubtitle, localStyles.resultText]}
                selectable={true}
              >
                {generateResultText()}
              </Text>
            </View>
            
            <View style={localStyles.riskContainer}>
              <View style={[
                localStyles.riskIndicator, 
                { backgroundColor: getRiskLevel().color }
              ]}>
                <Text style={localStyles.riskLevel}>{getRiskLevel().level}</Text>
                <Text style={localStyles.riskText}>{getRiskLevel().text}</Text>
              </View>
              
              <Text 
                style={[styles.itemSubtitle, localStyles.riskExplanation]}
                selectable={true}
              >
                {getRiskExplanation()}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                localStyles.resetButton, 
                { backgroundColor: '#32b8ca' }
              ]} 
              onPress={() => {
                setShowResult(false);
                setShowForm(true);
              }}
            >
              <Text style={styles.buttonText}>Neue Beurteilung</Text>
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
      }
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