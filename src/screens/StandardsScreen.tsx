/**
 * StandardsScreen.tsx
 * Zeigt eine Liste der verfügbaren Pflegestandards
 */

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

// Import Typen
import { RootStackParamList, NursingStandard } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Daten
import { nursingStandardsData } from '../utils/data';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

type StandardsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StandardsScreen: React.FC = () => {
  const navigation = useNavigation<StandardsScreenNavigationProp>();
  const route = useRoute();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [searchText, setSearchText] = useState('');
  const [standards, setStandards] = useState<NursingStandard[]>(nursingStandardsData);

  // Optimierte Abstände und Styles für die ListItems
  const listItemStyle = {
    marginVertical: 8,
    borderLeftWidth: 5,
    borderLeftColor: theme === 'dark' ? '#03dac6' : '#00acc1',
    borderRadius: 16,
    borderWidth: 0,
    // Leichte Schatten für bessere visuelle Tiefe
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 3,
    elevation: 2,
  };

  // Custom back handler
  const handleBackPress = () => {
    console.log('Back button pressed');

    // Einfach zurück zum letzten Screen navigieren
    navigation.goBack();

    // Die vorherige Implementierung nutze ich nur für Debug-Logging
    try {
      const state = navigation.getState();
      console.log('Navigation state:', JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Error getting navigation state:', error);
    }
  };

  // Filter standards based on search text
  const filteredStandards =
    searchText.trim() === ''
      ? standards
      : standards.filter(standard => {
          const title = t(`standards.${standard.id}.title`).toLowerCase();
          const goal = t(`standards.${standard.id}.goal`).toLowerCase();
          const search = searchText.toLowerCase();
          return title.includes(search) || goal.includes(search);
        });

  const renderStandardItem = ({ item }: { item: NursingStandard }) => (
    <TouchableOpacity
      style={[styles.card, listItemStyle]}
      onPress={() => navigation.navigate('StandardDetail', { standardId: item.id })}
    >
      <Text style={[styles.itemTitle, { marginBottom: 4 }]}>{t(`standards.${item.id}.title`)}</Text>
      <Text style={styles.itemSubtitle} numberOfLines={2}>
        {t(`standards.${item.id}.goal`)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: Math.max(insets.top, 10),
            paddingBottom: 10,
            paddingHorizontal: 16,
            zIndex: 10,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleBackPress} style={{ marginRight: 10 }}>
            <Icon name="arrow-back" size={24} color={theme === 'dark' ? '#ffffff' : '#000000'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('care_standards')}</Text>
        </View>
      </View>

      <View 
        style={{ 
          marginTop: 5,
          marginBottom: 5,
          backgroundColor: 'transparent' 
        }}
      >
        <View
          style={[
            {
              backgroundColor: theme === 'dark' ? '#252525' : '#f0f0f0',
              borderRadius: 16,
              borderWidth: 0,
              paddingHorizontal: 12,
              flexDirection: 'row',
              alignItems: 'center',
              height: 48,
              marginHorizontal: 16,
              marginVertical: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}
        >
          <Icon
            name="search"
            size={22}
            color={theme === 'dark' ? '#03dac6' : '#00acc1'}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={[
              {
                flex: 1,
                height: 48,
                paddingVertical: 8,
                color: theme === 'dark' ? '#ffffff' : '#000000',
                fontSize: baseFontSize * fontSizeScale,
              }
            ]}
            placeholder={t('search_standards_placeholder')}
            placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon name="close-circle" size={20} color={theme === 'dark' ? '#aaaaaa' : '#777777'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredStandards}
        renderItem={renderStandardItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ 
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: insets.bottom + 20
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.centeredContent, { paddingTop: 40 }]}>
            <Icon
              name="search-outline"
              size={50}
              color={theme === 'dark' ? '#666666' : '#999999'}
              style={{ marginBottom: 16, opacity: 0.7 }}
            />
            <Text 
              style={[
                styles.itemSubtitle, 
                { 
                  textAlign: 'center',
                  fontSize: baseFontSize * fontSizeScale * 1.1
                }
              ]}
            >
              {t('no_standards_found')}
            </Text>
            <Text
              style={[
                styles.itemSubtitle,
                {
                  textAlign: 'center',
                  fontSize: baseFontSize * fontSizeScale * 0.9,
                  marginTop: 8,
                  opacity: 0.7,
                }
              ]}
            >
              {t('try_other_terms')}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default StandardsScreen;
