/**
 * SimulationProgressService.ts
 * Service für das Speichern und Laden von Simulation-Fortschritten
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SimulationProgress, SimulationStatistics } from '../types/types';

const STORAGE_KEY = 'simulation_progress';

export class SimulationProgressService {
  
  /**
   * Lädt alle Simulation-Fortschritte aus dem AsyncStorage
   */
  static async loadAllProgress(): Promise<SimulationProgress[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Konvertiere Date-Strings zurück zu Date-Objekten
        return parsed.map((progress: any) => ({
          ...progress,
          completedAt: progress.completedAt ? new Date(progress.completedAt) : undefined,
          lastAttemptAt: new Date(progress.lastAttemptAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Fehler beim Laden des Simulation-Fortschritts:', error);
      return [];
    }
  }

  /**
   * Speichert alle Simulation-Fortschritte im AsyncStorage
   */
  static async saveAllProgress(progressList: SimulationProgress[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progressList));
    } catch (error) {
      console.error('Fehler beim Speichern des Simulation-Fortschritts:', error);
    }
  }

  /**
   * Lädt den Fortschritt für eine bestimmte Simulation
   */
  static async loadProgress(simulationId: string): Promise<SimulationProgress | null> {
    try {
      const allProgress = await this.loadAllProgress();
      return allProgress.find(p => p.simulationId === simulationId) || null;
    } catch (error) {
      console.error('Fehler beim Laden des Simulation-Fortschritts:', error);
      return null;
    }
  }

  /**
   * Speichert oder aktualisiert den Fortschritt einer Simulation
   */
  static async saveProgress(progress: SimulationProgress): Promise<void> {
    try {
      const allProgress = await this.loadAllProgress();
      const existingIndex = allProgress.findIndex(p => p.simulationId === progress.simulationId);
      
      if (existingIndex >= 0) {
        // Aktualisiere existierenden Fortschritt
        allProgress[existingIndex] = progress;
      } else {
        // Füge neuen Fortschritt hinzu
        allProgress.push(progress);
      }
      
      await this.saveAllProgress(allProgress);
    } catch (error) {
      console.error('Fehler beim Speichern des Simulation-Fortschritts:', error);
    }
  }

  /**
   * Erstellt einen neuen Fortschrittseintrag oder aktualisiert einen bestehenden
   */
  static async updateProgress(
    simulationId: string,
    simulationType: 'decision_tree' | 'skill_trainer',
    updates: Partial<SimulationProgress>
  ): Promise<void> {
    try {
      const existingProgress = await this.loadProgress(simulationId);
      
      const progress: SimulationProgress = {
        simulationId,
        simulationType,
        isCompleted: false,
        attempts: 1,
        lastAttemptAt: new Date(),
        ...existingProgress,
        ...updates
      };

      // Erhöhe Attempts falls es ein neuer Versuch ist
      if (existingProgress && !updates.isCompleted) {
        progress.attempts = existingProgress.attempts + 1;
      }

      await this.saveProgress(progress);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Simulation-Fortschritts:', error);
    }
  }

  /**
   * Markiert eine Simulation als abgeschlossen
   */
  static async markAsCompleted(
    simulationId: string,
    simulationType: 'decision_tree' | 'skill_trainer',
    score?: number,
    totalQuestions?: number,
    completedNodes?: string[],
    bestPath?: boolean
  ): Promise<void> {
    try {
      const updates: Partial<SimulationProgress> = {
        isCompleted: true,
        completedAt: new Date(),
        score,
        totalQuestions,
        completedNodes,
        bestPath
      };

      await this.updateProgress(simulationId, simulationType, updates);
    } catch (error) {
      console.error('Fehler beim Markieren als abgeschlossen:', error);
    }
  }

  /**
   * Berechnet Statistiken basierend auf allen Fortschritten
   */
  static async calculateStatistics(): Promise<SimulationStatistics> {
    try {
      const allProgress = await this.loadAllProgress();
      const completedProgress = allProgress.filter(p => p.isCompleted);
      
      const totalAttempts = allProgress.reduce((sum, p) => sum + p.attempts, 0);
      const averageScore = completedProgress.length > 0 
        ? completedProgress.reduce((sum, p) => sum + (p.score || 0), 0) / completedProgress.length 
        : 0;
      
      const lastActivity = allProgress.length > 0 
        ? new Date(Math.max(...allProgress.map(p => p.lastAttemptAt.getTime())))
        : new Date();

      return {
        totalSimulations: allProgress.length,
        completedSimulations: completedProgress.length,
        completionRate: allProgress.length > 0 ? (completedProgress.length / allProgress.length) * 100 : 0,
        totalAttempts,
        averageScore,
        lastActivity
      };
    } catch (error) {
      console.error('Fehler beim Berechnen der Statistiken:', error);
      return {
        totalSimulations: 0,
        completedSimulations: 0,
        completionRate: 0,
        totalAttempts: 0,
        averageScore: 0,
        lastActivity: new Date()
      };
    }
  }

  /**
   * Berechnet den Fortschritt für eine bestimmte Simulation (in Prozent)
   */
  static async getProgressPercentage(simulationId: string): Promise<number> {
    try {
      const progress = await this.loadProgress(simulationId);
      if (!progress) return 0;
      
      // Wenn die Simulation als abgeschlossen markiert ist, immer 100% zurückgeben
      if (progress.isCompleted) return 100;
      
      // Für skill_trainer: Berechne Prozentsatz basierend auf Score (nur wenn nicht abgeschlossen)
      if (progress.simulationType === 'skill_trainer' && progress.score !== undefined && progress.totalQuestions !== undefined) {
        return Math.round((progress.score / progress.totalQuestions) * 100);
      }
      
      // Für decision_tree basierend auf besuchten Knoten (nur wenn nicht abgeschlossen)
      if (progress.simulationType === 'decision_tree' && progress.completedNodes) {
        // Vereinfachte Berechnung - kann je nach Komplexität der Bäume angepasst werden
        return Math.min(progress.completedNodes.length * 20, 90); // Max 90% bis abgeschlossen
      }
      
      return progress.attempts > 0 ? 10 : 0; // Mindestens 10% wenn versucht
    } catch (error) {
      console.error('Fehler beim Berechnen des Fortschritts:', error);
      return 0;
    }
  }

  /**
   * Setzt den Fortschritt für eine bestimmte Simulation zurück
   */
  static async resetProgress(simulationId: string): Promise<void> {
    try {
      const allProgress = await this.loadAllProgress();
      const filteredProgress = allProgress.filter(p => p.simulationId !== simulationId);
      await this.saveAllProgress(filteredProgress);
    } catch (error) {
      console.error('Fehler beim Zurücksetzen des Fortschritts:', error);
    }
  }

  /**
   * Setzt alle Fortschritte zurück
   */
  static async resetAllProgress(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Fehler beim Zurücksetzen aller Fortschritte:', error);
    }
  }
} 