/**
 * AppNavigator.tsx
 * Enthält die Hauptnavigationsstruktur der App
 */

import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

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
import DocumentationScreen from '../screens/DocumentationScreen';
import SourcesScreen from '../screens/SourcesScreen';
import LaborparameterScreen from '../screens/LaborparameterScreen';
import LaborparameterDetailScreen from '../screens/LaborparameterDetailScreen';
import WoundAssessmentScreen from '../screens/WoundAssessmentScreen';
import ChatScreen from '../screens/ChatScreen';
import InteractiveCasesScreen from '../screens/InteractiveCasesScreen';
import DecisionTreeSimulationScreen from '../screens/DecisionTreeSimulationScreen';
import SkillTrainerSimulationScreen from '../screens/SkillTrainerSimulationScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';

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
  const { t } = useTranslation();
  
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Chat" component={ChatScreen} options={{ title: t('pflege_buddy_ai') }} />
      <HomeStack.Screen
        name="EmergencyChecklist"
        component={EmergencyChecklistScreen}
        options={{ title: t('emergency_checklist') }}
      />
      <HomeStack.Screen
        name="MedizinSearch"
        component={MedizinSearch}
        options={{ title: t('medical_search') }}
      />
      <HomeStack.Screen
        name="LaborparameterDetail"
        component={LaborparameterDetailScreen}
        options={{ title: t('laboratory_parameter_detail') }}
      />
    </HomeStack.Navigator>
  );
};

// Standards Stack Navigator (bleibt als Komponente für die Tools)
const StandardsStackNavigator = () => {
  const { t } = useTranslation();
  
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
        options={{ title: t('care_standard') }}
      />
    </StandardsStack.Navigator>
  );
};

// Tools Stack Navigator
const ToolsStackNavigator = () => {
  const { t } = useTranslation();
  
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
        options={{ title: t('care_standard') }}
      />
      <ToolsStack.Screen
        name="WoundAssessment"
        component={WoundAssessmentScreen}
        options={{ headerShown: false }}
      />
      <ToolsStack.Screen
        name="FrequencyCounter"
        component={FrequencyCounterScreen}
        options={{ title: t('frequency_counter') }}
      />
      <ToolsStack.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ title: t('contacts') }}
      />
      <ToolsStack.Screen
        name="NutritionCalculator"
        component={NutritionCalculatorScreen}
        options={{ title: t('nutrition_calculator') }}
      />
      <ToolsStack.Screen
        name="MedicationCalculator"
        component={MedicationCalculatorScreen}
        options={{ title: t('infusion_medication_calculator') }}
      />
      <ToolsStack.Screen
        name="Documentation"
        component={DocumentationScreen}
        options={{ title: t('documentation_help') }}
      />
      <ToolsStack.Screen
        name="InteractiveCasesLanding"
        component={InteractiveCasesScreen}
        options={{ title: t('interactive_learning') }}
      />
      <ToolsStack.Screen
        name="DecisionTreeSimulation"
        component={DecisionTreeSimulationScreen}
        options={{ headerShown: false }}
      />
      <ToolsStack.Screen
        name="SkillTrainerSimulation"
        component={SkillTrainerSimulationScreen}
        options={{ headerShown: false }}
      />
      <ToolsStack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{ title: t('statistics') }}
      />
    </ToolsStack.Navigator>
  );
};

// Wissen Stack Navigator
const WissenStackNavigator = () => {
  const { t } = useTranslation();

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
        options={{ title: t('diseases') }}
      />
      <WissenStack.Screen
        name="LexikonListen"
        component={LexikonScreen}
        options={{ title: t('care_lexicon') }}
      />
      <WissenStack.Screen
        name="LexikonDetail"
        component={LexikonDetailScreen}
        options={({ route }) => ({
          title: lexikonEntries.find(e => e.id === route.params.termId)?.term || t('term'),
        })}
      />
      <WissenStack.Screen
        name="MedizinSearch"
        component={MedizinSearch}
        options={{ title: t('medical_search') }}
      />
      <WissenStack.Screen
        name="MedicationSearch"
        component={MedicationSearchScreen}
        options={{ title: t('medication_search') }}
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
        options={{ title: t('care_standard') }}
      />
      <WissenStack.Screen
        name="LaborparameterScreen"
        component={LaborparameterScreen}
        options={{ title: t('lab_parameters') }}
      />
      <WissenStack.Screen
        name="LaborparameterDetail"
        component={LaborparameterDetailScreen}
        options={{ title: t('lab_parameter_detail') }}
      />
    </WissenStack.Navigator>
  );
};

// Einstellungen Stack Navigator
const EinstellungenStackNavigator = () => {
  const { t } = useTranslation();
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
        options={{ title: t('imprint') }}
      />
      <EinstellungenStack.Screen
        name="Datenschutz"
        component={DatenschutzScreen}
        options={{ title: t('privacy') }}
      />
      <EinstellungenStack.Screen
        name="Sources"
        component={SourcesScreen}
        options={{ title: t('sources') }}
      />
    </EinstellungenStack.Navigator>
  );
};

// Tab-Navigator
const MainTabs = () => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'help-circle-outline';

          if (route.name === 'HomeStack') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'WissenStack') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'ToolsStack') {
            iconName = focused ? 'build' : 'build-outline';
          } else if (route.name === 'EinstellungenStack') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF', // Blau für aktiven Tab
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{ title: t('home'), tabBarAccessibilityLabel: t('home') }}
      />
      <Tab.Screen
        name="WissenStack"
        component={WissenStackNavigator}
        options={{ title: t('knowledge'), tabBarAccessibilityLabel: t('knowledge') }}
      />
      <Tab.Screen
        name="ToolsStack"
        component={ToolsStackNavigator}
        options={{ title: t('tools'), tabBarAccessibilityLabel: t('tools') }}
      />
      <Tab.Screen
        name="EinstellungenStack"
        component={EinstellungenStackNavigator}
        options={{ title: t('settings'), tabBarAccessibilityLabel: t('settings') }}
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
