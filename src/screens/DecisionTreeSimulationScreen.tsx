/**
 * DecisionTreeSimulationScreen.tsx
 * Komponente für interaktive Entscheidungsbaum-Simulationen
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Vibration } from 'react-native';
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
import { getSimulationById, getNextDecisionTreeCase, DecisionTreeSimulation } from '../data/simulations.data';

type DecisionTreeSimulationScreenRouteProp = RouteProp<RootStackParamList, 'DecisionTreeSimulation'>;
type DecisionTreeSimulationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DecisionTreeSimulation'>;

const DecisionTreeSimulationScreen: React.FC = () => {
  const navigation = useNavigation<DecisionTreeSimulationScreenNavigationProp>();
  const route = useRoute<DecisionTreeSimulationScreenRouteProp>();
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
  const simulation = getSimulationById(simulationId) as DecisionTreeSimulation | undefined;

  // State für den aktuellen Knoten
  const [currentNodeId, setCurrentNodeId] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  
  // State für Progress Tracking
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [hasStartedTracking, setHasStartedTracking] = useState(false);

  // Initialisiere den aktuellen Knoten mit dem Startknoten
  useEffect(() => {
    if (simulation && simulation.startNodeId) {
      setCurrentNodeId(simulation.startNodeId);
    }
  }, [simulation]);

  // Initialisiere Progress Tracking beim ersten Laden
  useEffect(() => {
    const initializeProgress = async () => {
      if (simulation && !hasStartedTracking) {
        setHasStartedTracking(true);
        
        // Lade bestehenden Fortschritt
        const existingProgress = getProgressForSimulation(simulation.id);
        if (existingProgress && existingProgress.completedNodes) {
          setVisitedNodes(existingProgress.completedNodes);
        }
        
        // Registriere den Start der Simulation
        await updateSimulationProgress(simulation.id, 'decision_tree', {
          lastAttemptAt: new Date()
        });
      }
    };
    
    initializeProgress();
  }, [simulation, hasStartedTracking, getProgressForSimulation, updateSimulationProgress]);

  // Verfolge besuchte Knoten
  useEffect(() => {
    const trackNodeVisit = async () => {
      if (currentNodeId && simulation && !visitedNodes.includes(currentNodeId)) {
        const newVisitedNodes = [...visitedNodes, currentNodeId];
        setVisitedNodes(newVisitedNodes);
        
        // Speichere Fortschritt
        await updateSimulationProgress(simulation.id, 'decision_tree', {
          completedNodes: newVisitedNodes
        });
      }
    };
    
    trackNodeVisit();
  }, [currentNodeId, simulation, visitedNodes, updateSimulationProgress]);

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

  const currentNode = simulation.nodes[currentNodeId];

  // Behandle Auswahl einer Entscheidung
  const handleChoiceSelection = async (nextNodeId: string) => {
    setCurrentNodeId(nextNodeId);
    
    // Prüfe, ob der neue Knoten ein Endknoten ist
    const nextNode = simulation.nodes[nextNodeId];
    if (nextNode?.isEndNode) {
      setIsCompleted(true);
      
      // Haptisches Feedback für Simulation beendet
      Vibration.vibrate([0, 150, 50, 150]); // Doppeltes Vibrationsmuster
      
      // Markiere Simulation als abgeschlossen
      if (simulation) {
        // Berechne ob der optimale Pfad genommen wurde (vereinfacht)
        const totalNodes = Object.keys(simulation.nodes).length;
        const bestPath = visitedNodes.length <= Math.ceil(totalNodes * 0.6); // max 60% der Knoten besucht
        
        await markSimulationAsCompleted(
          simulation.id,
          'decision_tree',
          undefined, // score nicht relevant für decision trees
          undefined, // totalQuestions nicht relevant
          [...visitedNodes, nextNodeId],
          bestPath
        );
      }
    } else {
      // Leichtes Feedback für Zwischenschritte
      Vibration.vibrate(50);
    }
  };

  // Neustart der Simulation
  const restartSimulation = async () => {
    setCurrentNodeId(simulation.startNodeId);
    setIsCompleted(false);
    
    // Reset Progress Tracking
    setVisitedNodes([]);
    
    // Registriere den Neustart
    if (simulation) {
      await updateSimulationProgress(simulation.id, 'decision_tree', {
        completedNodes: [],
        isCompleted: false,
        bestPath: undefined
      });
    }
  };

  // Verlasse die Simulation
  const exitSimulation = () => {
    navigation.goBack();
  };

  // Navigiere zum nächsten Fall
  const goToNextCase = () => {
    if (simulation) {
      const nextCase = getNextDecisionTreeCase(simulation.id);
      if (nextCase) {
        navigation.replace('DecisionTreeSimulation', { simulationId: nextCase.id });
      }
    }
  };

  // Prüfe ob nächster Fall verfügbar ist
  const hasNextCase = simulation ? !!getNextDecisionTreeCase(simulation.id) : false;

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
            {t(simulation.titleKey)}
          </Text>
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
        {/* Aktuelle Situation */}
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
            marginBottom: 16
          }}>
            {t(currentNode?.textKey || '')}
          </Text>

          {/* Feedback bei Endknoten */}
          {isCompleted && currentNode?.feedbackKey && (
            <View style={[
              styles.card,
              {
                backgroundColor: theme === 'dark' ? '#1b5e20' : '#c8e6c9',  // Deutlicher grüner Hintergrund
                borderWidth: 3,  // Dickerer Border für mehr Kontrast
                borderColor: '#4caf50',
                marginTop: 16
              }
            ]}>
              {/* Feedback Header mit Icon */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#4caf50',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Icon 
                    name="checkmark-circle" 
                    size={28} 
                    color="#fff" 
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.headerTitle,
                    {
                      fontSize: baseFontSize * fontSizeScale * 1.2,
                      color: theme === 'dark' ? '#c8e6c9' : '#1b5e20',  // Dunkleres Grün für besseren Kontrast
                      fontWeight: '600'
                    }
                  ]}>
                    ✓ SIMULATION BEENDET!
                  </Text>
                  <Text style={[
                    styles.itemSubtitle,
                    {
                      color: theme === 'dark' ? '#a5d6a7' : '#2e7d32',  // Dunkleres Grün
                      marginTop: 4
                    }
                  ]}>
                    {t('interactive_cases.feedback')}
                  </Text>
                </View>
              </View>
              
              {/* Feedback Text */}
              <View style={{
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                borderRadius: 8,
                padding: 12
              }}>
                <Text style={[
                  styles.itemSubtitle,
                  {
                    color: theme === 'dark' ? '#c8e6c9' : '#1b5e20',  // Dunkleres Grün für besseren Kontrast
                    lineHeight: baseFontSize * fontSizeScale * 1.4
                  }
                ]}>
                  {t(currentNode.feedbackKey)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Entscheidungsoptionen */}
        {!isCompleted && currentNode?.choices && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: baseFontSize * fontSizeScale * 1.1,
              color: theme === 'dark' ? '#fff' : '#000',
              fontWeight: '600',
              marginBottom: 16
            }}>
              {t('interactive_cases.what_do_you_do')}
            </Text>
            
            {currentNode.choices.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: theme === 'dark' ? '#555' : '#e0e0e0'
                }}
                onPress={() => handleChoiceSelection(choice.nextNodeId)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: theme === 'dark' ? '#555' : '#ddd',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{
                      color: theme === 'dark' ? '#fff' : '#000',
                      fontSize: 14,
                      fontWeight: '600'
                    }}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={{
                    flex: 1,
                    fontSize: baseFontSize * fontSizeScale,
                    color: theme === 'dark' ? '#fff' : '#000',
                    lineHeight: 20
                  }}>
                    {t(choice.textKey)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Aktionsbuttons bei Abschluss */}
        {isCompleted && (
          <View style={{ marginTop: 24 }}>
            <TouchableOpacity
              style={{
                backgroundColor: theme === 'dark' ? '#2196f3' : '#1976d2',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginBottom: 12
              }}
              onPress={restartSimulation}
            >
              <Text style={{
                color: '#fff',
                fontSize: baseFontSize * fontSizeScale * 1.1,
                fontWeight: '600'
              }}>
                {t('interactive_cases.restart_simulation')}
              </Text>
            </TouchableOpacity>

            {/* Nächster Fall Button - nur anzeigen wenn verfügbar */}
            {hasNextCase && (
              <TouchableOpacity
                style={{
                  backgroundColor: theme === 'dark' ? '#4CAF50' : '#388E3C',
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  marginBottom: 12
                }}
                onPress={goToNextCase}
              >
                <Text style={{
                  color: '#fff',
                  fontSize: baseFontSize * fontSizeScale * 1.1,
                  fontWeight: '600'
                }}>
                  Nächster Fall
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{
                backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme === 'dark' ? '#555' : '#e0e0e0'
              }}
              onPress={exitSimulation}
            >
              <Text style={{
                color: theme === 'dark' ? '#fff' : '#000',
                fontSize: baseFontSize * fontSizeScale * 1.1,
                fontWeight: '600'
              }}>
                {t('interactive_cases.exit_simulation')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DecisionTreeSimulationScreen; 