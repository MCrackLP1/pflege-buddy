/**
 * StandardDetailScreen.tsx
 * Zeigt Details zu einem ausgewählten Pflegestandard an
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
import { nursingStandardsData } from '../utils/data';

// Import styles
import { getDynamicStyles } from '../utils/styleUtils';

type StandardDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'StandardDetail'>;
};

const StandardDetailScreen: React.FC<StandardDetailScreenProps> = ({ route }) => {
  const { standardId } = route.params;
  const standard = nursingStandardsData.find(s => s.id === standardId);
  
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);

  if (!standard) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Standard nicht gefunden!</Text>
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
            {standard.title}
          </Text>
          
          {/* Ziel */}
          <View style={[styles.card, { marginBottom: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Zielsetzung:</Text>
            <Text style={styles.itemSubtitle}>{standard.ziel}</Text>
          </View>
          
          {/* Strukturkriterien */}
          {standard.strukturkriterien && standard.strukturkriterien.length > 0 && (
            <View style={[styles.card, { marginBottom: 16 }]}>
              <Text style={[styles.itemTitle, { marginBottom: 12 }]}>Strukturkriterien:</Text>
              {standard.strukturkriterien.map((item, index) => (
                <View key={`struktur-${index}`} style={{ 
                  flexDirection: 'row', 
                  marginBottom: index < standard.strukturkriterien!.length - 1 ? 8 : 0 
                }}>
                  <Text style={[styles.itemSubtitle, { marginRight: 4 }]}>•</Text>
                  <Text style={[styles.itemSubtitle, { flex: 1 }]}>{item}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Prozesskriterien */}
          {standard.prozesskriterien && standard.prozesskriterien.length > 0 && (
            <View style={[styles.card, { marginBottom: 16 }]}>
              <Text style={[styles.itemTitle, { marginBottom: 12 }]}>Prozesskriterien:</Text>
              {standard.prozesskriterien.map((item, index) => (
                <View key={`prozess-${index}`} style={{ 
                  flexDirection: 'row', 
                  marginBottom: index < standard.prozesskriterien!.length - 1 ? 8 : 0 
                }}>
                  <Text style={[styles.itemSubtitle, { marginRight: 4 }]}>•</Text>
                  <Text style={[styles.itemSubtitle, { flex: 1 }]}>{item}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Ergebniskriterien */}
          {standard.ergebniskriterien && standard.ergebniskriterien.length > 0 && (
            <View style={[styles.card, { marginBottom: 16 }]}>
              <Text style={[styles.itemTitle, { marginBottom: 12 }]}>Ergebniskriterien:</Text>
              {standard.ergebniskriterien.map((item, index) => (
                <View key={`ergebnis-${index}`} style={{ 
                  flexDirection: 'row', 
                  marginBottom: index < standard.ergebniskriterien!.length - 1 ? 8 : 0 
                }}>
                  <Text style={[styles.itemSubtitle, { marginRight: 4 }]}>•</Text>
                  <Text style={[styles.itemSubtitle, { flex: 1 }]}>{item}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Details (Fallback für alte Inhalte) */}
          {standard.details && (
            <View style={[styles.card, { marginBottom: 16 }]}>
              <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Weitere Details:</Text>
              <Text style={styles.itemSubtitle}>{standard.details}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default StandardDetailScreen; 