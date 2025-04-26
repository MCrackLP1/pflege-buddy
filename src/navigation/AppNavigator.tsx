/**
 * AppNavigator.tsx
 * Enthält die Hauptnavigationsstruktur der App
 */

import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Import types
import { BottomTabParamList, RootStackParamList } from '../types/types';

// Import hooks
import { useSettings } from '../context/SettingsContext';

// Import actual screens
import HomeScreen from '../screens/HomeScreen';
import WissenScreen from '../screens/WissenScreen';
import StandardsScreen from '../screens/StandardsScreen';
import ToolsScreen from '../screens/ToolsScreen';
import FrequencyCounterScreen from '../screens/FrequencyCounterScreen';
import ContactsScreen from '../screens/ContactsScreen';
import NutritionCalculatorScreen from '../screens/NutritionCalculatorScreen';
import MedicationCalculatorScreen from '../screens/MedicationCalculatorScreen';
import WorkTimeTrackerScreen from '../screens/WorkTimeTrackerScreen';
import WorkLocationMapScreen from '../screens/WorkLocationMapScreen';
import EinstellungenScreen from '../screens/EinstellungenScreen';
import MedizinSearch from '../components/WikipediaSearch';
import EmergencyChecklistScreen from '../screens/EmergencyChecklistScreen';
import StandardDetailScreen from '../screens/StandardDetailScreen';
import WissenListenScreen from '../screens/WissenListenScreen';
import LexikonScreen from '../screens/LexikonScreen';
import LexikonDetailScreen from '../screens/LexikonDetailScreen';
import ImpressumScreen from '../screens/ImpressumScreen';
import DatenschutzScreen from '../screens/DatenschutzScreen';
import MedicalTermSearchScreen from '../screens/MedicalTermSearchScreen';
import MedicationSearchScreen from '../screens/MedicationSearchScreen';
import LocationTestScreen from '../screens/LocationTestScreen';
import DocumentationScreen from '../screens/DocumentationScreen';
import SourcesScreen from '../screens/SourcesScreen';
import LaborparameterScreen from '../screens/LaborparameterScreen';
import LaborparameterDetailScreen from '../screens/LaborparameterDetailScreen';
import WoundAssessmentScreen from '../screens/WoundAssessmentScreen';

// Import data
import { lexikonEntries } from '../utils/data';

// Stacks erstellen für jeden Tab
const HomeStack = createNativeStackNavigator<RootStackParamList>();
const WissenStack = createNativeStackNavigator<RootStackParamList>();
const StandardsStack = createNativeStackNavigator<RootStackParamList>();
const ToolsStack = createNativeStackNavigator<RootStackParamList>();
const EinstellungenStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// Home Stack Navigator (Notfälle)
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="EmergencyChecklist" 
        component={EmergencyChecklistScreen}
        options={{ title: 'Notfall-Checkliste' }} 
      />
      <HomeStack.Screen 
        name="MedizinSearch" 
        component={MedizinSearch}
        options={{ title: 'Medizinsuche' }} 
      />
      <HomeStack.Screen 
        name="LaborparameterDetail" 
        component={LaborparameterDetailScreen}
        options={{ title: 'Laborparameter Detail' }} 
      />
    </HomeStack.Navigator>
  );
};

// Standards Stack Navigator (bleibt als Komponente für die Tools)
const StandardsStackNavigator = () => {
  return (
    <StandardsStack.Navigator>
      <StandardsStack.Screen 
        name="StandardsLanding" 
        component={StandardsScreen}
        options={{ headerShown: false }}
      />
      <StandardsStack.Screen 
        name="StandardDetail" 
        component={StandardDetailScreen}
        options={{ title: 'Pflegestandard' }} 
      />
    </StandardsStack.Navigator>
  );
};

// Tools Stack Navigator
const ToolsStackNavigator = () => {
  return (
    <ToolsStack.Navigator>
      <ToolsStack.Screen 
        name="ToolsLanding" 
        component={ToolsScreen}
        options={{ headerShown: false }}
      />
      {/* Standards können über Tools aufgerufen werden */}
      <ToolsStack.Screen 
        name="StandardsLanding" 
        component={StandardsScreen}
        options={{ headerShown: false }} 
      />
      <ToolsStack.Screen 
        name="StandardDetail" 
        component={StandardDetailScreen}
        options={{ title: 'Pflegestandard' }} 
      />
      <ToolsStack.Screen 
        name="WoundAssessment" 
        component={WoundAssessmentScreen}
        options={{ headerShown: false }} 
      />
      <ToolsStack.Screen 
        name="FrequencyCounter" 
        component={FrequencyCounterScreen}
        options={{ title: 'Frequenzzähler' }} 
      />
      <ToolsStack.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{ title: 'Kontakte' }} 
      />
      <ToolsStack.Screen 
        name="NutritionCalculator" 
        component={NutritionCalculatorScreen}
        options={{ title: 'Ernährungsrechner' }} 
      />
      <ToolsStack.Screen 
        name="MedicationCalculator" 
        component={MedicationCalculatorScreen}
        options={{ title: 'Infusions- & Medikationsrechner' }} 
      />
      <ToolsStack.Screen 
        name="WorkTimeTracker" 
        component={WorkTimeTrackerScreen}
        options={{ title: 'Arbeitszeiterfassung' }} 
      />
      <ToolsStack.Screen 
        name="Documentation" 
        component={DocumentationScreen}
        options={{ title: 'Dokumentationshilfen' }} 
      />
      <ToolsStack.Screen 
        name="WorkLocationMap" 
        component={WorkLocationMapScreen}
        options={{ headerShown: false }} 
      />
    </ToolsStack.Navigator>
  );
};

