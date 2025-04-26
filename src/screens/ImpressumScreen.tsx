/**
 * ImpressumScreen.tsx
 * Zeigt das Impressum der App an
 */

import React from 'react';
import { 
  View, 
  Text, 
  ScrollView 
} from 'react-native';

// Import hooks
import { useSettings } from '../context/SettingsContext';

// Import styles
import { getDynamicStyles } from '../utils/styleUtils';

const ImpressumScreen: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ padding: 16 }}>
          <Text style={[styles.itemTitle, { 
            fontSize: baseFontSize * fontSizeScale * 1.4, 
            marginBottom: 16 
          }]}>
            Impressum
          </Text>
          
          <View style={styles.card}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Angaben gemäß § 5 TMG:</Text>
            <Text style={styles.itemSubtitle}>
              Mark Tietz{'\n'}
              Königplatz 3{'\n'}
              87448 Waltenhofen{'\n'}
              Deutschland
            </Text>
          </View>
          
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Kontakt:</Text>
            <Text style={styles.itemSubtitle}>
              Telefon: +49 1741632129{'\n'}
              E-Mail: deinpflegebuddy@gmail.com
            </Text>
          </View>
          
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Hinweis zur PflegeBuddy:</Text>
            <Text style={styles.itemSubtitle}>
              Die PflegeBuddy dient als Hilfestellung und Nachschlagewerk für medizinisches Fachpersonal. Sie ersetzt keine professionelle medizinische Beratung, Diagnose oder Behandlung. Im Notfall wenden Sie sich bitte an einen Arzt oder den Rettungsdienst (112).{'\n\n'}
              Die bereitgestellten Inhalte, insbesondere zu Krankheiten, Notfallmaßnahmen und ICD-10-Codes, wurden sorgfältig zusammengestellt, erheben jedoch keinen Anspruch auf Vollständigkeit oder Fehlerfreiheit. Die Nutzung der App erfolgt auf eigene Verantwortung.{'\n\n'}
              Für medizinische Entscheidungen sollte stets auf offizielle Richtlinien und aktuelle Fachliteratur zurückgegriffen werden.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ImpressumScreen; 