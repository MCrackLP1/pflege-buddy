/**
 * InteractiveCasesScreen.tsx
 * Hauptscreen für interaktive Fallsimulationen mit Fortschrittsanzeige
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

// Import Components

import { SimulationCard, StatisticsCard } from '../components/ProgressComponents';

// Import Data
import { availableSimulations } from '../data/simulations.data';

type InteractiveCasesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'InteractiveCasesLanding'>;

const InteractiveCasesScreen: React.FC = () => {
  const navigation = useNavigation<InteractiveCasesScreenNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { 
    statistics, 
    getProgressForSimulation, 
    getProgressPercentage, 
    loading 
  } = useSimulationProgress();

  // State für Fortschrittsdaten
  const [simulationProgress, setSimulationProgress] = useState<Record<string, number>>({});
  const [showStatistics, setShowStatistics] = useState(true); // Standardmäßig geöffnet
  const [showCases, setShowCases] = useState(false); // Standardmäßig geschlossen
  const [showSkills, setShowSkills] = useState(false); // Standardmäßig geschlossen

  // Lade Fortschrittsdaten für alle Simulationen
  useEffect(() => {
    const loadProgressData = async () => {
      const progressData: Record<string, number> = {};
      
      for (const simulation of availableSimulations) {
        const percentage = await getProgressPercentage(simulation.id);
        progressData[simulation.id] = percentage;
      }
      
      setSimulationProgress(progressData);
    };

    if (!loading) {
      loadProgressData();
    }
  }, [loading, getProgressPercentage]);

  // Navigation zu Simulationen
  const navigateToSimulation = (simulation: any) => {
    if (simulation.type === 'decision_tree') {
      // @ts-ignore - Navigation zu Decision Tree
      navigation.navigate('DecisionTreeSimulation', { simulationId: simulation.id });
    } else {
      // @ts-ignore - Navigation zu Skill Trainer
      navigation.navigate('SkillTrainerSimulation', { simulationId: simulation.id });
    }
  };

  // Filtere Simulationen nach Typ
  const decisionTreeSimulations = availableSimulations.filter(s => s.type === 'decision_tree');
  const skillTrainerSimulations = availableSimulations.filter(s => s.type === 'skill_trainer');

      return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <ScrollView 
        contentContainerStyle={{ 
          paddingTop: 15,
          paddingBottom: 20,
          paddingHorizontal: 16
        }} 
        showsVerticalScrollIndicator={false}
      >
        {/* Statistik-Toggle */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f8f9fa',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20
          }}
          onPress={() => setShowStatistics(!showStatistics)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon 
              name="stats-chart" 
              size={20} 
              color={theme === 'dark' ? '#4caf50' : '#2e7d32'} 
              style={{ marginRight: 8 }} 
            />
            <Text style={{
              fontSize: baseFontSize * fontSizeScale * 1.1,
              fontWeight: '600',
              color: theme === 'dark' ? '#fff' : '#000'
            }}>
              Fortschritts-Übersicht
            </Text>
          </View>
          <Icon 
            name={showStatistics ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={theme === 'dark' ? '#ccc' : '#666'} 
          />
        </TouchableOpacity>

        {/* Statistiken */}
        {showStatistics && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              marginBottom: 12
            }}>
              <StatisticsCard
                title="Abgeschlossen"
                value={statistics.completedSimulations}
                subtitle={`von ${statistics.totalSimulations}`}
                icon="checkmark-circle"
                color={theme === 'dark' ? '#4caf50' : '#2e7d32'}
                style={{ flex: 1, marginRight: 8 }}
              />
              <StatisticsCard
                title="Erfolgsrate"
                value={`${Math.round(statistics.completionRate)}%`}
                icon="trophy"
                color={theme === 'dark' ? '#ff9800' : '#f57c00'}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
            <StatisticsCard
              title="Durchschnittspunktzahl"
              value={`${Math.round(statistics.averageScore)}%`}
              subtitle={`Versuche: ${statistics.totalAttempts}`}
              icon="analytics"
              color={theme === 'dark' ? '#2196f3' : '#1976d2'}
            />
            
            {/* Detaillierte Statistiken Button */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme === 'dark' ? '#3d5afe' : '#2196f3',
                borderRadius: 8,
                padding: 12,
                marginTop: 12
              }}
              onPress={() => navigation.navigate('Statistics')}
            >
              <Icon 
                name="analytics-outline" 
                size={18} 
                color="white" 
                style={{ marginRight: 6 }} 
              />
              <Text style={{
                fontSize: baseFontSize * fontSizeScale * 0.9,
                fontWeight: '600',
                color: 'white'
              }}>
                Detaillierte Statistiken
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Klinische Entscheidungsbäume - Aufklappbar */}
        <View style={{ marginBottom: 24 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f8f9fa',
              borderRadius: 12,
              padding: 16,
              marginBottom: showCases ? 20 : 0
            }}
            onPress={() => setShowCases(!showCases)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon 
                name="git-branch" 
                size={20} 
                color={theme === 'dark' ? '#2196f3' : '#1976d2'} 
                style={{ marginRight: 8 }} 
              />
              <View>
                <Text style={{
                  fontSize: baseFontSize * fontSizeScale * 1.1,
                  fontWeight: '600',
                  color: theme === 'dark' ? '#fff' : '#000'
                }}>
                  {t('interactive_cases.decision_tree.title')}
                </Text>
                <Text style={{
                  fontSize: baseFontSize * fontSizeScale * 0.8,
                  color: theme === 'dark' ? '#ccc' : '#666',
                  marginTop: 2
                }}>
                  {decisionTreeSimulations.length} Fälle verfügbar
                </Text>
              </View>
            </View>
            <Icon 
              name={showCases ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme === 'dark' ? '#ccc' : '#666'} 
            />
          </TouchableOpacity>

          {showCases && (
            <View>
              <Text style={{
                fontSize: baseFontSize * fontSizeScale * 0.9,
                color: theme === 'dark' ? '#ccc' : '#666',
                marginBottom: 16
              }}>
                {t('interactive_cases.decision_tree.subtitle')}
              </Text>
              
              {decisionTreeSimulations.map((simulation) => {
                const progress = getProgressForSimulation(simulation.id);
                const percentage = simulationProgress[simulation.id] || 0;
                
                return (
                  <TouchableOpacity
                    key={simulation.id}
                    onPress={() => navigateToSimulation(simulation)}
                  >
                    <SimulationCard
                      title={t(simulation.titleKey)}
                      subtitle=""
                      percentage={percentage}
                      isCompleted={progress?.isCompleted || false}
                      onPress={() => navigateToSimulation(simulation)}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Skill Trainer - Aufklappbar */}
        <View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f8f9fa',
              borderRadius: 12,
              padding: 16,
              marginBottom: showSkills ? 20 : 0
            }}
            onPress={() => setShowSkills(!showSkills)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon 
                name="school" 
                size={20} 
                color={theme === 'dark' ? '#4caf50' : '#2e7d32'} 
                style={{ marginRight: 8 }} 
              />
              <View>
                <Text style={{
                  fontSize: baseFontSize * fontSizeScale * 1.1,
                  fontWeight: '600',
                  color: theme === 'dark' ? '#fff' : '#000'
                }}>
                  {t('interactive_cases.skill_trainer.title')}
                </Text>
                <Text style={{
                  fontSize: baseFontSize * fontSizeScale * 0.8,
                  color: theme === 'dark' ? '#ccc' : '#666',
                  marginTop: 2
                }}>
                  {skillTrainerSimulations.length} Skills verfügbar
                </Text>
              </View>
            </View>
            <Icon 
              name={showSkills ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme === 'dark' ? '#ccc' : '#666'} 
            />
          </TouchableOpacity>

          {showSkills && (
            <View>
              <Text style={{
                fontSize: baseFontSize * fontSizeScale * 0.9,
                color: theme === 'dark' ? '#ccc' : '#666',
                marginBottom: 16
              }}>
                {t('interactive_cases.skill_trainer.subtitle')}
              </Text>
              
              {skillTrainerSimulations.map((simulation) => {
                const progress = getProgressForSimulation(simulation.id);
                const percentage = simulationProgress[simulation.id] || 0;
                
                return (
                  <TouchableOpacity
                    key={simulation.id}
                    onPress={() => navigateToSimulation(simulation)}
                  >
                    <SimulationCard
                      title={t(simulation.titleKey)}
                      subtitle=""
                      percentage={percentage}
                      isCompleted={progress?.isCompleted || false}
                      onPress={() => navigateToSimulation(simulation)}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default InteractiveCasesScreen; 