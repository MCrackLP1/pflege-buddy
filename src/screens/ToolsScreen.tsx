/**
 * ToolsScreen.tsx
 * Zeigt verschiedene Tools für den Pflegealltag
 */

import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Import Typen
import { RootStackParamList } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

// Import Components
import PageHeader from '../components/PageHeader';
import ListItem from '../components/ListItem';

type ToolsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ToolsLanding'>;

const ToolsScreen: React.FC = () => {
  const navigation = useNavigation<ToolsScreenNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // Optimierte Abstände für die ListItems
  const listItemStyle = {
    marginVertical: 10,
    borderLeftWidth: 5,
    borderLeftColor: theme === 'dark' ? '#03dac6' : '#00acc1',
    borderRadius: 16,
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <PageHeader title={t('tools_header')} subtitle={t('tools_subtitle')} />

      <ScrollView 
        contentContainerStyle={{ 
          paddingTop: 15,
          paddingBottom: 20,
          paddingHorizontal: 8
        }} 
        showsVerticalScrollIndicator={false}
      >
        <ListItem
          title={t('tools_wound_title')}
          subtitle={t('tools_wound_subtitle')}
          iconName="bandage-outline"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('WoundAssessment');
          }}
        />

        <ListItem
          title={t('tools_frequency_title')}
          subtitle={t('tools_frequency_subtitle')}
          iconName="stopwatch-outline"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('FrequencyCounter');
          }}
        />

        <ListItem
          title={t('tools_contacts_title')}
          subtitle={t('tools_contacts_subtitle')}
          iconName="call-outline"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('Contacts');
          }}
        />

        <ListItem
          title={t('tools_nutrition_title')}
          subtitle={t('tools_nutrition_subtitle')}
          iconName="nutrition-outline"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('NutritionCalculator');
          }}
        />

        <ListItem
          title={t('tools_medication_title')}
          subtitle={t('tools_medication_subtitle')}
          iconName="medical-outline"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('MedicationCalculator');
          }}
        />

        <ListItem
          title={t('tools_documentation_title')}
          subtitle={t('tools_documentation_subtitle')}
          iconName="clipboard-outline"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('Documentation');
          }}
        />

        <ListItem
          title={t('tools_interactive_cases_title')}
          subtitle={t('tools_interactive_cases_subtitle')}
          iconName="library-outline"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('InteractiveCasesLanding');
          }}
        />
      </ScrollView>
    </View>
  );
};

export default ToolsScreen;
