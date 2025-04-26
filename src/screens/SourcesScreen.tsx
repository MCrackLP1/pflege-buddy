import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SOURCES } from '../data/sources';
import SourcesList from '../components/SourcesList';
import { useSettings } from '../context/SettingsContext';
import { getDynamicStyles } from '../utils/styleUtils';

const SourcesScreen: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ padding: 16 }}>
          <Text style={[styles.itemTitle, { fontSize: baseFontSize * fontSizeScale * 1.4, marginBottom: 16 }]}>Quellen & Literatur</Text>
          <SourcesList sources={SOURCES} />
        </View>
      </ScrollView>
    </View>
  );
};

export default SourcesScreen; 