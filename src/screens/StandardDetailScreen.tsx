/**
 * StandardDetailScreen.tsx
 * Zeigt Details zu einem ausgewählten Pflegestandard an
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

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
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const { t } = useTranslation();

  // Alle Texte aus i18n laden
  const title = t(`standards.${standardId}.title`);
  const goal = t(`standards.${standardId}.goal`);
  const strukturkriterien = t(`standards.${standardId}.structure_criteria`, { returnObjects: true }) as string[];
  const prozesskriterien = t(`standards.${standardId}.process_criteria`, { returnObjects: true }) as string[];
  const ergebniskriterien = t(`standards.${standardId}.result_criteria`, { returnObjects: true }) as string[];
  const details = t(`standards.${standardId}.details`);

  if (!title || title === `standards.${standardId}.title`) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('standard_not_found')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ padding: 16 }}>
          <Text style={[styles.itemTitle, { fontSize: baseFontSize * fontSizeScale * 1.4, marginBottom: 16 }]}>
            {title}
          </Text>
          {/* Ziel */}
          <View style={[styles.card, { marginBottom: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('goal')}</Text>
            <Text style={styles.itemSubtitle}>{goal}</Text>
          </View>
          {/* Strukturkriterien */}
          {strukturkriterien && strukturkriterien.length > 0 && (
            <View style={[styles.card, { marginBottom: 16 }]}>
              <Text style={[styles.itemTitle, { marginBottom: 12 }]}>{t('structure_criteria')}</Text>
              {strukturkriterien.map((item, index) => (
                <View key={`struktur-${index}`} style={{ flexDirection: 'row', marginBottom: index < strukturkriterien.length - 1 ? 8 : 0 }}>
                  <Text style={[styles.itemSubtitle, { marginRight: 4 }]}>•</Text>
                  <Text style={[styles.itemSubtitle, { flex: 1 }]}>{item}</Text>
                </View>
              ))}
            </View>
          )}
          {/* Prozesskriterien */}
          {prozesskriterien && prozesskriterien.length > 0 && (
            <View style={[styles.card, { marginBottom: 16 }]}>
              <Text style={[styles.itemTitle, { marginBottom: 12 }]}>{t('process_criteria')}</Text>
              {prozesskriterien.map((item, index) => (
                <View key={`prozess-${index}`} style={{ flexDirection: 'row', marginBottom: index < prozesskriterien.length - 1 ? 8 : 0 }}>
                  <Text style={[styles.itemSubtitle, { marginRight: 4 }]}>•</Text>
                  <Text style={[styles.itemSubtitle, { flex: 1 }]}>{item}</Text>
                </View>
              ))}
            </View>
          )}
          {/* Ergebniskriterien */}
          {ergebniskriterien && ergebniskriterien.length > 0 && (
            <View style={[styles.card, { marginBottom: 16 }]}>
              <Text style={[styles.itemTitle, { marginBottom: 12 }]}>{t('result_criteria')}</Text>
              {ergebniskriterien.map((item, index) => (
                <View key={`ergebnis-${index}`} style={{ flexDirection: 'row', marginBottom: index < ergebniskriterien.length - 1 ? 8 : 0 }}>
                  <Text style={[styles.itemSubtitle, { marginRight: 4 }]}>•</Text>
                  <Text style={[styles.itemSubtitle, { flex: 1 }]}>{item}</Text>
                </View>
              ))}
            </View>
          )}
          {/* Details (optional) */}
          {details && details !== `standards.${standardId}.details` && (
            <View style={[styles.card, { marginBottom: 16 }]}>
              <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('more_details')}</Text>
              <Text style={styles.itemSubtitle}>{details}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default StandardDetailScreen;
