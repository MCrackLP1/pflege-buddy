/**
 * WorkTimeContext.tsx
 * Kontext für die Arbeitszeiterfassung
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkLocation, WorkTime } from '../types/types';

interface WorkTimeContextProps {
  workLocation: WorkLocation | null;
  workTimes: WorkTime[];
  activeWorkTime: WorkTime | null;
  trackingEnabled: boolean;
  setTrackingEnabled: (enabled: boolean) => void;
  setWorkLocation: (location: WorkLocation) => Promise<void>;
  deleteWorkLocation: () => Promise<void>;
  startWorkTime: () => Promise<void>;
  endWorkTime: (breakDuration: number) => Promise<void>;
  deleteWorkTime: (workTimeId: string) => Promise<void>;
}

const WorkTimeContext = createContext<WorkTimeContextProps | undefined>(undefined);

export const useWorkTime = () => {
  const context = useContext(WorkTimeContext);
  if (!context) {
    throw new Error('useWorkTime muss innerhalb eines WorkTimeProvider verwendet werden');
  }
  return context;
};

export const WorkTimeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [workLocation, setWorkLocationState] = useState<WorkLocation | null>(null);
  const [workTimes, setWorkTimes] = useState<WorkTime[]>([]);
  const [activeWorkTime, setActiveWorkTime] = useState<WorkTime | null>(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  // Lade Daten beim ersten Rendern
  useEffect(() => {
    const loadData = async () => {
      try {
        const locationJson = await AsyncStorage.getItem('workLocation');
        const timesJson = await AsyncStorage.getItem('workTimes');
        const activeTimeJson = await AsyncStorage.getItem('activeWorkTime');
        const trackingEnabledValue = await AsyncStorage.getItem('trackingEnabled');

        if (locationJson) setWorkLocationState(JSON.parse(locationJson));
        if (timesJson) setWorkTimes(JSON.parse(timesJson));
        if (activeTimeJson) setActiveWorkTime(JSON.parse(activeTimeJson));
        if (trackingEnabledValue) setTrackingEnabled(JSON.parse(trackingEnabledValue));
      } catch (error) {
        console.error('Fehler beim Laden der Arbeitszeitdaten:', error);
      }
    };

    loadData();
  }, []);

  // Speichere Work Location
  const saveWorkLocation = async (location: WorkLocation | null) => {
    try {
      if (location) {
        await AsyncStorage.setItem('workLocation', JSON.stringify(location));
      } else {
        await AsyncStorage.removeItem('workLocation');
      }
    } catch (error) {
      console.error('Fehler beim Speichern des Arbeitsortes:', error);
    }
  };

  // Speichere Work Times
  const saveWorkTimes = async (times: WorkTime[]) => {
    try {
      await AsyncStorage.setItem('workTimes', JSON.stringify(times));
    } catch (error) {
      console.error('Fehler beim Speichern der Arbeitszeiten:', error);
    }
  };

  // Speichere aktive Work Time
  const saveActiveWorkTime = async (time: WorkTime | null) => {
    try {
      if (time) {
        await AsyncStorage.setItem('activeWorkTime', JSON.stringify(time));
      } else {
        await AsyncStorage.removeItem('activeWorkTime');
      }
    } catch (error) {
      console.error('Fehler beim Speichern der aktiven Arbeitszeit:', error);
    }
  };

  // Speichere Tracking-Status
  const saveTrackingStatus = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('trackingEnabled', JSON.stringify(enabled));
    } catch (error) {
      console.error('Fehler beim Speichern des Tracking-Status:', error);
    }
  };

  // Worktime Tracking aktivieren/deaktivieren
  const handleSetTrackingEnabled = (enabled: boolean) => {
    setTrackingEnabled(enabled);
    saveTrackingStatus(enabled);
  };

  // Setze Arbeitsort
  const setWorkLocation = async (location: WorkLocation) => {
    setWorkLocationState(location);
    await saveWorkLocation(location);
    // Aktiviere Tracking automatisch, wenn ein Arbeitsort gesetzt wird
    if (!trackingEnabled) {
      setTrackingEnabled(true);
      saveTrackingStatus(true);
    }
  };

  // Lösche Arbeitsort
  const deleteWorkLocation = async () => {
    setWorkLocationState(null);
    await saveWorkLocation(null);
    // Deaktiviere Tracking, wenn der Arbeitsort gelöscht wird
    if (trackingEnabled) {
      setTrackingEnabled(false);
      saveTrackingStatus(false);
    }
  };

  // Starte Arbeitszeit
  const startWorkTime = async () => {
    if (!workLocation) return;

    const newWorkTime: WorkTime = {
      id: Date.now().toString(),
      locationId: workLocation.id,
      startTime: new Date().toISOString(),
      endTime: null,
      breakDuration: 0,
      isComplete: false
    };

    setActiveWorkTime(newWorkTime);
    await saveActiveWorkTime(newWorkTime);
  };

  // Beende Arbeitszeit
  const endWorkTime = async (breakDuration: number) => {
    if (!activeWorkTime) return;

    const completedWorkTime: WorkTime = {
      ...activeWorkTime,
      endTime: new Date().toISOString(),
      breakDuration,
      isComplete: true
    };

    const updatedWorkTimes = [...workTimes, completedWorkTime];
    setWorkTimes(updatedWorkTimes);
    setActiveWorkTime(null);
    
    await saveWorkTimes(updatedWorkTimes);
    await saveActiveWorkTime(null);
  };

  // Lösche Arbeitszeit
  const deleteWorkTime = async (workTimeId: string) => {
    const updatedWorkTimes = workTimes.filter(time => time.id !== workTimeId);
    setWorkTimes(updatedWorkTimes);
    await saveWorkTimes(updatedWorkTimes);
  };

  return (
    <WorkTimeContext.Provider
      value={{
        workLocation,
        workTimes,
        activeWorkTime,
        trackingEnabled,
        setTrackingEnabled: handleSetTrackingEnabled,
        setWorkLocation,
        deleteWorkLocation,
        startWorkTime,
        endWorkTime,
        deleteWorkTime
      }}
    >
      {children}
    </WorkTimeContext.Provider>
  );
};

export default WorkTimeProvider; 