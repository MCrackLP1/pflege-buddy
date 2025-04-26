import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ToastAndroid, Platform } from 'react-native';
import locationTrackingService from '../services/NativeLocationTrackingService';
import { serviceEventEmitter } from '../services/serviceEmitter';

// Eigene Toast-Funktion, damit wir keine externe Abhängigkeit brauchen
const showToast = (message: string, isError: boolean = false): void => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(
      message,
      isError ? ToastAndroid.LONG : ToastAndroid.SHORT
    );
  }
  // iOS: Hier könnte man später eine Alert-Implementierung hinzufügen
};

interface LocationStatusEvent {
  status: string;
  latitude: number;
  longitude: number;
  isAtWorkLocation: boolean;
}

// Event-Typ aus serviceEmitter
interface LocationStatusData {
  isAtWorkLocation: boolean;
  status?: string;
  latitude?: number;
  longitude?: number;
}

const LocationTestComponent = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatusEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Mock-Arbeitsort zum Testen
  const mockWorkLocation = {
    id: 'test-location',
    name: 'Test Arbeitsort',
    address: 'Teststraße 1, 10115 Berlin',
    latitude: 52.520008,
    longitude: 13.404954,
    radius: 100
  };

  useEffect(() => {
    // Prüfe initialen Tracking-Status
    checkTrackingStatus();

    // Event-Listener für Standortänderungen
    const locationSubscription = serviceEventEmitter.on(
      'location_status_changed',
      handleLocationUpdate
    );

    // Logs-Array auf maximal 20 Einträge beschränken
    if (logs.length > 20) {
      setLogs(logs.slice(Math.max(logs.length - 20, 0)));
    }

    return () => {
      serviceEventEmitter.removeListener('location_status_changed', locationSubscription);
    };
  }, [logs]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, `[${timestamp}] ${message}`]);
  };

  const checkTrackingStatus = async () => {
    try {
      const trackingActive = await locationTrackingService.isTracking();
      setIsTracking(trackingActive);
      addLog(`Tracking-Status: ${trackingActive ? 'Aktiv' : 'Inaktiv'}`);
    } catch (error) {
      addLog(`Fehler bei Statusprüfung: ${error}`);
    }
  };

  const handleLocationUpdate = (data: LocationStatusData) => {
    const event: LocationStatusEvent = {
      status: data.status || 'unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      isAtWorkLocation: data.isAtWorkLocation
    };
    
    setLocationStatus(event);
    addLog(`Standort-Update: ${event.status}, Lat: ${event.latitude}, Lng: ${event.longitude}`);
  };

  const startTracking = async () => {
    try {
      addLog('Starte Standort-Tracking...');
      const result = await locationTrackingService.startTracking(mockWorkLocation);
      
      if (result) {
        setIsTracking(true);
        addLog('Standort-Tracking erfolgreich gestartet');
        showToast('Standort-Tracking gestartet');
      } else {
        addLog('Standort-Tracking konnte nicht gestartet werden');
        showToast('Fehler beim Starten des Tracking', true);
      }
    } catch (error) {
      addLog(`Fehler beim Starten: ${error}`);
      showToast('Fehler beim Starten des Tracking', true);
    }
  };

  const stopTracking = async () => {
    try {
      addLog('Stoppe Standort-Tracking...');
      const result = await locationTrackingService.stopTracking();
      
      if (result) {
        setIsTracking(false);
        addLog('Standort-Tracking erfolgreich gestoppt');
        showToast('Standort-Tracking gestoppt');
      } else {
        addLog('Standort-Tracking konnte nicht gestoppt werden');
        showToast('Fehler beim Stoppen des Tracking', true);
      }
    } catch (error) {
      addLog(`Fehler beim Stoppen: ${error}`);
      showToast('Fehler beim Stoppen des Tracking', true);
    }
  };

  const forceLocationCheck = () => {
    try {
      addLog('Erzwinge Standort-Update...');
      locationTrackingService.forceLocationCheck();
    } catch (error) {
      addLog(`Fehler bei Standortabfrage: ${error}`);
      showToast('Fehler bei Standortabfrage', true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Standort-Tracking Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: <Text style={isTracking ? styles.active : styles.inactive}>
            {isTracking ? 'Aktiv' : 'Inaktiv'}
          </Text>
        </Text>
        
        {locationStatus && (
          <View>
            <Text style={styles.statusText}>
              Ort-Status: <Text style={locationStatus.isAtWorkLocation ? styles.inside : styles.outside}>
                {locationStatus.isAtWorkLocation ? 'Innerhalb' : 'Außerhalb'}
              </Text>
            </Text>
            <Text style={styles.locationText}>
              Lat: {locationStatus.latitude.toFixed(6)}, Lng: {locationStatus.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title={isTracking ? "Tracking stoppen" : "Tracking starten"}
          onPress={isTracking ? stopTracking : startTracking}
          color={isTracking ? "#e74c3c" : "#2ecc71"}
        />
        
        <Button
          title="Standort aktualisieren"
          onPress={forceLocationCheck}
          color="#3498db"
          disabled={!isTracking}
        />
        
        <Button
          title="Status prüfen"
          onPress={checkTrackingStatus}
          color="#f39c12"
        />
      </View>
      
      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Log-Einträge:</Text>
        <ScrollView style={styles.logScroll}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logEntry}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  active: {
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  inactive: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  inside: {
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  outside: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  logContainer: {
    flex: 1,
    minHeight: 200,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logScroll: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    maxHeight: 200,
  },
  logEntry: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
});

export default LocationTestComponent; 