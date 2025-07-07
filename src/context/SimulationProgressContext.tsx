/**
 * SimulationProgressContext.tsx
 * Context für das State Management der Simulation-Fortschritte
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SimulationProgress, SimulationStatistics } from '../types/types';
import { SimulationProgressService } from '../services/SimulationProgressService';

interface SimulationProgressContextType {
  // State
  allProgress: SimulationProgress[];
  statistics: SimulationStatistics;
  loading: boolean;
  
  // Actions
  loadProgress: () => Promise<void>;
  getProgressForSimulation: (simulationId: string) => SimulationProgress | null;
  getProgressPercentage: (simulationId: string) => Promise<number>;
  updateSimulationProgress: (
    simulationId: string,
    simulationType: 'decision_tree' | 'skill_trainer',
    updates: Partial<SimulationProgress>
  ) => Promise<void>;
  markSimulationAsCompleted: (
    simulationId: string,
    simulationType: 'decision_tree' | 'skill_trainer',
    score?: number,
    totalQuestions?: number,
    completedNodes?: string[],
    bestPath?: boolean
  ) => Promise<void>;
  resetSimulationProgress: (simulationId: string) => Promise<void>;
  resetAllProgress: () => Promise<void>;
  refreshStatistics: () => Promise<void>;
}

const SimulationProgressContext = createContext<SimulationProgressContextType | undefined>(undefined);

interface SimulationProgressProviderProps {
  children: ReactNode;
}

export const SimulationProgressProvider: React.FC<SimulationProgressProviderProps> = ({ children }) => {
  const [allProgress, setAllProgress] = useState<SimulationProgress[]>([]);
  const [statistics, setStatistics] = useState<SimulationStatistics>({
    totalSimulations: 0,
    completedSimulations: 0,
    completionRate: 0,
    totalAttempts: 0,
    averageScore: 0,
    lastActivity: new Date()
  });
  const [loading, setLoading] = useState(true);

  // Lädt alle Fortschritte beim Start
  const loadProgress = async () => {
    setLoading(true);
    try {
      const progress = await SimulationProgressService.loadAllProgress();
      setAllProgress(progress);
      
      const stats = await SimulationProgressService.calculateStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Fehler beim Laden der Fortschritte:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gibt den Fortschritt für eine bestimmte Simulation zurück
  const getProgressForSimulation = (simulationId: string): SimulationProgress | null => {
    return allProgress.find(p => p.simulationId === simulationId) || null;
  };

  // Gibt den Fortschritt in Prozent zurück
  const getProgressPercentage = async (simulationId: string): Promise<number> => {
    return await SimulationProgressService.getProgressPercentage(simulationId);
  };

  // Aktualisiert den Fortschritt einer Simulation
  const updateSimulationProgress = async (
    simulationId: string,
    simulationType: 'decision_tree' | 'skill_trainer',
    updates: Partial<SimulationProgress>
  ) => {
    try {
      await SimulationProgressService.updateProgress(simulationId, simulationType, updates);
      await loadProgress(); // Neu laden um den aktuellen Zustand zu reflektieren
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Fortschritts:', error);
    }
  };

  // Markiert eine Simulation als abgeschlossen
  const markSimulationAsCompleted = async (
    simulationId: string,
    simulationType: 'decision_tree' | 'skill_trainer',
    score?: number,
    totalQuestions?: number,
    completedNodes?: string[],
    bestPath?: boolean
  ) => {
    try {
      await SimulationProgressService.markAsCompleted(
        simulationId,
        simulationType,
        score,
        totalQuestions,
        completedNodes,
        bestPath
      );
      await loadProgress(); // Neu laden um den aktuellen Zustand zu reflektieren
    } catch (error) {
      console.error('Fehler beim Markieren als abgeschlossen:', error);
    }
  };

  // Setzt den Fortschritt einer Simulation zurück
  const resetSimulationProgress = async (simulationId: string) => {
    try {
      await SimulationProgressService.resetProgress(simulationId);
      await loadProgress(); // Neu laden um den aktuellen Zustand zu reflektieren
    } catch (error) {
      console.error('Fehler beim Zurücksetzen des Fortschritts:', error);
    }
  };

  // Setzt alle Fortschritte zurück
  const resetAllProgress = async () => {
    try {
      await SimulationProgressService.resetAllProgress();
      await loadProgress(); // Neu laden um den aktuellen Zustand zu reflektieren
    } catch (error) {
      console.error('Fehler beim Zurücksetzen aller Fortschritte:', error);
    }
  };

  // Aktualisiert die Statistiken
  const refreshStatistics = async () => {
    try {
      const stats = await SimulationProgressService.calculateStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Statistiken:', error);
    }
  };

  // Lädt die Daten beim ersten Rendern
  useEffect(() => {
    loadProgress();
  }, []);

  const value: SimulationProgressContextType = {
    // State
    allProgress,
    statistics,
    loading,
    
    // Actions
    loadProgress,
    getProgressForSimulation,
    getProgressPercentage,
    updateSimulationProgress,
    markSimulationAsCompleted,
    resetSimulationProgress,
    resetAllProgress,
    refreshStatistics
  };

  return (
    <SimulationProgressContext.Provider value={value}>
      {children}
    </SimulationProgressContext.Provider>
  );
};

// Hook für die Verwendung des Contexts
export const useSimulationProgress = (): SimulationProgressContextType => {
  const context = useContext(SimulationProgressContext);
  if (context === undefined) {
    throw new Error('useSimulationProgress must be used within a SimulationProgressProvider');
  }
  return context;
}; 