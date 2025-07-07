import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useSimulationProgress } from '../context/SimulationProgressContext';
import { availableSimulations } from '../data/simulations.data';
import { ProgressBar, CircularProgress } from '../components/ProgressComponents';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export const StatisticsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { allProgress, statistics: contextStatistics, loading, resetAllProgress } = useSimulationProgress();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'cases' | 'skills'>('overview');

  const progress = allProgress || [];

  const handleResetProgress = () => {
    Alert.alert(
      'Fortschritt zurücksetzen',
      'Möchten Sie wirklich alle Fortschritte und Statistiken zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetAllProgress();
              Alert.alert('Erfolg', 'Alle Fortschritte wurden erfolgreich zurückgesetzt.');
            } catch (error) {
              Alert.alert('Fehler', 'Beim Zurücksetzen der Fortschritte ist ein Fehler aufgetreten.');
            }
          },
        },
      ]
    );
  };

  const statistics = useMemo(() => {
    if (!progress || progress.length === 0) {
      return {
        total: {
          simulations: availableSimulations.length,
          completed: 0,
          completionRate: 0,
          overallAvgScore: 0,
          totalAttempts: 0,
          avgAttempts: 0,
        },
        decisionTrees: {
          total: availableSimulations.filter(sim => sim.type === 'decision_tree').length,
          completed: 0,
          inProgress: 0,
          notStarted: availableSimulations.filter(sim => sim.type === 'decision_tree').length,
          completionRate: 0,
          avgScore: 0,
          bestScore: 0,
        },
        skillTrainers: {
          total: availableSimulations.filter(sim => sim.type === 'skill_trainer').length,
          completed: 0,
          inProgress: 0,
          notStarted: availableSimulations.filter(sim => sim.type === 'skill_trainer').length,
          completionRate: 0,
          avgScore: 0,
          bestScore: 0,
        },
      };
    }

    const decisionTrees = availableSimulations.filter(sim => sim.type === 'decision_tree');
    const skillTrainers = availableSimulations.filter(sim => sim.type === 'skill_trainer');

    const decisionTreeProgress = progress.filter(p => p.simulationType === 'decision_tree');
    const skillTrainerProgress = progress.filter(p => p.simulationType === 'skill_trainer');

    const completedDecisionTrees = decisionTreeProgress.filter(p => p.isCompleted);
    const completedSkillTrainers = skillTrainerProgress.filter(p => p.isCompleted);

    const totalSimulations = decisionTrees.length + skillTrainers.length;
    const totalCompleted = completedDecisionTrees.length + completedSkillTrainers.length;

    // Berechne Durchschnittswerte
    const decisionTreeScores = completedDecisionTrees
      .filter(p => p.score !== undefined)
      .map(p => p.score!);
    const skillTrainerScores = completedSkillTrainers
      .filter(p => p.score !== undefined)
      .map(p => p.score!);

    const avgDecisionTreeScore = decisionTreeScores.length > 0 
      ? decisionTreeScores.reduce((a, b) => a + b, 0) / decisionTreeScores.length 
      : 0;

    const avgSkillTrainerScore = skillTrainerScores.length > 0 
      ? skillTrainerScores.reduce((a, b) => a + b, 0) / skillTrainerScores.length 
      : 0;

    const overallAvgScore = [...decisionTreeScores, ...skillTrainerScores].length > 0
      ? [...decisionTreeScores, ...skillTrainerScores].reduce((a, b) => a + b, 0) / [...decisionTreeScores, ...skillTrainerScores].length
      : 0;

    // Beste Scores
    const bestDecisionTreeScore = decisionTreeScores.length > 0 ? Math.max(...decisionTreeScores) : 0;
    const bestSkillTrainerScore = skillTrainerScores.length > 0 ? Math.max(...skillTrainerScores) : 0;

    // Versuche
    const totalAttempts = progress.reduce((sum, p) => sum + p.attempts, 0);
    const avgAttempts = progress.length > 0 ? totalAttempts / progress.length : 0;

    // Kategorien-spezifische Statistiken
    const getCategoryStats = (type: 'decision_tree' | 'skill_trainer') => {
      const sims = availableSimulations.filter(sim => sim.type === type);
      const prog = progress.filter(p => p.simulationType === type);
      const completed = prog.filter(p => p.isCompleted);
      
      return {
        total: sims.length,
        completed: completed.length,
        inProgress: prog.filter(p => !p.isCompleted && p.attempts > 0).length,
        notStarted: sims.length - prog.length,
        completionRate: sims.length > 0 ? (completed.length / sims.length) * 100 : 0,
      };
    };

    return {
      total: {
        simulations: totalSimulations,
        completed: totalCompleted,
        completionRate: totalSimulations > 0 ? (totalCompleted / totalSimulations) * 100 : 0,
        overallAvgScore,
        totalAttempts,
        avgAttempts,
      },
      decisionTrees: {
        ...getCategoryStats('decision_tree'),
        avgScore: avgDecisionTreeScore,
        bestScore: bestDecisionTreeScore,
      },
      skillTrainers: {
        ...getCategoryStats('skill_trainer'),
        avgScore: avgSkillTrainerScore,
        bestScore: bestSkillTrainerScore,
      },
    };
  }, [progress]);

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Gesamtfortschritt */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gesamtfortschritt</Text>
        <View style={styles.progressSection}>
          <CircularProgress 
            progress={statistics.total.completionRate} 
            size={80}
            showPercentage={true}
          />
          <View style={styles.progressDetails}>
            <Text style={styles.progressText}>
              {statistics.total.completed} von {statistics.total.simulations} abgeschlossen
            </Text>
            <Text style={styles.subText}>
              Durchschnittlicher Score: {statistics.total.overallAvgScore.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Kategorien-Übersicht */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kategorien-Übersicht</Text>
        
        <View style={styles.categoryRow}>
          <Text style={styles.categoryLabel}>Klinische Fälle</Text>
          <ProgressBar 
            progress={statistics.decisionTrees.completionRate} 
            height={12}
            style={styles.categoryProgress}
          />
          <Text style={styles.categoryPercent}>
            {statistics.decisionTrees.completionRate.toFixed(0)}%
          </Text>
        </View>

        <View style={styles.categoryRow}>
          <Text style={styles.categoryLabel}>Praktische Skills</Text>
          <ProgressBar 
            progress={statistics.skillTrainers.completionRate} 
            height={12}
            style={styles.categoryProgress}
          />
          <Text style={styles.categoryPercent}>
            {statistics.skillTrainers.completionRate.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Leistungsübersicht */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Leistungsübersicht</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.total.totalAttempts}</Text>
            <Text style={styles.statLabel}>Gesamte Versuche</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.total.avgAttempts.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Ø Versuche</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.decisionTrees.bestScore.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Bester Fall-Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.skillTrainers.bestScore.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Bester Skill-Score</Text>
          </View>
        </View>
      </View>

      {/* Reset Button */}
      <View style={styles.resetContainer}>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetProgress}
        >
          <Text style={styles.resetButtonText}>Gesamten Fortschritt zurücksetzen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCasesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Klinische Fälle (Decision Trees)</Text>
        
        <View style={styles.categoryOverview}>
          <CircularProgress 
            progress={statistics.decisionTrees.completionRate} 
            size={60}
            showPercentage={true}
          />
          <View style={styles.overviewStats}>
            <Text style={styles.overviewText}>
              {statistics.decisionTrees.completed} von {statistics.decisionTrees.total} abgeschlossen
            </Text>
            <Text style={styles.subText}>
              Durchschnittlicher Score: {statistics.decisionTrees.avgScore.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.statusBreakdown}>
          <View style={styles.statusItem}>
            <View style={[styles.statusIcon, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusText}>Abgeschlossen: {statistics.decisionTrees.completed}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusIcon, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.statusText}>In Bearbeitung: {statistics.decisionTrees.inProgress}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusIcon, { backgroundColor: '#6B7280' }]} />
            <Text style={styles.statusText}>Nicht begonnen: {statistics.decisionTrees.notStarted}</Text>
          </View>
        </View>

        {statistics.decisionTrees.bestScore > 0 && (
          <View style={styles.bestScoreContainer}>
            <Text style={styles.bestScoreLabel}>Bester Score:</Text>
            <Text style={styles.bestScoreValue}>{statistics.decisionTrees.bestScore.toFixed(0)}%</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderSkillsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Praktische Skills (Skill Trainer)</Text>
        
        <View style={styles.categoryOverview}>
          <CircularProgress 
            progress={statistics.skillTrainers.completionRate} 
            size={60}
            showPercentage={true}
          />
          <View style={styles.overviewStats}>
            <Text style={styles.overviewText}>
              {statistics.skillTrainers.completed} von {statistics.skillTrainers.total} abgeschlossen
            </Text>
            <Text style={styles.subText}>
              Durchschnittlicher Score: {statistics.skillTrainers.avgScore.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.statusBreakdown}>
          <View style={styles.statusItem}>
            <View style={[styles.statusIcon, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusText}>Abgeschlossen: {statistics.skillTrainers.completed}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusIcon, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.statusText}>In Bearbeitung: {statistics.skillTrainers.inProgress}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusIcon, { backgroundColor: '#6B7280' }]} />
            <Text style={styles.statusText}>Nicht begonnen: {statistics.skillTrainers.notStarted}</Text>
          </View>
        </View>

        {statistics.skillTrainers.bestScore > 0 && (
          <View style={styles.bestScoreContainer}>
            <Text style={styles.bestScoreLabel}>Bester Score:</Text>
            <Text style={styles.bestScoreValue}>{statistics.skillTrainers.bestScore.toFixed(0)}%</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ 
          fontSize: 16, 
          color: '#666',
          textAlign: 'center' 
        }}>
          Lade Statistiken...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
            Übersicht
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'cases' && styles.activeTab]}
          onPress={() => setSelectedTab('cases')}
        >
          <Text style={[styles.tabText, selectedTab === 'cases' && styles.activeTabText]}>
            Fälle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'skills' && styles.activeTab]}
          onPress={() => setSelectedTab('skills')}
        >
          <Text style={[styles.tabText, selectedTab === 'skills' && styles.activeTabText]}>
            Skills
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'cases' && renderCasesTab()}
        {selectedTab === 'skills' && renderSkillsTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDetails: {
    marginLeft: 20,
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#374151',
    width: 120,
  },
  categoryProgress: {
    flex: 1,
    marginHorizontal: 12,
  },
  categoryPercent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    minWidth: 40,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewStats: {
    marginLeft: 20,
    flex: 1,
  },
  overviewText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusBreakdown: {
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
  },
  bestScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bestScoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  bestScoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  resetContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 