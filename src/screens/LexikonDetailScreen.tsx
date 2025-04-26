/**
 * LexikonDetailScreen.tsx
 * Zeigt Details zu einem ausgewählten Lexikon-Eintrag an
 */

import React from 'react';
import { 
  View, 
  Text, 
  ScrollView 
} from 'react-native';
import { RouteProp } from '@react-navigation/native';

// Import types
import { RootStackParamList } from '../types/types';

// Import hooks
import { useSettings } from '../context/SettingsContext';

// Import data
import { findLexikonEntryById } from '../utils/lexikonRegistration';

// Import styles
import { getDynamicStyles } from '../utils/styleUtils';

type LexikonDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'LexikonDetail'>;
};

const LexikonDetailScreen: React.FC<LexikonDetailScreenProps> = ({ route }) => {
  const { termId } = route.params;
  const entry = findLexikonEntryById(termId);
  
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);

  if (!entry) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Lexikon-Eintrag nicht gefunden!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ padding: 16 }}>
          <Text style={[styles.itemTitle, { 
            fontSize: baseFontSize * fontSizeScale * 1.4, 
            marginBottom: 16 
          }]}>
            {entry.term}
          </Text>
          
          <View style={styles.card}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Definition:</Text>
            <Text style={[styles.itemSubtitle, { lineHeight: baseFontSize * fontSizeScale * 1.5 }]}>
              {entry.definition}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LexikonDetailScreen; 