/**
 * WissenScreen.tsx
 * Übersichtsseite für den Wissensbereich
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Import types
import { RootStackParamList } from '../types/types';

// Import hooks
import { useSettings } from '../context/SettingsContext';

// Import style utilities
import { getDynamicStyles } from '../utils/styleUtils';

// Import components
import PageHeader from '../components/PageHeader';
import ListItem from '../components/ListItem';

type WissenScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WissenLanding'>;

const WissenScreen: React.FC = () => {
  const navigation = useNavigation<WissenScreenNavigationProp>();
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
      <PageHeader title={t('knowledge_header')} subtitle={t('knowledge_subtitle')} />

      <ScrollView 
        contentContainerStyle={{ 
          paddingTop: 15,
          paddingBottom: 20,
          paddingHorizontal: 8
        }} 
        showsVerticalScrollIndicator={false}
      >
        <ListItem
          title={t('knowledge_diseases_title')}
          subtitle={t('knowledge_diseases_subtitle')}
          iconName="fitness-outline"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore - Typprobleme mit der Navigation ignorieren
            navigation.navigate('WissenListen');
          }}
        />

        <ListItem
          title={t('knowledge_standards_title')}
          subtitle={t('knowledge_standards_subtitle')}
          iconName="list-outline"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore - Typprobleme mit der Navigation ignorieren
            navigation.navigate('StandardsLanding');
          }}
        />

        <ListItem
          title={t('knowledge_lexicon_title')}
          subtitle={t('knowledge_lexicon_subtitle')}
          iconName="book-outline"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore - Typprobleme mit der Navigation ignorieren
            navigation.navigate('LexikonListen');
          }}
        />

        <ListItem
          title={t('knowledge_wiki_title')}
          subtitle={t('knowledge_wiki_subtitle')}
          iconName="search-outline"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore - Typprobleme mit der Navigation ignorieren
            navigation.navigate('MedizinSearch');
          }}
        />

        <ListItem
          title={t('knowledge_medication_title')}
          subtitle={t('knowledge_medication_subtitle')}
          iconName="medical"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore - Typprobleme mit der Navigation ignorieren
            navigation.navigate('MedicationSearch');
          }}
        />

        <ListItem
          title={t('knowledge_lab_title')}
          subtitle={t('knowledge_lab_subtitle')}
          iconName="flask-outline"
          style={listItemStyle}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('LaborparameterScreen');
          }}
        />
      </ScrollView>
    </View>
  );
};

export default WissenScreen;
