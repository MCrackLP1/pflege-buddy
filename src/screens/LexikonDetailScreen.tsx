/**
 * LexikonDetailScreen.tsx
 * Zeigt Details zu einem ausgewählten Lexikon-Eintrag an
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

  const { t } = useTranslation();

  if (!entry) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('lexicon_entry_not_found')}</Text>
      </View>
    );
  }

  const renderSection = (title: string, content: string | readonly string[] | undefined, icon?: string) => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;

    return (
      <View style={[styles.card, { marginBottom: 12 }]}>
        <Text style={[styles.itemTitle, { marginBottom: 8, color: theme === 'dark' ? '#32b8ca' : '#00acc1' }]}>
          {icon && `${icon} `}{title}:
        </Text>
        {Array.isArray(content) ? (
          content.map((item, index) => (
            <Text key={index} style={[styles.itemSubtitle, { 
              lineHeight: baseFontSize * fontSizeScale * 1.5,
              marginBottom: 4
            }]}>
              • {item}
            </Text>
          ))
        ) : (
          <Text style={[styles.itemSubtitle, { lineHeight: baseFontSize * fontSizeScale * 1.5 }]}>
            {content}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ padding: 16 }}>
          {/* Header */}
          <View style={[styles.card, { marginBottom: 16, backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }]}>
            <Text style={[styles.itemTitle, { 
              fontSize: baseFontSize * fontSizeScale * 1.4,
              marginBottom: 8,
              color: theme === 'dark' ? '#32b8ca' : '#00acc1'
            }]}>
              {entry.term}
            </Text>
            {entry.category && (
              <Text style={[styles.itemSubtitle, { 
                fontSize: baseFontSize * fontSizeScale * 0.9,
                fontStyle: 'italic',
                opacity: 0.8
              }]}>
                📂 {entry.category}
              </Text>
            )}
          </View>

          {/* Definition */}
          {renderSection(t('definition'), entry.definition, '📝')}

          {/* Description */}
          {renderSection('Beschreibung', entry.description, '📖')}

          {/* Indications */}
          {renderSection('Indikationen', entry.indications, '🎯')}

          {/* Contraindications */}
          {renderSection('Kontraindikationen', entry.contraindications, '⚠️')}

          {/* Materials */}
          {renderSection('Materialien', entry.materials, '🧰')}

          {/* Procedure */}
          {renderSection('Durchführung', entry.procedure, '🔧')}

          {/* Nursing Considerations */}
          {renderSection('Pflegehinweise', entry.nursingConsiderations, '👩‍⚕️')}

          {/* Monitoring */}
          {renderSection('Überwachung', entry.monitoring, '📊')}

          {/* Complications */}
          {renderSection('Komplikationen', entry.complications, '🚨')}

          {/* Key Points */}
          {renderSection('Wichtige Punkte', entry.keyPoints, '💡')}

          {/* Spacing at the bottom */}
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </View>
  );
};

export default LexikonDetailScreen;
