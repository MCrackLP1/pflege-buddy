import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { getDynamicStyles } from '../utils/styleUtils';
import Icon from 'react-native-vector-icons/Ionicons';

const InfoRow = ({ label, value, theme }: { label: string; value: string; theme: string }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={{ color: theme === 'dark' ? '#7ad1e6' : '#32b8ca', fontWeight: '600', fontSize: 15, marginBottom: 2 }}>{label}</Text>
    <Text style={{ color: theme === 'dark' ? '#fff' : '#222', fontSize: 16, fontWeight: '400' }}>{value}</Text>
  </View>
);

const Section = ({ children, theme }: { children: React.ReactNode; theme: string }) => (
  <View style={{
    backgroundColor: theme === 'dark' ? '#232b32' : '#f8fafd',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: theme === 'dark' ? '#000' : '#32b8ca',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  }}>
    {children}
  </View>
);

const LaborparameterDetailScreen = ({ route }: any) => {
  const { labor } = route.params;
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={[styles.container, { padding: 0, backgroundColor: theme === 'dark' ? '#181f25' : '#f2f7fa' }]}
      contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Icon name="flask-outline" size={54} color={theme === 'dark' ? '#7ad1e6' : '#32b8ca'} />
        <Text style={{ color: theme === 'dark' ? '#fff' : '#222', fontWeight: 'bold', fontSize: baseFontSize * fontSizeScale * 1.35, marginTop: 14, textAlign: 'center' }}>{labor.name}</Text>
        <Text style={{ color: theme === 'dark' ? '#aaa' : '#666', fontSize: 17, marginTop: 2 }}>{labor.kuerzel}</Text>
      </View>
      <Section theme={theme}>
        <InfoRow label="Einheit" value={labor.einheit || '-'} theme={theme} />
        <InfoRow label="Normalwert (Mann)" value={labor.normalwert_mann || '-'} theme={theme} />
        <InfoRow label="Normalwert (Frau)" value={labor.normalwert_frau || '-'} theme={theme} />
        <InfoRow label="Kategorie" value={labor.kategorie || '-'} theme={theme} />
      </Section>
      <Section theme={theme}>
        <InfoRow label="Bedeutung" value={labor.bedeutung || '-'} theme={theme} />
        <InfoRow label="Erhöhung: Bedeutung" value={labor.erhoehung_bedeutung || '-'} theme={theme} />
        <InfoRow label="Erniedrigung: Bedeutung" value={labor.erniedrigung_bedeutung || '-'} theme={theme} />
      </Section>
      <Section theme={theme}>
        <InfoRow label="Relevanz für die Pflege" value={labor.relevanz_pflege || '-'} theme={theme} />
        <InfoRow label="Hinweise" value={labor.hinweise || '-'} theme={theme} />
        {labor.aktualisiert_am && <InfoRow label="Aktualisiert am" value={labor.aktualisiert_am} theme={theme} />}
      </Section>
    </ScrollView>
  );
};

export default LaborparameterDetailScreen; 