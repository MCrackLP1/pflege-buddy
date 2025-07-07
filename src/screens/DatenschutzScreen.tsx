/**
 * DatenschutzScreen.tsx
 * Zeigt die Datenschutzerklärung der App an
 */

import React from 'react';
import { View, Text, ScrollView, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

// Import hooks
import { useSettings } from '../context/SettingsContext';

// Import styles
import { getDynamicStyles } from '../utils/styleUtils';

const DatenschutzScreen: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const { t } = useTranslation();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);

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
            {t('privacy')}
          </Text>
          <Text style={[styles.itemSubtitle, { marginBottom: 16, fontStyle: 'italic' }]}>
            {t('privacy_online_hint')}
            <Text 
              style={{ color: theme === 'dark' ? '#58a6ff' : '#007AFF', textDecorationLine: 'underline' }}
              onPress={() => Linking.openURL('https://www.plegebuddy.care/datenschutz-app.html')}
            >
              plegebuddy.care/datenschutz-app.html
            </Text>
          </Text>

          <View style={styles.card}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('privacy_responsible')}</Text>
            <Text style={styles.itemSubtitle}>
              {`Mark Tietz
Königplatz 3
87448 Waltenhofen
Deutschland
E-Mail: deinpflegebuddy@gmail.com

Tim Werner
Heckenstraße 1
87616 Marktoberdorf
E-Mail: deinpflegebuddy@gmail.com`}
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>
              {t('privacy_data_processing')}
            </Text>
            <Text style={styles.itemSubtitle}>
              {t('privacy_data_processing_text')}
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('privacy_ai_title')}</Text>
            <Text style={styles.itemSubtitle}>
              {t('privacy_ai_text')}
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('privacy_permissions')}</Text>
            <Text style={styles.itemSubtitle}>
              {t('privacy_permissions_text')}
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>
              {t('privacy_third_party_processing')}
            </Text>
            <Text style={styles.itemSubtitle}>
              {t('privacy_third_party_processing_text')}
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('privacy_your_rights')}</Text>
            <Text style={styles.itemSubtitle}>
              {t('privacy_your_rights_text')}
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('privacy_security_title')}</Text>
            <Text style={styles.itemSubtitle}>
              {t('privacy_security_text')}
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('privacy_changes_title')}</Text>
            <Text style={styles.itemSubtitle}>
              {t('privacy_changes_text')}
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 16, marginBottom: 20 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('privacy_contact_title')}</Text>
            <Text style={styles.itemSubtitle}>
              {t('privacy_contact_text')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DatenschutzScreen;
