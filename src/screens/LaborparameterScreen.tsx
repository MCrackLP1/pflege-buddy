import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { getDynamicStyles } from '../utils/styleUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

// Hilfsfunktion zum Laden aller Laborparameter
const loadLaborparameter = async () => {
  const data = require('../../data/laborparameter.json');
  return data.parameter;
};

const LaborparameterScreen: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

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
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
  };

  const [search, setSearch] = useState('');
  const [allParams, setAllParams] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  useEffect(() => {
    loadLaborparameter().then(setAllParams);
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(allParams);
    } else {
      setFiltered(
        allParams.filter(
          p =>
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.kuerzel?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, allParams]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        listItemStyle,
        { 
          marginHorizontal: 12,
          flexDirection: 'row', 
          alignItems: 'center', 
          padding: 16 
        },
      ]}
      onPress={() => navigation.navigate('LaborparameterDetail', { labor: item })}
    >
      <Icon
        name="flask-outline"
        size={28}
        color={theme === 'dark' ? '#03dac6' : '#00acc1'}
        style={{ marginRight: 16 }}
      />
      <View>
        <Text 
          style={[
            styles.itemTitle, 
            { 
              fontSize: baseFontSize * fontSizeScale * 1.1,
              color: theme === 'dark' ? '#ffffff' : '#000000',
              marginBottom: 4
            }
          ]}
        >
          {item.name}
        </Text>
        <Text style={[styles.itemSubtitle, { color: theme === 'dark' ? '#b0b0b0' : '#666666' }]}>
          {item.kuerzel}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View
        style={{ 
          padding: 16,
          backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5'
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
            placeholder={t('search_lab_parameters')}
            placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={20} color={theme === 'dark' ? '#aaaaaa' : '#777777'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <FlatList
        data={filtered}
        keyExtractor={item => `${item.id}_${item.name}`}
        renderItem={renderItem}
        contentContainerStyle={{ 
          paddingVertical: 8, 
          paddingBottom: insets.bottom + 20
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.centeredContent, { paddingTop: 40 }]}>
            <Icon
              name="flask-outline"
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
              {t('no_lab_parameters_found')}
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
              {t('try_other_search_terms')}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default LaborparameterScreen;