// Wissen Stack Navigator
const WissenStackNavigator = () => {
  return (
    <WissenStack.Navigator>
      <WissenStack.Screen 
        name="WissenLanding" 
        component={WissenScreen}
        options={{ headerShown: false }}
      />
      <WissenStack.Screen 
        name="WissenListen" 
        component={WissenListenScreen}
        options={{ title: 'Krankheiten' }} 
      />
      <WissenStack.Screen 
        name="LexikonListen" 
        component={LexikonScreen}
        options={{ title: 'Pflegelexikon' }} 
      />
      <WissenStack.Screen 
        name="LexikonDetail" 
        component={LexikonDetailScreen}
        options={({ route }) => ({ 
          title: lexikonEntries.find(e => e.id === route.params.termId)?.term || 'Begriff' 
        })}
      />
      <WissenStack.Screen 
        name="MedizinSearch" 
        component={MedizinSearch}
        options={{ title: 'Medizinsuche' }} 
      />
      <WissenStack.Screen 
        name="MedicationSearch" 
        component={MedicationSearchScreen}
        options={{ title: 'Medikamentensuche' }} 
      />
      {/* Pflegestandards direkt im Wissen-Stack für bessere Navigation */}
      <WissenStack.Screen 
        name="StandardsLanding" 
        component={StandardsScreen}
        options={{ headerShown: false }} 
      />
      <WissenStack.Screen 
        name="StandardDetail" 
        component={StandardDetailScreen}
        options={{ title: 'Pflegestandard' }} 
      />
      <WissenStack.Screen 
        name="LaborparameterScreen" 
        component={LaborparameterScreen}
        options={{ title: 'Laborparameter' }} 
      />
      <WissenStack.Screen 
        name="LaborparameterDetail" 
        component={LaborparameterDetailScreen}
        options={{ title: 'Laborparameter Detail' }} 
      />
    </WissenStack.Navigator>
  );
};

// Einstellungen Stack Navigator
const EinstellungenStackNavigator = () => {
  return (
    <EinstellungenStack.Navigator>
      <EinstellungenStack.Screen 
        name="EinstellungenLanding" 
        component={EinstellungenScreen}
        options={{ headerShown: false }}
      />
      <EinstellungenStack.Screen 
        name="Impressum" 
        component={ImpressumScreen}
        options={{ title: 'Impressum' }} 
      />
      <EinstellungenStack.Screen 
        name="Datenschutz" 
        component={DatenschutzScreen}
        options={{ title: 'Datenschutz' }} 
      />
      <EinstellungenStack.Screen 
        name="LocationTest" 
        component={LocationTestScreen}
        options={{ title: 'Standort-Test' }} 
      />
      <EinstellungenStack.Screen 
        name="Sources" 
        component={SourcesScreen}
        options={{ title: 'Quellen & Literatur' }} 
      />
    </EinstellungenStack.Navigator>
  );
};

// Tab-Navigator
const MainTabs = () => {
  const { theme, fontSizeScale } = useSettings();
  const fontSize = 14 * fontSizeScale;

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'WelcomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'WissenTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'ToolsTab') {
            iconName = focused ? 'build' : 'build-outline';
          } else if (route.name === 'EinstellungenTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme === 'dark' ? '#32b8ca' : '#32b8ca',
        tabBarInactiveTintColor: theme === 'dark' ? '#777777' : '#999999',
        tabBarLabelStyle: { fontSize },
        tabBarStyle: { 
          backgroundColor: theme === 'dark' ? '#121212' : '#ffffff',
          borderTopColor: theme === 'dark' ? '#333333' : '#dddddd',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false
      })}
      safeAreaInsets={{ bottom: 0 }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('HomeTab', {
              screen: 'Home',
            });
          },
        })}
      />
      <Tab.Screen 
        name="WissenTab" 
        component={WissenStackNavigator}
        options={{ title: 'Wissen' }} 
      />
      <Tab.Screen 
        name="ToolsTab" 
        component={ToolsStackNavigator}
        options={{ title: 'Tools' }} 
      />
      <Tab.Screen 
        name="EinstellungenTab" 
        component={EinstellungenStackNavigator}
        options={{ title: 'Einstellungen' }} 
      />
    </Tab.Navigator>
  );
};

// Hauptnavigator
const AppNavigator = () => {
  const { theme } = useSettings();
  const navigationTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navigationTheme}>
      <MainTabs />
    </NavigationContainer>
  );
};

export default AppNavigator; 