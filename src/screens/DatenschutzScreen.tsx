/**
 * DatenschutzScreen.tsx
 * Zeigt die Datenschutzerklärung der App an
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

const DatenschutzScreen: React.FC = () => {
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
            Datenschutzerklärung
          </Text>
          
          <View style={styles.card}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Verantwortlicher:</Text>
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
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Datenverarbeitung in der App:</Text>
            <Text style={styles.itemSubtitle}>
              Die PflegeBuddy verarbeitet alle Daten ausschließlich lokal auf Ihrem Gerät. Es werden keine personenbezogenen Daten an externe Server übertragen oder in der Cloud gespeichert. Folgende Daten werden verarbeitet:{'\n\n'}
              • App-Einstellungen (Theme, Schriftgröße): Diese werden im lokalen Speicher Ihres Geräts gesichert.{'\n'}
              • Suchverlauf: Ihre Suchanfragen werden temporär für eine verbesserte Benutzerfreundlichkeit gespeichert.{'\n\n'}
              Da alle Daten ausschließlich auf Ihrem Gerät verbleiben, haben Sie die volle Kontrolle über Ihre Daten.
            </Text>
          </View>
          
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Berechtigungen:</Text>
            <Text style={styles.itemSubtitle}>
              Die App benötigt folgende Berechtigungen:{'\n\n'}
              • Internetzugang: Nur für die erweiterte Medizinsuche erforderlich, falls Sie nach Informationen suchen, die nicht lokal verfügbar sind.{'\n'}
              • Speicherzugriff: Zum Speichern Ihrer App-Einstellungen.
            </Text>
          </View>
          
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Datenverarbeitung durch Dritte:</Text>
            <Text style={styles.itemSubtitle}>
              Bei der Nutzung der Medizinsuche werden Suchanfragen an den Anbieter der Suchfunktion weitergeleitet. Dabei können IP-Adressen und Suchanfragen übermittelt werden. Wir empfehlen, für diese Suchanfragen die Datenschutzbestimmungen des jeweiligen Anbieters zu beachten.
            </Text>
          </View>
          
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Ihre Rechte:</Text>
            <Text style={styles.itemSubtitle}>
              Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:{'\n\n'}
              • Auskunftsrecht{'\n'}
              • Recht auf Berichtigung{'\n'}
              • Recht auf Löschung{'\n'}
              • Recht auf Einschränkung der Verarbeitung{'\n'}
              • Recht auf Datenübertragbarkeit{'\n'}
              • Widerspruchsrecht{'\n\n'}
              Da die Daten ausschließlich auf Ihrem Gerät gespeichert werden, können Sie diese Rechte jederzeit ausüben, indem Sie die App löschen, den App-Cache leeren oder die App-Daten zurücksetzen.
            </Text>
          </View>
          
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Datensicherheit:</Text>
            <Text style={styles.itemSubtitle}>
              Wir setzen angemessene technische und organisatorische Maßnahmen ein, um die Sicherheit Ihrer Daten zu gewährleisten. Da die App-Daten nur lokal auf Ihrem Gerät gespeichert werden, empfehlen wir, Ihr Gerät mit einem Passwort/PIN zu schützen und regelmäßige Backups durchzuführen.
            </Text>
          </View>
          
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Änderungen der Datenschutzerklärung:</Text>
            <Text style={styles.itemSubtitle}>
              Diese Datenschutzerklärung kann gelegentlich aktualisiert werden. Änderungen werden mit einem App-Update veröffentlicht. Wir empfehlen, diese Datenschutzerklärung regelmäßig zu überprüfen.
            </Text>
          </View>
          
          <View style={[styles.card, { marginTop: 16, marginBottom: 20 }]}>
            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Kontakt:</Text>
            <Text style={styles.itemSubtitle}>
              {`Bei Fragen zum Datenschutz kontaktieren Sie uns bitte unter:

Mark Tietz
E-Mail: deinpflegebuddy@gmail.com
Telefon: +49 1741632129`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DatenschutzScreen; 