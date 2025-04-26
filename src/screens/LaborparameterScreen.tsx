import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { getDynamicStyles } from '../utils/styleUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Hilfsfunktion zum Laden aller Laborparameter
const loadLaborparameter = async () => {
  const data = require('../../data/laborparameter.json');
  return data.parameter;
};

const LaborparameterScreen: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

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
        allParams.filter(p =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.kuerzel?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, allParams]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { marginBottom: 12, flexDirection: 'row', alignItems: 'center', padding: 16 }
      ]}
      onPress={() => navigation.navigate('LaborparameterDetail', { labor: item })}
    >
      <Icon name="flask-outline" size={28} color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} style={{ marginRight: 16 }} />
      <View>
        <Text style={[styles.itemTitle, { fontSize: baseFontSize * fontSizeScale * 1.1 }]}>{item.name}</Text>
        <Text style={[styles.itemSubtitle, { color: theme === 'dark' ? '#aaa' : '#666' }]}>{item.kuerzel}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}> 
      <TextInput
        style={[styles.searchInput, { margin: 16 }]}
        placeholder="Laborparameter suchen..."
        placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => `${item.id}_${item.name}`}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 8, paddingBottom: 32 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>Keine Laborparameter gefunden.</Text>}
      />
    </View>
  );
};

export default LaborparameterScreen; 