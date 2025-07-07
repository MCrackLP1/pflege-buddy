/**
 * @fileoverview ChangelogModal - Zeigt App-Updates und Änderungen an
 * @module ChangelogModal
 * @description
 * Dieses Modal zeigt Benutzern nach App-Updates die Changelog-Informationen an.
 * Es wird automatisch angezeigt, wenn eine neue Version erkannt wird.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { ChangelogEntry } from '../data/changelog';
import ChangelogService from '../services/ChangelogService';
import Logger from '../utils/logger';

interface ChangelogModalProps {
  visible: boolean;
  onClose: () => void;
  changelogEntries: ChangelogEntry[];
}

/**
 * Gibt ein Icon für einen Changelog-Typ zurück
 */
const getChangeTypeIcon = (type: string): string => {
  switch (type) {
    case 'feature':
      return '✨';
    case 'improvement':
      return '⚡';
    case 'bugfix':
      return '🐛';
    case 'breaking':
      return '⚠️';
    default:
      return '📝';
  }
};

/**
 * Gibt eine Farbe für einen Changelog-Typ zurück
 */
const getChangeTypeColor = (type: string, isDarkMode: boolean): string => {
  const colors = {
    feature: isDarkMode ? '#4ade80' : '#16a34a',
    improvement: isDarkMode ? '#60a5fa' : '#2563eb',
    bugfix: isDarkMode ? '#f87171' : '#dc2626',
    breaking: isDarkMode ? '#fbbf24' : '#d97706',
  };
  return colors[type as keyof typeof colors] || (isDarkMode ? '#9ca3af' : '#6b7280');
};

/**
 * ChangelogModal Komponente
 */
