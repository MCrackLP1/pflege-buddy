/**
 * ImpressumScreen.tsx
 * Zeigt das Impressum der App an
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

// Import hooks
import { useSettings } from '../context/SettingsContext';

// Import styles
import { getDynamicStyles } from '../utils/styleUtils';

const ImpressumScreen: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ padding: 16 }}>
          <Text
            style={[
              styles.itemTitle,
              {
                fontSize: baseFontSize * fontSizeScale * 1.4,
                marginBottom: 16,
              },
            ]}
          >
            {t('imprint')}
          </Text>

          <View style={styles.card}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('imprint_info')}</Text>
            <Text style={styles.itemSubtitle}>
              Mark Tietz{'\n'}
              Königplatz 3{'\n'}
              87448 Waltenhofen{'\n'}
              Deutschland
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('contact')}</Text>
            <Text style={styles.itemSubtitle}>
              Telefon: +49 1741632129{'\n'}
              E-Mail: deinpflegebuddy@gmail.com
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('note_pflegebuddy')}</Text>
            <Text style={styles.itemSubtitle}>
              {t('imprint_note')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ImpressumScreen;
