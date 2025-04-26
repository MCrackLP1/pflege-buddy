/**
 * WorkLocationMapScreen.tsx
 * Google Maps Integration zur Auswahl des Arbeitsortes
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Platform,
  Linking 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import Geolocation from 'react-native-geolocation-service';
import WebView from 'react-native-webview';
import { WebViewMessageEvent } from 'react-native-webview';

// Import Typen
import { RootStackParamList, WorkLocation } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';
import { useWorkTime } from '../context/WorkTimeContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';
import { requestLocationPermission } from '../utils/permissions';

type WorkLocationMapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkLocationMap'>;
type WorkLocationMapRouteProp = RouteProp<RootStackParamList, 'WorkLocationMap'>;

// Google API Key aus der Anfrage
const GOOGLE_API_KEY = 'AIzaSyCUHxcN5GINYKlQu43YXucFlhf_PDixp7A';

// Direkter Fallback-Modus ohne Versuch, Google Maps zu laden (nützlich bei bekannten API-Key-Problemen)
const USE_DIRECT_FALLBACK = false;

const DEFAULT_RADIUS = 100; // 100 Meter als Standard-Radius

const WorkLocationMapScreen: React.FC = () => {
  const navigation = useNavigation<WorkLocationMapScreenNavigationProp>();
  const route = useRoute<WorkLocationMapRouteProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView | null>(null);
  const [locationUpdateInterval, setLocationUpdateInterval] = useState<NodeJS.Timeout | null>(null);

  const { workLocation, setWorkLocation } = useWorkTime();

  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(
    route.params?.initialLocation || null
  );
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [useFallbackUI, setUseFallbackUI] = useState(false);

  // Verbesserte Funktion zum Senden des Standorts an die WebView
  const sendLocationToWebView = (latitude: number, longitude: number) => {
    if (webViewRef.current && !useFallbackUI && !loading) {
      console.log('Sende Standort an WebView:', latitude, longitude);
      webViewRef.current.injectJavaScript(`
        if (typeof setSpecificLocation === 'function') {
          setSpecificLocation(${latitude}, ${longitude}, ${radius});
        }
        true;
      `);
    }
  };

  // Bereinige den Intervall, wenn die Komponente unmountet
  useEffect(() => {
    return () => {
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
      }
    };
  }, [locationUpdateInterval]);

  // Sofortiger Versuch, die aktuelle Position zu erhalten
  useEffect(() => {
    // Wenn direkter Fallback-Modus aktiv ist, direkt in den Fallback-Modus gehen
    if (USE_DIRECT_FALLBACK) {
      console.log('Direkter Fallback-Modus aktiviert, überspringe Map-Laden');
      setMapError('Karte wird nicht geladen. Direkter Fallback-Modus aktiv.');
      setUseFallbackUI(true);
      getCurrentPosition(); // Hole trotzdem die Position
    } else {
      requestLocationPermission().then((hasPermission: boolean) => {
        if (hasPermission) {
          getCurrentPosition();
        } else {
          setMapError('Standortberechtigung verweigert.');
          setUseFallbackUI(true);
        }
      });
    }

    // Starte den Intervall nur einmal
    return () => {
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
      }
    };
  }, []);

  // Aktualisiere die WebView, wenn ein Standort ausgewählt wurde oder sich der Radius ändert
  useEffect(() => {
    if (selectedLocation && !loading) {
      sendLocationToWebView(selectedLocation.latitude, selectedLocation.longitude);
    }
  }, [selectedLocation, radius, loading]);

  // Aktualisierte getCurrentPosition-Funktion mit besserer Fehlerbehandlung und Intervall-Setup
  const getCurrentPosition = () => {
    console.log('Versuche nativen Standort zu erhalten...');
    
    // Zeige Ladeindikator während der Standortabfrage
    setLoading(true);
    
    Geolocation.getCurrentPosition(
      position => {
        console.log('Native Standortabfrage erfolgreich:', position.coords);
        const { latitude, longitude } = position.coords;
        setSelectedLocation({ latitude, longitude });
        setLoading(false);
        
        // Sende den Standort an die WebView, anstatt ihn direkt hier zu verarbeiten
        sendLocationToWebView(latitude, longitude);
      },
      error => {
        console.log('Geolocation error', error);
        setLoading(false);
        
        if (error.code === 1) { // PERMISSION_DENIED
          console.log('Standortberechtigung verweigert (native)');
          setMapError('Standortberechtigung verweigert. Bitte überprüfen Sie Ihre Geräteeinstellungen und erteilen Sie der App Zugriff auf Ihren Standort.');
          
          // Zeige Dialog mit Option zum Öffnen der Einstellungen
          Alert.alert(
            'Standortzugriff verweigert',
            'Die App benötigt Zugriff auf Ihren Standort. Bitte öffnen Sie die Einstellungen, um den Standortzugriff zu erlauben.',
            [
              { 
                text: 'Einstellungen öffnen', 
                onPress: () => {
                  Linking.openSettings().catch(() => {
                    Alert.alert('Fehler', 'Die Einstellungen konnten nicht geöffnet werden.');
                  });
                }
              },
              { text: 'Ohne Standort fortfahren', onPress: () => setUseFallbackUI(true) }
            ]
          );
        } else {
          setMapError(`Fehler beim Abrufen des Standorts: ${error.message}`);
          setUseFallbackUI(true);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Initialisierte HTML-Inhalt-Funktion mit verbesserten Einstellungen
  const getMapHtml = () => {
    console.log('Erstelle Map-HTML mit Fallback-Optionen');
    
    // Verwende die interaktive Google Maps API statt statischer Bilder
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script>
          // Fehlerbehandlung für API-Laden
          window.gm_authFailure = function() {
            console.error('Google Maps Authentication fehlgeschlagen');
            document.getElementById('loadingIndicator').classList.add('hidden');
            document.getElementById('map').classList.add('hidden');
            document.getElementById('fallbackMap').classList.remove('hidden');
            document.getElementById('errorContainer').textContent = "Google Maps API konnte nicht authentifiziert werden. Bitte überprüfen Sie den API-Schlüssel.";
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapError',
              error: 'Google Maps Authentication fehlgeschlagen'
            }));
          };
          
          // Timeout für API-Laden
          var mapsApiTimeout = setTimeout(function() {
            if (typeof google === 'undefined' || !google.maps) {
              console.error('Google Maps API Timeout');
              document.getElementById('loadingIndicator').classList.add('hidden');
              document.getElementById('map').classList.add('hidden');
              document.getElementById('fallbackMap').classList.remove('hidden');
              document.getElementById('errorContainer').textContent = "Zeitüberschreitung beim Laden der Google Maps API.";
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapError',
                error: 'Zeitüberschreitung beim Laden der Google Maps API'
              }));
            }
          }, 20000);
        </script>
        <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places" async defer
          onerror="window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapError', error: 'Fehler beim Laden der Google Maps API' }));"
        ></script>
        <style>
          html, body {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            font-family: Arial, sans-serif;
          }
          #map {
            height: 100%;
            width: 100%;
          }
          .controls {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            z-index: 10;
          }
          button {
            background-color: white;
            border: none;
            border-radius: 4px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            cursor: pointer;
            padding: 12px 16px;
            margin: 0 8px;
            font-weight: bold;
          }
          .loading-indicator {
            text-align: center;
            padding: 20px;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 100;
          }
          .hidden {
            display: none;
          }
          #fallbackMap {
            height: 100%;
            width: 100%;
            background-color: #e8e8e8;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
          }
          .fallback-grid {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: linear-gradient(rgba(200,200,200,0.5) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(200,200,200,0.5) 1px, transparent 1px);
            background-size: 20px 20px;
          }
          .error-message {
            color: red;
            background-color: rgba(255, 255, 255, 0.8);
            padding: 8px 16px;
            border-radius: 4px;
            margin-top: 10px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="loading-indicator" id="loadingIndicator">
          <p>Karte wird geladen...</p>
        </div>
        <div id="fallbackMap" class="hidden">
          <div class="fallback-grid"></div>
          <p>Karte konnte nicht geladen werden.</p>
          <div id="errorContainer" class="error-message"></div>
        </div>
        <script>
          // Globale Variablen
          let map;
          let marker;
          let circle;
          let geocoder;
          let searchBox;
          let currentRadius = ${radius};
          
          // Warten auf die Verfügbarkeit des Google-Objekts
          function waitForGoogleMaps() {
            if (typeof google !== 'undefined' && google.maps) {
              initMap();
            } else {
              setTimeout(waitForGoogleMaps, 100);
            }
          }
          
          // Initialisiere die Karte
          function initMap() {
            try {
              console.log('Google Maps wird initialisiert');
              document.getElementById('loadingIndicator').classList.add('hidden');
              
              const initialLat = ${selectedLocation ? selectedLocation.latitude : 52.520008};
              const initialLng = ${selectedLocation ? selectedLocation.longitude : 13.404954};
              
              map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: initialLat, lng: initialLng },
                zoom: 15,
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP
              });
              
              // Marker für die Standortauswahl erstellen
              marker = new google.maps.Marker({
                position: { lat: initialLat, lng: initialLng },
                map: map,
                draggable: true,
                animation: google.maps.Animation.DROP,
                title: 'Arbeitsort'
              });
              
              // Kreis für den Radius zeichnen
              circle = new google.maps.Circle({
                strokeColor: '#4285F4',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#4285F4',
                fillOpacity: 0.2,
                map: map,
                center: { lat: initialLat, lng: initialLng },
                radius: currentRadius,
                editable: false  // Nicht editierbar per Mausbedienung
              });
              
              // Event-Listener für Marker-Bewegung
              google.maps.event.addListener(marker, 'dragend', function() {
                const position = marker.getPosition();
                if (position) {
                  circle.setCenter(position);
                  
                  // Sende Daten an React Native
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'locationSelected',
                    latitude: position.lat(),
                    longitude: position.lng()
                  }));
                  
                  // Adresse auflösen
                  geocodePosition(position);
                }
              });
              
              // Klick auf der Karte bewegt den Marker
              google.maps.event.addListener(map, 'click', function(event) {
                marker.setPosition(event.latLng);
                circle.setCenter(event.latLng);
                
                // Sende Daten an React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'locationSelected',
                  latitude: event.latLng.lat(),
                  longitude: event.latLng.lng()
                }));
                
                // Adresse auflösen
                geocodePosition(event.latLng);
              });
              
              // Geocoder für Adressauflösung
              geocoder = new google.maps.Geocoder();
              
              // Adresse des initialen Standorts auflösen
              if (initialLat && initialLng) {
                geocodePosition({ lat: function() { return initialLat; }, lng: function() { return initialLng; } });
              }
              
              // Signal an React Native, dass die Karte bereit ist
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapReady'
              }));
            } catch (error) {
              console.error('Fehler beim Initialisieren der Karte:', error);
              showFallbackUI("Fehler beim Initialisieren der Karte: " + error.message);
            }
          }
          
          // Funktionen für externe Aufrufe aus React Native
          window.setSpecificLocation = function(lat, lng, radius) {
            if (!map || !marker || !circle) {
              console.error('Karte ist noch nicht initialisiert');
              return;
            }
            
            try {
              console.log('Setze spezifischen Standort:', lat, lng);
              const newPos = new google.maps.LatLng(lat, lng);
              
              marker.setPosition(newPos);
              circle.setCenter(newPos);
              map.setCenter(newPos);
              
              if (radius && radius !== currentRadius) {
                circle.setRadius(radius);
                currentRadius = radius;
              }
              
              // Adresse auflösen
              geocodePosition(newPos);
            } catch (error) {
              console.error('Fehler beim Setzen des Standorts:', error);
              showFallbackUI("Fehler beim Setzen des Standorts: " + error.message);
            }
          };
          
          // Radius aktualisieren
          window.updateRadius = function(newRadius) {
            if (!circle) return;
            
            try {
              console.log('Aktualisiere Radius:', newRadius);
              circle.setRadius(newRadius);
              currentRadius = newRadius;
            } catch (error) {
              console.error('Fehler beim Aktualisieren des Radius:', error);
            }
          };
          
          // Adresse auflösen
          function geocodePosition(pos) {
            console.log('Löse Adresse auf für:', pos.lat(), pos.lng());
            
            if (!google || !google.maps || !google.maps.Geocoder) {
              console.error('Geocoder nicht verfügbar');
              return;
            }
            
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({
              'location': { lat: pos.lat(), lng: pos.lng() }
            }, function(results, status) {
              if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                console.log('Adresse gefunden:', results[0].formatted_address);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'addressResolved',
                  address: results[0].formatted_address
                }));
              } else {
                console.error('Fehler bei der Adressauflösung:', status);
              }
            });
          }
          
          // Ortssuche durchführen
          window.searchPlace = function(query) {
            console.log('WebView: searchPlace aufgerufen mit:', query);
            
            if (!map) {
              console.error('WebView: Karte ist noch nicht initialisiert');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'searchError',
                error: 'Karte ist noch nicht initialisiert'
              }));
              return;
            }
            
            try {
              if (typeof google !== 'undefined' && google.maps && google.maps.places) {
                console.log('WebView: Places API verfügbar, starte Suche');
                const placesService = new google.maps.places.PlacesService(map);
                
                // Verwende textSearch mit möglichst wenigen Einschränkungen für beste Ergebnisse
                placesService.textSearch({
                  query: query,
                  // Keine type-Einschränkung, um die Suche breiter zu halten
                }, function(results, status) {
                  console.log('WebView: Places API Antwort Status:', status);
                  console.log('WebView: Anzahl der Ergebnisse:', results ? results.length : 0);
                  
                  if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                    const place = results[0];
                    console.log('WebView: Erster Ort gefunden:', place.name);
                    
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    
                    console.log('WebView: Koordinaten:', lat, lng);
                    
                    const newPos = new google.maps.LatLng(lat, lng);
                    marker.setPosition(newPos);
                    circle.setCenter(newPos);
                    map.setCenter(newPos);
                    map.setZoom(16);
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'locationSelected',
                      latitude: lat,
                      longitude: lng,
                      address: place.formatted_address || place.name
                    }));
                  } else {
                    console.error('WebView: Places API Fehler oder keine Ergebnisse. Status:', status);
                    
                    // Fallback: Direkt die Geocoding API verwenden
                    console.log('WebView: Versuche Fallback mit Geocoding API');
                    geocodeAddress(query);
                  }
                });
              } else {
                console.error('WebView: Places API nicht verfügbar, google Objekt prüfen:', typeof google, google ? typeof google.maps : 'undefined', google && google.maps ? typeof google.maps.places : 'undefined');
                
                // Fallback: Wenn Places API nicht verfügbar ist, verwende Geocoding
                console.log('WebView: Verwende Geocoding als Fallback');
                geocodeAddress(query);
              }
            } catch (error) {
              console.error('WebView: Fehler bei der Suche:', error);
              
              // Versuche im Fehlerfall den Geocoding-Fallback
              console.log('WebView: Fehler aufgetreten, versuche Geocoding als Fallback');
              try {
                geocodeAddress(query);
              } catch (geocodeError) {
                console.error('WebView: Auch Geocoding fehlgeschlagen:', geocodeError);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'searchError',
                  error: 'Suche fehlgeschlagen, auch Geocoding konnte nicht durchgeführt werden.'
                }));
              }
            }
          };
          
          // Geocodierung einer Adresse
          window.geocodeAddress = function(address) {
            console.log('WebView: Versuche Geocoding für:', address);
            
            if (!google || !google.maps || !google.maps.Geocoder) {
              console.error('WebView: Geocoder nicht verfügbar');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'searchError',
                error: 'Geocoding-API nicht verfügbar'
              }));
              return;
            }
            
            try {
              const geocoder = new google.maps.Geocoder();
              console.log('WebView: Geocoder-Instanz erstellt, führe Geocoding durch');
              
              geocoder.geocode({ 'address': address }, function(results, status) {
                console.log('WebView: Geocoding-Ergebnis Status:', status);
                
                if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                  console.log('WebView: Geocoding erfolgreich, Ergebnis:', results[0].formatted_address);
                  
                  const location = results[0].geometry.location;
                  const lat = location.lat();
                  const lng = location.lng();
                  
                  const newPos = new google.maps.LatLng(lat, lng);
                  marker.setPosition(newPos);
                  circle.setCenter(newPos);
                  map.setCenter(newPos);
                  map.setZoom(16);
                  
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'locationSelected',
                    latitude: lat,
                    longitude: lng,
                    address: results[0].formatted_address
                  }));
                } else {
                  console.error('WebView: Geocoding fehlgeschlagen:', status);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'searchError',
                    error: 'Adresse konnte nicht gefunden werden. Status: ' + status
                  }));
                }
              });
            } catch (error) {
              console.error('WebView: Fehler beim Geocoding:', error);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'searchError',
                error: 'Fehler bei der Adresssuche: ' + error.message
              }));
            }
          };
          
          // Zeigt die Fallback-UI an
          function showFallbackUI(errorMessage) {
            document.getElementById('map').classList.add('hidden');
            document.getElementById('loadingIndicator').classList.add('hidden');
            
            const fallbackMap = document.getElementById('fallbackMap');
            fallbackMap.classList.remove('hidden');
            
            if (errorMessage) {
              const errorContainer = document.getElementById('errorContainer');
              errorContainer.textContent = errorMessage;
            }
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapError',
              error: errorMessage || 'Karte konnte nicht geladen werden'
            }));
          }
          
          // Starte die Initialisierung
          window.onload = function() {
            try {
              waitForGoogleMaps();
              
              // Zuätzliche direkte Methode zur Fehlerbehandlung für die WebView
              window.logFromWebView = function(message) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'debug',
                  message: message
                }));
              };
              
              // Timeout, der beim Laden das Maps-Timeout löscht
              clearTimeout(mapsApiTimeout);
            } catch (error) {
              console.error('Fehler beim Warten auf Google Maps:', error);
              showFallbackUI("Fehler beim Laden von Google Maps: " + error.message);
            }
          };
        </script>
      </body>
      </html>
    `;
  };

  // Initialisiere Edit-Modus wenn ein LocationId Parameter übergeben wurde
  useEffect(() => {
    if (route.params?.editLocationId && workLocation) {
      setIsEditMode(true);
      setLocationName(workLocation.name);
      setLocationAddress(workLocation.address);
      setRadius(workLocation.radius);
      setSelectedLocation({
        latitude: workLocation.latitude,
        longitude: workLocation.longitude
      });
    }
  }, [route.params, workLocation]);

  // Prüfen und anfordern der Standortberechtigungen vor dem Laden der Karte
  useEffect(() => {
    const checkLocationPermissions = async () => {
      try {
        // Prüfe zuerst die Berechtigung über die Permissions API
        const hasPermission = await requestLocationPermission();
        console.log('Standortberechtigung Ergebnis:', hasPermission);
        
        if (!hasPermission) {
          console.log('Keine Standortberechtigung, schalte auf Fallback-Modus');
          setMapError('Standortberechtigung fehlt. Bitte überprüfen Sie Ihre Einstellungen.');
          setUseFallbackUI(true);
          return;
        }
        
        // Auch wenn Berechtigung erteilt wurde, versuche den Standort zu holen
        // Dies ist ein Doppelcheck, da manchmal die Berechtigungen widersprüchlich sein können
        Geolocation.getCurrentPosition(
          (position) => {
            console.log('Native Position erhalten:', position);
            if (!selectedLocation) {
              setSelectedLocation({
                latitude: position.coords.latitude, 
                longitude: position.coords.longitude
              });
            }
          },
          (error) => {
            console.log('Fehler bei nativer Standortermittlung trotz Berechtigung:', error);
            
            // Bei Fehler wird nicht sofort auf Fallback umgeschaltet, da WebView möglicherweise trotzdem funktioniert
            if (error.code === 1) { // PERMISSION_DENIED
              console.log('Standortberechtigung verweigert, obwohl laut API erteilt');
              // Trotzdem versuchen wir es mit der WebView, falls das dort funktioniert
            }
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } catch (error) {
        console.error('Fehler beim Prüfen der Standortberechtigungen:', error);
      }
    };

    checkLocationPermissions();
  }, []);

  // Verarbeite Nachrichten von der WebView
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('WebView-Nachricht empfangen:', message.type);
      
      switch (message.type) {
        case 'mapReady':
          console.log('Karte ist bereit für Interaktionen');
          setLoading(false);
          if (selectedLocation) {
            sendLocationToWebView(selectedLocation.latitude, selectedLocation.longitude);
          }
          break;
          
        case 'mapError':
          console.error('Map-Fehler:', message.error);
          setMapError(message.error);
          setUseFallbackUI(true);
          setLoading(false);
          break;
          
        case 'locationSelected':
          console.log('Standort ausgewählt:', message.latitude, message.longitude);
          // Update des ausgewählten Standorts und der Adresse, falls vorhanden
          setSelectedLocation({
            latitude: message.latitude,
            longitude: message.longitude
          });
          
          if (message.address) {
            console.log('Mit Adresse:', message.address);
            setLocationAddress(message.address);
          }
          break;
          
        case 'addressResolved':
          console.log('Adresse aufgelöst:', message.address);
          // Wenn eine Adresse aufgelöst wurde
          if (message.address) {
            setLocationAddress(message.address);
          }
          break;
          
        case 'searchError':
          // Fehler bei der Suche
          console.error('Suchfehler:', message.error);
          Alert.alert(
            'Fehler bei der Ortssuche',
            message.error || 'Unbekannter Fehler bei der Suche',
            [{ text: 'OK' }]
          );
          break;
          
        case 'debug':
          // Debugging-Nachricht
          console.log('WebView Debug:', message.message);
          break;
          
        default:
          console.warn('Unbekannter Nachrichtentyp:', message.type, message);
      }
    } catch (error) {
      console.error('Fehler beim Verarbeiten der WebView-Nachricht:', error, 'Rohdaten:', event.nativeEvent.data);
      
      // Versuche, die Fehlermeldung dem Benutzer anzuzeigen
      Alert.alert(
        'Fehler bei der Karteninteraktion',
        'Es gab ein Problem bei der Verarbeitung von Kartendaten. Bitte versuchen Sie es erneut.',
        [{ text: 'OK' }]
      );
    }
  };

  // Aktualisiere den Radius auf der Karte
  useEffect(() => {
    if (webViewRef.current && !loading) {
      webViewRef.current.injectJavaScript(`
        updateCircleRadius(${radius});
        true;
      `);
    }
  }, [radius, loading]);

  // Ortssuche
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Bitte geben Sie einen Suchbegriff ein.');
      return;
    }
    
    if (webViewRef.current && !useFallbackUI) {
      console.log('Suche nach Ort:', searchQuery);
      
      // Sicherstellen, dass der Suchbegriff korrekt in JSON escaped wird
      const escapedQuery = JSON.stringify(searchQuery);
      
      webViewRef.current.injectJavaScript(`
        console.log('WebView: Starte Suche für ' + ${escapedQuery});
        
        try {
          if (typeof searchPlace === 'function') {
            searchPlace(${escapedQuery});
          } else {
            console.error('WebView: searchPlace Funktion nicht gefunden');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'searchError',
              error: 'Suchfunktion ist nicht verfügbar'
            }));
          }
        } catch(error) {
          console.error('WebView: Fehler bei der Suche', error);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'searchError',
            error: 'Fehler bei der Suche: ' + error.message
          }));
        }
        true;
      `);
    } else {
      Alert.alert(
        'Fehler bei der Ortssuche',
        'Die Karte ist nicht verfügbar oder wird noch geladen.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle Speichern des Arbeitsortes
  const handleSaveLocation = () => {
    if (!locationName.trim()) {
      Alert.alert(
        'Fehler',
        'Bitte geben Sie einen Namen für den Arbeitsort ein.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!selectedLocation) {
      Alert.alert(
        'Fehler',
        'Bitte wählen Sie einen Standort auf der Karte aus.',
        [{ text: 'OK' }]
      );
      return;
    }

    const newLocation: WorkLocation = {
      id: isEditMode && workLocation ? workLocation.id : Date.now().toString(),
      name: locationName,
      address: locationAddress,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      radius: radius
    };

    setWorkLocation(newLocation)
      .then(() => {
        navigation.goBack();
      })
      .catch(error => {
        console.error('Fehler beim Speichern des Arbeitsortes:', error);
        Alert.alert('Fehler', 'Der Arbeitsort konnte nicht gespeichert werden.');
      });
  };

  // WebView Container mit verbesserten Einstellungen
  const WebViewContainer: React.FC = () => {
    return (
      <View style={[localStyles.mapContainer, { overflow: 'hidden', flex: 1.5 }]}>
        {loading && (
          <View style={localStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#32b8ca" />
            <Text style={[styles.itemTitle, { marginTop: 10 }]}>Karte wird geladen...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: getMapHtml() }}
          onMessage={handleWebViewMessage}
          style={[localStyles.map, { opacity: loading ? 0 : 1 }]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          geolocationEnabled={true}
          cacheEnabled={true}
          onShouldStartLoadWithRequest={() => true}
          scalesPageToFit={true}
          scrollEnabled={false}
          bounces={false}
          startInLoadingState={true}
          decelerationRate={Platform.OS === 'ios' ? 0.998 : 0.5}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          contentInset={{top: 0, right: 0, bottom: 0, left: 0}}
          javaScriptCanOpenWindowsAutomatically={false}
          renderLoading={() => <View />}
          onLoad={() => {
            console.log('WebView vollständig geladen');
          }}
          onLoadEnd={() => {
            console.log('WebView Laden abgeschlossen');
            setLoading(false);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            setMapError(`WebView Fehler: ${nativeEvent.description}`);
            setUseFallbackUI(true);
          }}
        />
      </View>
    );
  };

  // Erstelle lokale Styles für den Fallback-Modus
  const localStyles = StyleSheet.create({
    fallbackContainer: {
      flex: 1,
      position: 'relative',
      backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
    },
    fallbackMap: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#e8e8e8',
      position: 'relative',
    },
    fallbackGrid: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      // Raster-Stil
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
      // Da backgroundImage in React Native nicht unterstützt wird, könnten wir später
      // ein tatsächliches Raster mit View-Komponenten erstellen
    },
    marker: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 30,
      height: 30,
      marginLeft: -15,
      marginTop: -30,
      backgroundColor: '#e74c3c',
      borderRadius: 15,
      borderWidth: 3,
      borderColor: theme === 'dark' ? '#333' : 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    circle: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -50 }, { translateY: -50 }],
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: '#32b8ca',
      backgroundColor: 'rgba(50, 184, 202, 0.15)',
    },
    fallbackControls: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      padding: 10,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginHorizontal: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    buttonText: {
      color: theme === 'dark' ? '#f0f0f0' : '#444',
      fontWeight: 'bold',
    },
    errorContainer: {
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      backgroundColor: theme === 'dark' ? 'rgba(33, 33, 33, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderRadius: 8,
      padding: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    errorText: {
      color: '#e74c3c',
      marginBottom: 8,
      fontWeight: 'bold',
    },
    helpText: {
      color: theme === 'dark' ? '#cccccc' : '#333',
      lineHeight: 18,
    },
    locationInfo: {
      position: 'absolute',
      top: 100,
      left: 20,
      right: 20,
      backgroundColor: theme === 'dark' ? 'rgba(33, 33, 33, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderRadius: 8,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    locationText: {
      textAlign: 'center',
      color: theme === 'dark' ? '#f0f0f0' : '#333',
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    },
    mapContainer: {
      flex: 1,
      overflow: 'hidden',
    },
    map: {
      flex: 1,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
      borderRadius: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      padding: 5,
    },
    searchInput: {
      flex: 1,
      height: 40,
      paddingHorizontal: 10,
      color: theme === 'dark' ? '#f0f0f0' : '#333',
    },
    searchButton: {
      padding: 10,
      backgroundColor: '#32b8ca',
      borderRadius: 5,
    },
    detailsContainer: {
      padding: 16,
      backgroundColor: theme === 'dark' ? '#1e1e1e' : 'white',
    },
    inputContainer: {
      marginBottom: 16,
    },
    textInput: {
      height: 40,
      borderColor: theme === 'dark' ? '#444444' : '#cccccc',
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 8,
      backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
      color: theme === 'dark' ? '#f0f0f0' : '#333',
    },
    slider: {
      width: '100%',
      height: 40,
    },
    saveButton: {
      backgroundColor: '#32b8ca',
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    saveButtonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      marginLeft: 8,
    },
  });

  // Fallback UI für Kartenansicht ohne Google Maps
  const FallbackMapView = () => {
    return (
      <View style={localStyles.fallbackContainer}>
        <View style={localStyles.fallbackMap}>
          <View style={localStyles.fallbackGrid}></View>
          <View style={localStyles.marker}></View>
          <View style={[localStyles.circle, { width: radius * 2, height: radius * 2 }]}></View>
        </View>
        
        {mapError && (
          <View style={localStyles.errorContainer}>
            <Text style={localStyles.errorText}>{mapError}</Text>
            <Text style={localStyles.helpText}>
              Sie können auch ohne Karte einen Standort festlegen.
              Verwenden Sie den "Mein Standort" Button um Ihre aktuelle Position zu verwenden.
            </Text>
          </View>
        )}
        
        {selectedLocation && (
          <View style={localStyles.locationInfo}>
            <Text style={localStyles.locationText}>
              <Text style={{fontWeight: 'bold'}}>Aktueller Standort:</Text>
            </Text>
            <Text style={localStyles.locationText}>
              {locationAddress || `Koordinaten: ${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`}
            </Text>
            <Text style={[localStyles.locationText, {marginTop: 5, fontSize: 12, color: '#666'}]}>
              Erfassungsradius: {radius} m
            </Text>
          </View>
        )}
        
        <View style={localStyles.fallbackControls}>
          <TouchableOpacity 
            style={localStyles.button}
            onPress={getCurrentPosition}
          >
            <Icon name="locate" size={18} color="#32b8ca" style={{marginRight: 5}} />
            <Text style={localStyles.buttonText}>Mein Standort</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[localStyles.button, {backgroundColor: '#32b8ca'}]}
            onPress={handleSaveLocation}
          >
            <Icon name="checkmark-circle" size={18} color="#fff" style={{marginRight: 5}} />
            <Text style={[localStyles.buttonText, {color: '#fff'}]}>Standort bestätigen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.headerContainer, { 
        paddingTop: Math.max(insets.top, 10), 
        paddingBottom: 10,
        paddingHorizontal: 16,
        zIndex: 10
      }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{ marginRight: 10 }}
          >
            <Icon name="arrow-back" size={24} color={theme === 'dark' ? '#ffffff' : '#000000'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Arbeitsort bearbeiten' : 'Neuen Arbeitsort hinzufügen'}
          </Text>
        </View>
      </View>

      <View style={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: theme === 'dark' ? '#121212' : '#f9f9f9',
        zIndex: 5
      }}>
        <View style={[localStyles.searchContainer, { 
          backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
          borderColor: theme === 'dark' ? '#444444' : 'transparent',
          borderWidth: theme === 'dark' ? 1 : 0
        }]}>
          <TextInput
            style={[
              localStyles.searchInput,
              { color: theme === 'dark' ? '#ffffff' : '#000000' }
            ]}
            placeholder="Nach Orten, Adressen suchen..."
            placeholderTextColor={theme === 'dark' ? '#999999' : '#999999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={localStyles.searchButton} 
            onPress={handleSearch}
          >
            <Icon name="search" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {useFallbackUI ? (
        <FallbackMapView />
      ) : (
        <>
          <WebViewContainer />
          
          {loading && (
            <View style={[localStyles.loadingContainer, {
              backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'
            }]}>
              <ActivityIndicator size="large" color="#32b8ca" />
              <Text style={[styles.itemTitle, { marginTop: 10, color: theme === 'dark' ? '#ffffff' : '#000000' }]}>Karte wird geladen...</Text>
            </View>
          )}
        </>
      )}

      <ScrollView 
        style={[localStyles.detailsContainer, { 
          flex: 0.7,
          backgroundColor: theme === 'dark' ? '#1e1e1e' : 'white'
        }]} 
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[localStyles.inputContainer, {marginBottom: 5}]}>
          <Text style={[styles.itemTitle, { marginBottom: 2, fontSize: 13 }]}>Name des Arbeitsortes</Text>
          <TextInput
            style={[
              localStyles.textInput,
              { 
                color: theme === 'dark' ? '#ffffff' : '#000000', 
                height: 42, 
                paddingVertical: 4,
                backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
                borderColor: theme === 'dark' ? '#444444' : '#cccccc'
              }
            ]}
            placeholder="z.B. Pflegeheim, Praxis, Klinik..."
            placeholderTextColor={theme === 'dark' ? '#999999' : '#999999'}
            value={locationName}
            onChangeText={setLocationName}
          />
        </View>

        <View style={[localStyles.inputContainer, {marginBottom: 5}]}>
          <Text style={[styles.itemTitle, { marginBottom: 2, fontSize: 13 }]}>Adresse</Text>
          <TextInput
            style={[
              localStyles.textInput,
              { 
                color: theme === 'dark' ? '#ffffff' : '#000000', 
                height: 60, 
                paddingVertical: 8,
                backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
                borderColor: theme === 'dark' ? '#444444' : '#cccccc'
              }
            ]}
            placeholder="Wird automatisch ausgefüllt"
            placeholderTextColor={theme === 'dark' ? '#999999' : '#999999'}
            value={locationAddress}
            onChangeText={setLocationAddress}
            multiline={true}
            numberOfLines={2}
          />
        </View>

        <View style={[localStyles.inputContainer, {marginBottom: 5}]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.itemTitle, { marginBottom: 0, fontSize: 13 }]}>Radius für Geofencing</Text>
            <Text style={styles.itemTitle}>{radius} m</Text>
          </View>
          <Slider
            style={[localStyles.slider, {height: 25}]}
            minimumValue={50}
            maximumValue={500}
            step={10}
            value={radius}
            onValueChange={setRadius}
            minimumTrackTintColor="#32b8ca"
            maximumTrackTintColor={theme === 'dark' ? '#444444' : '#dddddd'}
            thumbTintColor="#32b8ca"
          />
          <Text style={[styles.itemSubtitle, {fontSize: 10}]}>
            Definiert den Bereich, in dem Ihre Arbeitszeit automatisch erfasst wird.
          </Text>
        </View>

        <TouchableOpacity
          style={[localStyles.saveButton, {padding: 6, marginVertical: 5}]}
          onPress={handleSaveLocation}
        >
          <Icon name="save" size={20} color="#ffffff" />
          <Text style={localStyles.saveButtonText}>
            {isEditMode ? 'Änderungen speichern' : 'Arbeitsort speichern'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default WorkLocationMapScreen; 