const ChangelogModal: React.FC<ChangelogModalProps> = ({
  visible,
  onClose,
  changelogEntries,
}) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const { t } = useTranslation();
  const [isClosing, setIsClosing] = useState(false);

  const isDarkMode = theme === 'dark';
  const scaledFontSize = baseFontSize * fontSizeScale;
  const scaledStyles = getScaledStyles(scaledFontSize, isDarkMode);

  const handleClose = async () => {
    setIsClosing(true);
    
    try {
      // Markiere alle angezeigten Versionen als gesehen
      const changelogService = ChangelogService.getInstance();
      for (const entry of changelogEntries) {
        await changelogService.markChangelogAsShown(entry.version);
      }
      
      Logger.info('ChangelogModal', `Marked ${changelogEntries.length} changelog entries as shown`);
    } catch (error) {
      Logger.error('ChangelogModal', 'Failed to mark changelog as shown', error);
    }
    
    setIsClosing(false);
    onClose();
  };

  // Zeige nichts wenn keine Einträge vorhanden sind
  if (!changelogEntries || changelogEntries.length === 0) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={scaledStyles.safeArea}>
        <View style={scaledStyles.modalContainer}>
          <View style={scaledStyles.modalContent}>
            {/* Header */}
            <View style={scaledStyles.header}>
              <Text style={scaledStyles.title}>
                🎉 {t('changelog_title', 'Was ist neu?')}
              </Text>
              <Text style={scaledStyles.subtitle}>
                {t('changelog_subtitle', 'Wir haben die App für dich verbessert!')}
              </Text>
            </View>

            {/* Changelog-Einträge */}
            <ScrollView style={scaledStyles.scrollView} showsVerticalScrollIndicator={false}>
              {changelogEntries.map((entry, index) => (
                <View key={entry.version} style={scaledStyles.entryContainer}>
                  {/* Versions-Header */}
                  <View style={scaledStyles.versionHeader}>
                    <Text style={scaledStyles.versionTitle}>
                      Version {entry.version}
                    </Text>
                    <Text style={scaledStyles.versionDate}>
                      {new Date(entry.date).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>

                  {/* Highlights */}
                  {entry.highlights && entry.highlights.length > 0 && (
                    <View style={scaledStyles.highlightsContainer}>
                      <Text style={scaledStyles.highlightsTitle}>
                        ⭐ {t('changelog_highlights', 'Highlights')}
                      </Text>
                      {entry.highlights.map((highlight, idx) => (
                        <View key={idx} style={scaledStyles.highlightItem}>
                          <Text style={scaledStyles.highlightText}>• {highlight}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Änderungen */}
                  <View style={scaledStyles.changesContainer}>
                    <Text style={scaledStyles.changesTitle}>
                      {t('changelog_changes', 'Änderungen')}
                    </Text>
                    {entry.changes.map((change, idx) => (
                      <View key={idx} style={scaledStyles.changeItem}>
                        <Text style={scaledStyles.changeIcon}>
                          {getChangeTypeIcon(change.type)}
                        </Text>
                        <Text
                          style={[
                            scaledStyles.changeText,
                            { color: getChangeTypeColor(change.type, isDarkMode) },
                          ]}
                        >
                          {change.description}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Trennlinie (außer für letzten Eintrag) */}
                  {index < changelogEntries.length - 1 && (
                    <View style={scaledStyles.separator} />
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={scaledStyles.footer}>
              <TouchableOpacity
                style={scaledStyles.closeButton}
                onPress={handleClose}
                disabled={isClosing}
              >
                <Text style={scaledStyles.closeButtonText}>
                  {isClosing 
                    ? t('changelog_closing', 'Schließen...') 
                    : t('changelog_close', 'Verstanden')
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

/**
 * Styles mit Skalierungsfaktor für Schriftgröße
 */
const getScaledStyles = (fontSize: number, isDarkMode: boolean) => {
  const { width, height } = Dimensions.get('window');

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      width: width * 0.9,
      maxHeight: height * 0.8,
      backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
      overflow: 'hidden',
    },
    header: {
      padding: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    },
    title: {
      fontSize: fontSize * 1.4,
      fontWeight: 'bold',
      textAlign: 'center',
      color: isDarkMode ? '#32b8ca' : '#1f2937',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: fontSize * 0.9,
      textAlign: 'center',
      color: isDarkMode ? '#9ca3af' : '#6b7280',
    },
    scrollView: {
      maxHeight: height * 0.5,
      paddingHorizontal: 24,
    },
    entryContainer: {
      paddingVertical: 16,
    },
    versionHeader: {
      marginBottom: 16,
    },
    versionTitle: {
      fontSize: fontSize * 1.2,
      fontWeight: 'bold',
      color: isDarkMode ? '#60a5fa' : '#2563eb',
      marginBottom: 4,
    },
    versionDate: {
      fontSize: fontSize * 0.8,
      color: isDarkMode ? '#9ca3af' : '#6b7280',
    },
    highlightsContainer: {
      marginBottom: 16,
      backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
      borderRadius: 8,
      padding: 12,
    },
    highlightsTitle: {
      fontSize: fontSize * 1.0,
      fontWeight: 'bold',
      color: isDarkMode ? '#fbbf24' : '#d97706',
      marginBottom: 8,
    },
    highlightItem: {
      marginBottom: 4,
    },
    highlightText: {
      fontSize: fontSize * 0.9,
      color: isDarkMode ? '#d1d5db' : '#374151',
      lineHeight: fontSize * 1.3,
    },
    changesContainer: {
      marginBottom: 8,
    },
    changesTitle: {
      fontSize: fontSize * 1.0,
      fontWeight: 'bold',
      color: isDarkMode ? '#e5e7eb' : '#374151',
      marginBottom: 12,
    },
    changeItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    changeIcon: {
      fontSize: fontSize * 1.1,
      marginRight: 8,
      marginTop: 1,
    },
    changeText: {
      flex: 1,
      fontSize: fontSize * 0.9,
      lineHeight: fontSize * 1.3,
    },
    separator: {
      height: 1,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#e5e7eb',
      marginTop: 8,
    },
    footer: {
      padding: 24,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    },
    closeButton: {
      backgroundColor: isDarkMode ? '#32b8ca' : '#3b82f6',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: fontSize * 1.0,
      fontWeight: 'bold',
      color: '#ffffff',
    },
  });
};

export default ChangelogModal; 