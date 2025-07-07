import React from 'react';
import { View, Text, Linking, TouchableOpacity, StyleSheet } from 'react-native';
import { Source } from '../data/sources';
import { useSettings } from '../context/SettingsContext';
import { getDynamicStyles } from '../utils/styleUtils';

interface SourcesListProps {
  sources: Source[];
  title?: string;
}

const SourcesList: React.FC<SourcesListProps> = ({ sources, title }) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const colors =
    theme === 'dark'
      ? {
          text: '#e1e1e1',
          subText: '#b0b0b0',
          border: '#333',
          link: '#32b8ca',
        }
      : {
          text: '#222',
          subText: '#555',
          border: '#ccc',
          link: '#32b8ca',
        };
  return (
    <View style={{ marginTop: 16, marginBottom: 16, paddingHorizontal: 8 }}>
      {title && (
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: colors.link }}>
          {title}
        </Text>
      )}
      {sources.map(source => (
        <View
          key={source.id}
          style={{
            marginBottom: 12,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border,
            paddingBottom: 8,
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 15, color: colors.text }}>
            {source.name}
          </Text>
          {source.link && (
            <TouchableOpacity onPress={() => Linking.openURL(source.link!)}>
              <Text
                style={{
                  color: colors.link,
                  textDecorationLine: 'underline',
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                {source.link}
              </Text>
            </TouchableOpacity>
          )}
          {source.description && (
            <Text style={{ color: colors.subText, fontSize: 12, marginTop: 2 }}>
              {source.description}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#32b8ca',
  },
  sourceItem: {
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingBottom: 8,
  },
  sourceName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  sourceLink: {
    color: '#32b8ca',
    textDecorationLine: 'underline',
    fontSize: 13,
    marginTop: 2,
  },
  sourceDescription: {
    color: '#555',
    fontSize: 12,
    marginTop: 2,
  },
});

export default SourcesList;
