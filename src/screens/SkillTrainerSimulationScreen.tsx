/**
 * SkillTrainerSimulationScreen.tsx
 * Komponente für interaktive Skill-Trainer-Simulationen
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, FlatList, Vibration } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

// Import Types
import { RootStackParamList } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';
import { useSimulationProgress } from '../context/SimulationProgressContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

// Import Data
import { getSimulationById, SkillTrainerSimulation } from '../data/simulations.data';

type SkillTrainerSimulationScreenRouteProp = RouteProp<RootStackParamList, 'SkillTrainerSimulation'>;
type SkillTrainerSimulationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SkillTrainerSimulation'>;

const SkillTrainerSimulationScreen: React.FC = () => {
  const navigation = useNavigation<SkillTrainerSimulationScreenNavigationProp>();
  const route = useRoute<SkillTrainerSimulationScreenRouteProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { 
    updateSimulationProgress, 
    markSimulationAsCompleted, 
    getProgressForSimulation 
  } = useSimulationProgress();

  // Hole die Simulation anhand der ID aus den Route-Parametern
  const { simulationId } = route.params || {};
  const simulation = getSimulationById(simulationId) as SkillTrainerSimulation | undefined;

  // State für den aktuellen Schritt
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isStepCompleted, setIsStepCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledItems, setShuffledItems] = useState<any[]>([]);
  
  // State für Progress Tracking
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [hasStartedTracking, setHasStartedTracking] = useState(false);

  // Utility-Funktion zum Shuffeln von Arrays
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Reset State wenn sich der Schritt ändert
  useEffect(() => {
    if (simulation) {
      setSelectedItems([]);
      setIsStepCompleted(false);
      setShowFeedback(false);
      setIsCorrect(false);
      
      // Shuffeln der Items für Sequence-Aufgaben
      const currentStep = simulation.steps[currentStepIndex];
      if (currentStep && currentStep.items) {
        if (currentStep.type === 'sequence') {
          setShuffledItems(shuffleArray(currentStep.items));
        } else {
          setShuffledItems(currentStep.items);
        }
      }
    }
  }, [currentStepIndex, simulation]);

  // Initialisiere Progress Tracking beim ersten Laden
  useEffect(() => {
    const initializeProgress = async () => {
      if (simulation && !hasStartedTracking) {
        setHasStartedTracking(true);
        
        // Lade bestehenden Fortschritt
        const existingProgress = getProgressForSimulation(simulation.id);
        if (existingProgress) {
          setCorrectAnswers(existingProgress.score || 0);
          setTotalAnswered(existingProgress.totalQuestions || 0);
        }
        
        // Registriere den Start der Simulation
        await updateSimulationProgress(simulation.id, 'skill_trainer', {
          lastAttemptAt: new Date()
        });
      }
    };
    
    initializeProgress();
  }, [simulation, hasStartedTracking, getProgressForSimulation, updateSimulationProgress]);

  // Wenn keine Simulation gefunden wurde
  if (!simulation) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: theme === 'dark' ? '#fff' : '#000' }]}>
          {t('interactive_cases.simulation_not_found')}
        </Text>
      </View>
    );
  }

  const currentStep = simulation.steps[currentStepIndex];
  const isLastStep = currentStepIndex === simulation.steps.length - 1;

  // Behandle Auswahl von Items
  const handleItemSelection = (itemId: string) => {
    if (isStepCompleted) return;

    if (currentStep.type === 'multiple_choice') {
      setSelectedItems([itemId]);
    } else if (currentStep.type === 'drag_and_drop_selection') {
      setSelectedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else if (currentStep.type === 'sequence') {
      if (selectedItems.includes(itemId)) {
        setSelectedItems(prev => prev.filter(id => id !== itemId));
      } else {
        setSelectedItems(prev => [...prev, itemId]);
      }
    }
  };

  // Prüfe die Antwort
  const checkAnswer = async () => {
    let correct = false;
    
    if (Array.isArray(currentStep.correctAnswer)) {
      if (currentStep.type === 'sequence') {
        correct = JSON.stringify(selectedItems) === JSON.stringify(currentStep.correctAnswer);
      } else {
        correct = selectedItems.length === currentStep.correctAnswer.length &&
                  selectedItems.every(item => currentStep.correctAnswer.includes(item));
      }
    } else {
      correct = selectedItems.length === 1 && selectedItems[0] === currentStep.correctAnswer;
    }

    setIsCorrect(correct);
    setIsStepCompleted(true);
    setShowFeedback(true);
    
    // Haptisches Feedback
    if (correct) {
      Vibration.vibrate([0, 100, 50, 100]); // Doppeltes Vibrationsmuster für richtig
    } else {
      Vibration.vibrate([0, 200, 100, 200, 100, 200]); // Dreifaches Muster für falsch
    }
    
    // Update Progress Tracking
    const newCorrectAnswers = correct ? correctAnswers + 1 : correctAnswers;
    const newTotalAnswered = totalAnswered + 1;
    
    setCorrectAnswers(newCorrectAnswers);
    setTotalAnswered(newTotalAnswered);
    
    // Speichere Fortschritt
    if (simulation) {
      await updateSimulationProgress(simulation.id, 'skill_trainer', {
        score: newCorrectAnswers,
        totalQuestions: newTotalAnswered
      });
    }
  };

  // Gehe zum nächsten Schritt
  const nextStep = async () => {
    if (isLastStep) {
      // Simulation abgeschlossen - markiere als abgeschlossen
      if (simulation) {
        await markSimulationAsCompleted(
          simulation.id,
          'skill_trainer',
          correctAnswers,
          simulation.steps.length
        );
      }
      
      Alert.alert(
        t('interactive_cases.simulation_completed'),
        t('interactive_cases.simulation_completed_message'),
        [
          { text: t('interactive_cases.restart_simulation'), onPress: restartSimulation },
          { text: t('interactive_cases.exit_simulation'), onPress: exitSimulation }
        ]
      );
    } else {
      setCurrentStepIndex(prev => prev + 1);
      // Reset State für den nächsten Schritt
      setSelectedItems([]);
      setIsStepCompleted(false);
      setShowFeedback(false);
      setIsCorrect(false);
    }
  };

  // Neustart der Simulation
  const restartSimulation = async () => {
    setCurrentStepIndex(0);
    setSelectedItems([]);
    setIsStepCompleted(false);
    setShowFeedback(false);
    setIsCorrect(false);
    
    // Reset Progress Tracking
    setCorrectAnswers(0);
    setTotalAnswered(0);
    
    // Shuffle Items für den ersten Schritt neu
    if (simulation && simulation.steps[0]) {
      const firstStep = simulation.steps[0];
      if (firstStep.items) {
        if (firstStep.type === 'sequence') {
          setShuffledItems(shuffleArray(firstStep.items));
        } else {
          setShuffledItems(firstStep.items);
        }
      }
    }
    
    // Registriere den Neustart
    if (simulation) {
      await updateSimulationProgress(simulation.id, 'skill_trainer', {
        score: 0,
        totalQuestions: 0,
        isCompleted: false
      });
    }
  };

  // Verlasse die Simulation
  const exitSimulation = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? '#333' : '#e0e0e0'
      }}>
        <TouchableOpacity onPress={exitSimulation} style={{ marginRight: 16 }}>
          <Icon name="arrow-back" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme === 'dark' ? '#fff' : '#000', fontSize: 18 }]}>
            {simulation.titleKey ? t(simulation.titleKey) : ''}
          </Text>
          <Text style={[styles.subtitle, { color: theme === 'dark' ? '#ccc' : '#666', fontSize: 14 }]}>
            {t('interactive_cases.step_of', { current: currentStepIndex + 1, total: simulation.steps.length })}
          </Text>
        </View>
      </View>

      {/* Fortschrittsanzeige */}
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff'
      }}>
        <View style={{
          height: 6,
          backgroundColor: theme === 'dark' ? '#555' : '#e0e0e0',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <View style={{
            height: '100%',
            width: `${((currentStepIndex + 1) / simulation.steps.length) * 100}%`,
            backgroundColor: theme === 'dark' ? '#4caf50' : '#2e7d32',
            borderRadius: 3
          }} />
        </View>
      </View>

      {/* Haupt-Content */}
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingVertical: 20
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Schritt-Anweisung */}
        <View style={{
          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Text style={{
            fontSize: baseFontSize * fontSizeScale * 1.1,
            color: theme === 'dark' ? '#fff' : '#000',
            lineHeight: 24,
            marginBottom: 8
          }}>
            {currentStep.instructionKey ? t(currentStep.instructionKey) : ''}
          </Text>
          
          {currentStep.type === 'sequence' && (
            <Text style={{
              fontSize: baseFontSize * fontSizeScale * 0.9,
              color: theme === 'dark' ? '#ccc' : '#666',
              fontStyle: 'italic'
            }}>
              {t('interactive_cases.sequence_instruction')}
            </Text>
          )}
        </View>

        {/* Items */}
        {shuffledItems.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            {shuffledItems.map((item, index) => {
              const isSelected = selectedItems.includes(item.id);
              const sequenceNumber = currentStep.type === 'sequence' ? selectedItems.indexOf(item.id) + 1 : null;
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    backgroundColor: isSelected 
                      ? (theme === 'dark' ? '#1b5e20' : '#e8f5e8')
                      : (theme === 'dark' ? '#333' : '#f0f0f0'),
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: isSelected 
                      ? '#4caf50' 
                      : (theme === 'dark' ? '#555' : '#e0e0e0'),
                    opacity: isStepCompleted ? 0.7 : 1
                  }}
                  onPress={() => handleItemSelection(item.id)}
                  disabled={isStepCompleted}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {currentStep.type === 'sequence' && sequenceNumber !== null && sequenceNumber > 0 && (
                      <View style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: '#4caf50',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12
                      }}>
                        <Text style={{
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: '600'
                        }}>
                          {sequenceNumber.toString()}
                        </Text>
                      </View>
                    )}
                    
                    {currentStep.type === 'multiple_choice' && (
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: isSelected ? '#4caf50' : (theme === 'dark' ? '#555' : '#ddd'),
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12
                      }}>
                        <Text style={{
                          color: isSelected ? '#fff' : (theme === 'dark' ? '#fff' : '#000'),
                          fontSize: 14,
                          fontWeight: '600'
                        }}>
                          {String.fromCharCode(65 + index)}
                        </Text>
                      </View>
                    )}
                    
                    {currentStep.type === 'drag_and_drop_selection' && (
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        backgroundColor: isSelected ? '#4caf50' : (theme === 'dark' ? '#555' : '#ddd'),
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12
                      }}>
                        {isSelected && (
                          <Icon name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                    )}
                    
                    <Text style={{
                      flex: 1,
                      fontSize: baseFontSize * fontSizeScale,
                      color: isSelected 
                        ? (theme === 'dark' ? '#c8e6c9' : '#2e7d32')
                        : (theme === 'dark' ? '#fff' : '#000'),
                      lineHeight: 20
                    }}>
                      {item.textKey ? t(item.textKey) : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Feedback */}
        {showFeedback && (
          <View style={[
            styles.card,
            {
              backgroundColor: isCorrect 
                ? (theme === 'dark' ? '#1b5e20' : '#c8e6c9')  // Deutlicher grüner Hintergrund
                : (theme === 'dark' ? '#b71c1c' : '#ffcdd2'),  // Deutlicher roter Hintergrund
              borderWidth: 3,  // Dickerer Border für mehr Kontrast
              borderColor: isCorrect ? '#4caf50' : '#f44336',
              marginBottom: 24
            }
          ]}>
            {/* Status Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: isCorrect ? '#4caf50' : '#f44336',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16
              }}>
                <Icon 
                  name={isCorrect ? 'checkmark-circle' : 'close-circle'} 
                  size={28} 
                  color="#fff" 
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.headerTitle,
                  {
                    fontSize: baseFontSize * fontSizeScale * 1.2,
                    color: isCorrect 
                      ? (theme === 'dark' ? '#c8e6c9' : '#1b5e20')  // Dunkleres Grün für besseren Kontrast
                      : (theme === 'dark' ? '#ffcdd2' : '#b71c1c'),  // Dunkleres Rot für besseren Kontrast
                    fontWeight: '600'
                  }
                ]}>
                  {isCorrect ? '✓ RICHTIG!' : '✗ FALSCH!'}
                </Text>
                <Text style={[
                  styles.itemSubtitle,
                  {
                    color: isCorrect 
                      ? (theme === 'dark' ? '#a5d6a7' : '#2e7d32')  // Dunkleres Grün
                      : (theme === 'dark' ? '#ef9a9a' : '#c62828'),  // Dunkleres Rot
                    marginTop: 4
                  }
                ]}>
                  {isCorrect ? t('interactive_cases.correct') : t('interactive_cases.incorrect')}
                </Text>
              </View>
            </View>
            
            {/* Feedback Text */}
            {((isCorrect && currentStep.feedbackCorrectKey) || (!isCorrect && currentStep.feedbackIncorrectKey)) && (
              <View style={{
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                borderRadius: 8,
                padding: 12
              }}>
                <Text style={[
                  styles.itemSubtitle,
                  {
                    color: isCorrect 
                      ? (theme === 'dark' ? '#c8e6c9' : '#1b5e20')  // Dunkleres Grün für besseren Kontrast
                      : (theme === 'dark' ? '#ffcdd2' : '#b71c1c'),  // Dunkleres Rot für besseren Kontrast
                    lineHeight: baseFontSize * fontSizeScale * 1.4
                  }
                ]}>
                  {t(isCorrect ? currentStep.feedbackCorrectKey! : currentStep.feedbackIncorrectKey!)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Aktionsbuttons */}
        <View style={{ marginTop: 24 }}>
          {!isStepCompleted && selectedItems.length > 0 && (
            <TouchableOpacity
              style={{
                backgroundColor: theme === 'dark' ? '#2196f3' : '#1976d2',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginBottom: 12
              }}
              onPress={checkAnswer}
            >
              <Text style={{
                color: '#fff',
                fontSize: baseFontSize * fontSizeScale * 1.1,
                fontWeight: '600'
              }}>
                {t('interactive_cases.check_answer')}
              </Text>
            </TouchableOpacity>
          )}

          {isStepCompleted && (
            <TouchableOpacity
              style={{
                backgroundColor: theme === 'dark' ? '#4caf50' : '#2e7d32',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginBottom: 12
              }}
              onPress={nextStep}
            >
              <Text style={{
                color: '#fff',
                fontSize: baseFontSize * fontSizeScale * 1.1,
                fontWeight: '600'
              }}>
                {isLastStep ? t('interactive_cases.complete_simulation') : t('interactive_cases.next_step')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SkillTrainerSimulationScreen; 