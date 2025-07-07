import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { getDynamicStyles, standardSpacing } from '../utils/styleUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  searchMedikamente,
  getMedikamentDetails,
  testDatabaseConnection,
  MedikamentFilter,
  MedikamentSort,
  getDatabaseTables,
  getTableColumns,
  getFilterOptions as getFilterOptionsFromDB,
} from '../services/MedikamentService';
import Logger from '../utils/logger';
import { useTranslation } from 'react-i18next';

// Interfaces for medication data
interface Medikament {
  id: number;
  name: string;
  wirkstoff: string;
  staerke?: string;
  darreichungsform?: string;
  hersteller?: string;
  atc_code?: string;
}

// Database table column interface
interface TableColumn {
  name: string;
  type: string;
}

interface MedikamentDetail extends Medikament {
  anwendungsgebiete?: string[];
  nebenwirkungen?: string[];
  kontraindikationen?: string[];
  wechselwirkungen: string[];
  dosierung?: string;
  hinweise?: string;
  pzn?: string;
}

// Filter-Optionen als Funktion für Übersetzungen
const getFilterOptions = (t: any) => [
  { key: 'anwendungsgebiet', label: t('application_area') },
  { key: 'darreichungsform', label: t('dosage_form') },
  { key: 'atc_code', label: t('atc_code') },
  { key: 'nebenwirkung', label: t('side_effect') },
  { key: 'kontraindikation', label: t('contraindikation') },
  { key: 'wechselwirkung', label: t('interaction') },
  { key: 'hersteller', label: t('manufacturer') },
];

// Sortieroptionen als Funktion für Übersetzungen
const getSortOptions = (t: any) => [
  { key: 'name', label: t('name') },
  { key: 'wirkstoff', label: t('active_ingredient') },
  { key: 'atc_code', label: t('atc_code') },
];

// Benutzerdefinierte Styles für den Screen
const customStyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#333',
  },
});

const MedicationSearchScreen: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // Optimierte Abstände und Styles für die Medikamenten-Listeitems
  const listItemStyle = {
    marginVertical: 8,
    borderLeftWidth: 5,
    borderLeftColor: theme === 'dark' ? '#03dac6' : '#00acc1',
    borderRadius: 16,
    borderWidth: 0,
    // Leichte Schatten für bessere visuelle Tiefe
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 3,
    elevation: 2,
  };

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MedikamentFilter>({});
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [results, setResults] = useState<Medikament[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMed, setSelectedMed] = useState<MedikamentDetail | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null);
  const [filterInput, setFilterInput] = useState('');
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbInfo, setDbInfo] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);
  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [filterTypeModalVisible, setFilterTypeModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Get filter and sort options with translations
  const FILTER_OPTIONS = getFilterOptions(t);
  const SORT_OPTIONS = getSortOptions(t);

  // Hilfsfunktion zum Anzeigen der aktiven Filter
  const getActiveFiltersText = () => {
    const activeFilters = Object.keys(filter);
    if (activeFilters.length === 0) return t('no_filters');

    return activeFilters
      .map(key => {
        const option = FILTER_OPTIONS.find(opt => opt.key === key);
        return option ? option.label : key;
      })
      .join(', ');
  };

  // Get current sort option label
  const getSortLabel = () => {
    const option = SORT_OPTIONS.find(opt => opt.key === sortBy);
    return option ? option.label : t('name');
  };

  // Datenbankverbindung testen beim Komponenten-Mount
  useEffect(() => {
    const checkDatabase = async () => {
      setLoading(true);
      try {
        await testDatabaseConnection();

        // Get database structure info
        const tables = await getDatabaseTables() as string[];
        let info = `Tables: ${tables.join(', ')}`;

        if (tables.includes('medikamente')) {
          const columns = await getTableColumns('medikamente') as TableColumn[];
          const columnNames = columns.map(c => c.name).join(', ');
          info += `\nMedikamente columns: ${columnNames}`;
        }

        setDbInfo(info);
        setDbInitialized(true);
        performSearch();
      } catch (error) {
        setDbError(error instanceof Error ? error.message : 'Unknown database error');
        setDbInitialized(false);
        setLoading(false);
      }
    };

    checkDatabase();
  }, []);

  // When search parameters change
  useEffect(() => {
    if (dbInitialized) {
      Logger.debug('Search parameters changed, performing search...', {
        query,
        filter,
        sortBy,
        sortOrder,
      });
      performSearch();
    }
  }, [query, filter, sortBy, sortOrder, dbInitialized]);

  const performSearch = () => {
    if (!dbInitialized) return;

    setLoading(true);

    // Zeige an, wie viele Filter aktiv sind
    const activeFilterCount = Object.keys(filter).length;
    Logger.debug(`Performing search with ${activeFilterCount} active filters`);

    searchMedikamente({
      query,
      filter,
      sortBy,
      sortOrder,
      callback: (meds: Medikament[]) => {
        Logger.info(`Search completed, found ${meds.length} results`);
        setResults(meds);
        setLoading(false);
      },
    });
  };

  const openDetail = (med: Medikament) => {
    if (!dbInitialized) return;

    setLoading(true);
    getMedikamentDetails(med.id, (details: MedikamentDetail) => {
      setSelectedMed(details);
      setDetailModalVisible(true);
      setLoading(false);
    });
  };

  const loadFilterOptions = (filterKey: string) => {
    if (!dbInitialized) return;

    setFilterOptionsLoading(true);
    setFilterOptions([]);

    getFilterOptionsFromDB(filterKey, (options: string[]) => {
      setFilterOptions(options);
      setFilterOptionsLoading(false);
    });
  };

  const openFilterModal = (filterKey: string) => {
    setActiveFilterKey(filterKey);
    setFilterSearchQuery('');
    loadFilterOptions(filterKey);
    setFilterModalVisible(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    Logger.debug(`Filter selected: ${key} = ${value}`);

    // Erstelle eine Kopie des aktuellen Filters
    const newFilter = { ...filter };

    // Setze den Wert für den ausgewählten Filtertyp
    newFilter[key as keyof MedikamentFilter] = value;

    // Aktualisiere den Filter und schließe den Modal
    setFilter(newFilter);
    setFilterModalVisible(false);
    setActiveFilterKey(null);

    // Kein erneuter Aufruf von performSearch nötig, da der useEffect
    // durch die Änderung von filter automatisch ausgelöst wird
  };

  const clearFilter = (key: string) => {
    Logger.debug(`Clearing filter: ${key}`);

    // Erstelle eine Kopie des aktuellen Filters
    const newFilter = { ...filter };

    // Lösche den Wert für den ausgewählten Filtertyp
    delete newFilter[key as keyof MedikamentFilter];

    // Aktualisiere den Filter
    setFilter(newFilter);

    // Kein erneuter Aufruf von performSearch nötig, da der useEffect
    // durch die Änderung von filter automatisch ausgelöst wird
  };

  // Alle Filter löschen
  const clearAllFilters = () => {
    setFilter({});
  };

  // Show database info for debugging
  const showDebugInfo = () => {
    Alert.alert(t('database_info'), dbInfo);
  };

  // Filter the options based on search query
  const filteredOptions = filterSearchQuery
    ? filterOptions.filter(option => option.toLowerCase().includes(filterSearchQuery.toLowerCase()))
    : filterOptions;

  // Helper function to render a medication item in the list
  const renderMedicationItem = ({ item }: { item: Medikament }) => (
    <TouchableOpacity
      style={[
        {
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          padding: standardSpacing.m,
          marginHorizontal: standardSpacing.m,
          marginVertical: 8,
        },
        listItemStyle
      ]}
      onPress={() => openDetail(item)}
    >
      <Text
        style={{
          fontSize: baseFontSize * fontSizeScale * 1.1,
          fontWeight: 'bold',
          color: theme === 'dark' ? '#ffffff' : '#000000',
          marginBottom: 4,
        }}
      >
        {item.name}
      </Text>
      <Text
        style={{
          fontSize: baseFontSize * fontSizeScale * 0.9,
          color: theme === 'dark' ? '#b0b0b0' : '#666666',
          marginBottom: 4,
        }}
      >
        {item.wirkstoff}{item.atc_code ? ` | ${item.atc_code}` : ''}
      </Text>
      {item.hersteller && (
        <Text
          style={{
            fontSize: baseFontSize * fontSizeScale * 0.9,
            color: theme === 'dark' ? '#b0b0b0' : '#666666',
          }}
        >
          {item.hersteller}
        </Text>
      )}
    </TouchableOpacity>
  );

  // Main UI
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={{ padding: standardSpacing.m }}>
        <View
          style={[
            {
              backgroundColor: theme === 'dark' ? '#252525' : '#f0f0f0',
              borderRadius: 16,
              borderWidth: 0,
              paddingHorizontal: 12,
              flexDirection: 'row',
              alignItems: 'center',
              height: 48,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}
        >
          <Icon
            name="search"
            size={22}
            color={theme === 'dark' ? '#03dac6' : '#00acc1'}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={[
              {
                flex: 1,
                height: 48,
                paddingVertical: 8,
                color: theme === 'dark' ? '#ffffff' : '#000000',
                fontSize: baseFontSize * fontSizeScale,
              }
            ]}
            placeholder={t('med_search_placeholder')}
            placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon
                name="close-circle"
                size={20}
                color={theme === 'dark' ? '#aaaaaa' : '#777777'}
              />
            </TouchableOpacity>
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            marginTop: standardSpacing.m,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
              borderRadius: 16,
              padding: standardSpacing.m,
              marginRight: standardSpacing.s,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
              shadowRadius: 3,
              elevation: 2,
            }}
            onPress={() => setFilterTypeModalVisible(true)}
          >
            <Text
              style={{
                color: theme === 'dark' ? '#888888' : '#666666',
                fontSize: baseFontSize * fontSizeScale * 0.8,
              }}
            >
              {t('filter')}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  fontSize: baseFontSize * fontSizeScale,
                  marginRight: 4,
                }}
                numberOfLines={1}
              >
                {getActiveFiltersText()}
              </Text>
              <Icon
                name="chevron-down"
                size={16}
                color={theme === 'dark' ? '#ffffff' : '#000000'}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
              borderRadius: 16,
              padding: standardSpacing.m,
              marginLeft: standardSpacing.s,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
              shadowRadius: 3,
              elevation: 2,
            }}
            onPress={() => setSortModalVisible(true)}
          >
            <Text
              style={{
                color: theme === 'dark' ? '#888888' : '#666666',
                fontSize: baseFontSize * fontSizeScale * 0.8,
              }}
            >
              {t('sort_by')}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  fontSize: baseFontSize * fontSizeScale,
                  marginRight: 4,
                }}
              >
                {getSortLabel()}
              </Text>
              <Icon
                name="chevron-down"
                size={16}
                color={theme === 'dark' ? '#ffffff' : '#000000'}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {loading && results.length === 0 ? (
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color={theme === 'dark' ? '#03dac6' : '#00acc1'} />
          <Text
            style={{
              marginTop: standardSpacing.m,
              color: theme === 'dark' ? '#ffffff' : '#000000',
              fontSize: baseFontSize * fontSizeScale,
            }}
          >
            {t('loading_medications')}
          </Text>
        </View>
      ) : dbError ? (
        <View style={styles.centeredContent}>
          <Icon
            name="alert-circle-outline"
            size={50}
            color={theme === 'dark' ? '#cf6679' : '#e53935'}
            style={{ marginBottom: 16, opacity: 0.7 }}
          />
          <Text
            style={{
              color: theme === 'dark' ? '#cf6679' : '#e53935',
              fontSize: baseFontSize * fontSizeScale,
              textAlign: 'center',
              marginBottom: standardSpacing.m,
            }}
          >
            {t('database_connection_error')}
          </Text>
          <Text
            style={{
              color: theme === 'dark' ? '#b0b0b0' : '#666666',
              fontSize: baseFontSize * fontSizeScale * 0.9,
              textAlign: 'center',
            }}
          >
            {dbError}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderMedicationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ 
            paddingVertical: 8,
            paddingBottom: insets.bottom + 20
          }}
          ListEmptyComponent={
            <View style={[styles.centeredContent, { paddingTop: 40 }]}>
              <Icon
                name="search-outline"
                size={50}
                color={theme === 'dark' ? '#666666' : '#999999'}
                style={{ marginBottom: 16, opacity: 0.7 }}
              />
              <Text 
                style={[
                  styles.itemSubtitle, 
                  { 
                    textAlign: 'center',
                    fontSize: baseFontSize * fontSizeScale * 1.1
                  }
                ]}
              >
                {t('no_medications_found')}
              </Text>
              <Text
                style={[
                  styles.itemSubtitle,
                  {
                    textAlign: 'center',
                    fontSize: baseFontSize * fontSizeScale * 0.9,
                    marginTop: 8,
                    opacity: 0.7,
                  }
                ]}
              >
                {t('try_other_search_terms')}
              </Text>
            </View>
          }
        />
      )}

      {/* Filter-Typ Modal */}
      <Modal visible={filterTypeModalVisible} transparent animationType="slide">
        <View style={screenStyles.modalBg}>
          <View
            style={[
              screenStyles.modalContent,
              {
                width: '85%',
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
              },
            ]}
          >
            <Text
              style={{
                fontWeight: 'bold',
                marginBottom: 12,
                fontSize: 16,
                color: theme === 'dark' ? '#e1e1e1' : '#333',
              }}
            >
              {t('select_filter')}
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {FILTER_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme === 'dark' ? '#333' : '#eee',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    setFilterTypeModalVisible(false);
                    openFilterModal(option.key);
                  }}
                >
                  <Text style={{ fontSize: 16, color: theme === 'dark' ? '#e1e1e1' : '#333' }}>
                    {option.label}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {filter[option.key as keyof MedikamentFilter] && (
                      <View
                        style={{
                          backgroundColor: '#32b8ca',
                          borderRadius: 10,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12 }}>{t('active')}</Text>
                      </View>
                    )}
                    <Icon
                      name="chevron-forward"
                      size={18}
                      color={theme === 'dark' ? '#888' : '#aaa'}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setFilterTypeModalVisible(false)}
              style={{
                marginTop: 16,
                alignSelf: 'flex-end',
                padding: 8,
              }}
            >
              <Text style={{ color: '#32b8ca', fontWeight: 'bold' }}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Sort Options Modal */}
      <Modal visible={sortModalVisible} transparent animationType="slide">
        <View style={screenStyles.modalBg}>
          <View
            style={[
              screenStyles.modalContent,
              {
                width: '85%',
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
              },
            ]}
          >
            <Text
              style={{
                fontWeight: 'bold',
                marginBottom: 12,
                fontSize: 16,
                color: theme === 'dark' ? '#e1e1e1' : '#333',
              }}
            >
              {t('sort_by')}
            </Text>

            {/* Add sort order controls at the top */}
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme === 'dark' ? '#333' : '#eee',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: theme === 'dark' ? '#e1e1e1' : '#333' }}>
                Reihenfolge:
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor:
                      sortOrder === 'ASC' ? '#32b8ca' : theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                    padding: 8,
                    borderRadius: 8,
                    marginRight: 8,
                  }}
                  onPress={() => setSortOrder('ASC')}
                >
                  <Icon
                    name="arrow-up"
                    size={18}
                    color={sortOrder === 'ASC' ? '#fff' : theme === 'dark' ? '#e1e1e1' : '#555'}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      color: sortOrder === 'ASC' ? '#fff' : theme === 'dark' ? '#e1e1e1' : '#555',
                    }}
                  >
                    Aufsteigend
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor:
                      sortOrder === 'DESC' ? '#32b8ca' : theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                    padding: 8,
                    borderRadius: 8,
                  }}
                  onPress={() => setSortOrder('DESC')}
                >
                  <Icon
                    name="arrow-down"
                    size={18}
                    color={sortOrder === 'DESC' ? '#fff' : theme === 'dark' ? '#e1e1e1' : '#555'}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      color: sortOrder === 'DESC' ? '#fff' : theme === 'dark' ? '#e1e1e1' : '#555',
                    }}
                  >
                    Absteigend
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme === 'dark' ? '#333' : '#eee',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    setSortBy(option.key);
                    setSortModalVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 16, color: theme === 'dark' ? '#e1e1e1' : '#333' }}>
                    {option.label}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {sortBy === option.key && (
                      <View
                        style={{
                          backgroundColor: '#32b8ca',
                          borderRadius: 10,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12 }}>Aktiv</Text>
                      </View>
                    )}
                    <Icon
                      name="chevron-forward"
                      size={18}
                      color={theme === 'dark' ? '#888' : '#aaa'}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setSortModalVisible(false)}
              style={{
                marginTop: 16,
                alignSelf: 'flex-end',
                padding: 8,
              }}
            >
              <Text style={{ color: '#32b8ca', fontWeight: 'bold' }}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter-Optionen Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View style={screenStyles.modalBg}>
          <View
            style={[
              screenStyles.modalContent,
              {
                maxHeight: '80%',
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
              },
            ]}
          >
            <Text
              style={{
                fontWeight: 'bold',
                marginBottom: 8,
                color: theme === 'dark' ? '#e1e1e1' : '#333',
              }}
            >
              {t('filter')}: {FILTER_OPTIONS.find(f => f.key === activeFilterKey)?.label}
            </Text>

            <TextInput
              style={[
                customStyles.input,
                {
                  marginBottom: 12,
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
                  color: theme === 'dark' ? '#e1e1e1' : '#333',
                  borderWidth: 1,
                  borderColor: theme === 'dark' ? '#444' : '#ddd',
                  borderRadius: 8,
                  padding: 10,
                },
              ]}
              placeholder={t('filter_options_placeholder')}
              placeholderTextColor={theme === 'dark' ? '#888' : '#aaa'}
              value={filterSearchQuery}
              onChangeText={setFilterSearchQuery}
              autoFocus
            />

            {filterOptionsLoading ? (
              <ActivityIndicator size="small" color="#32b8ca" style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === 'dark' ? '#333' : '#eee',
                      }}
                      onPress={() => handleFilterChange(activeFilterKey || '', option)}
                    >
                      <Text style={{ color: theme === 'dark' ? '#e1e1e1' : '#333' }}>{option}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text
                    style={{
                      textAlign: 'center',
                      marginTop: 20,
                      color: theme === 'dark' ? '#888' : '#666',
                    }}
                  >
                    {t('no_filter_options_found')}
                  </Text>
                )}
              </ScrollView>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={{
                  marginRight: 16,
                  padding: 8,
                }}
              >
                <Text style={{ color: theme === 'dark' ? '#e1e1e1' : '#333' }}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={detailModalVisible} animationType="slide">
        <ScrollView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#121212' : '#fff' }}>
          <View style={{ padding: standardSpacing.l }}>
            <TouchableOpacity
              onPress={() => setDetailModalVisible(false)}
              style={{ alignSelf: 'flex-end', marginBottom: 8 }}
            >
              <Icon name="close" size={28} color="#32b8ca" />
            </TouchableOpacity>
            {selectedMed ? (
              <>
                <Text
                  style={[
                    screenStyles.detailTitle,
                    { color: theme === 'dark' ? '#e1e1e1' : '#333' },
                  ]}
                >
                  {selectedMed.name}
                </Text>
                <Text style={screenStyles.detailSub}>
                  {selectedMed.wirkstoff} | {selectedMed.atc_code}
                </Text>
                <Text style={screenStyles.detailSub}>{selectedMed.hersteller}</Text>
                <Text
                  style={[
                    screenStyles.detailLabel,
                    { color: theme === 'dark' ? '#e1e1e1' : '#333' },
                  ]}
                >
                  {t('pzn')}:{' '}
                  <Text
                    style={[
                      screenStyles.detailValue,
                      { color: theme === 'dark' ? '#b0b0b0' : '#333' },
                    ]}
                  >
                    {selectedMed.pzn}
                  </Text>
                </Text>
                <Text
                  style={[
                    screenStyles.detailLabel,
                    { color: theme === 'dark' ? '#e1e1e1' : '#333' },
                  ]}
                >
                  {t('dosage_form')}:{' '}
                  <Text
                    style={[
                      screenStyles.detailValue,
                      { color: theme === 'dark' ? '#b0b0b0' : '#333' },
                    ]}
                  >
                    {selectedMed.darreichungsform}
                  </Text>
                </Text>
                <Text
                  style={[
                    screenStyles.detailLabel,
                    { color: theme === 'dark' ? '#e1e1e1' : '#333' },
                  ]}
                >
                  {t('application_areas')}:
                </Text>
                {selectedMed.anwendungsgebiete?.length ? (
                  selectedMed.anwendungsgebiete.map((a: any, i: number) => (
                    <Text
                      key={i}
                      style={[
                        screenStyles.detailValue,
                        { color: theme === 'dark' ? '#b0b0b0' : '#333' },
                      ]}
                    >
                      - {a.gebiet}
                    </Text>
                  ))
                ) : (
                  <Text
                    style={[
                      screenStyles.detailValue,
                      { color: theme === 'dark' ? '#b0b0b0' : '#333' },
                    ]}
                  >
                    {t('none')}
                  </Text>
                )}
                <Text
                  style={[
                    screenStyles.detailLabel,
                    { color: theme === 'dark' ? '#e1e1e1' : '#333' },
                  ]}
                >
                  {t('side_effects')}:
                </Text>
                {selectedMed.nebenwirkungen?.length ? (
                  selectedMed.nebenwirkungen.map((n: any, i: number) => (
                    <Text
                      key={i}
                      style={[
                        screenStyles.detailValue,
                        { color: theme === 'dark' ? '#b0b0b0' : '#333' },
                      ]}
                    >
                      - {n.nebenwirkung}
                    </Text>
                  ))
                ) : (
                  <Text
                    style={[
                      screenStyles.detailValue,
                      { color: theme === 'dark' ? '#b0b0b0' : '#333' },
                    ]}
                  >
                    {t('none')}
                  </Text>
                )}
                <Text
                  style={[
                    screenStyles.detailLabel,
                    { color: theme === 'dark' ? '#e1e1e1' : '#333' },
                  ]}
                >
                  {t('contraindications')}:
                </Text>
                {selectedMed.kontraindikationen?.length ? (
                  selectedMed.kontraindikationen.map((k: any, i: number) => (
                    <Text
                      key={i}
                      style={[
                        screenStyles.detailValue,
                        { color: theme === 'dark' ? '#b0b0b0' : '#333' },
                      ]}
                    >
                      - {k.kontraindikation}
                    </Text>
                  ))
                ) : (
                  <Text
                    style={[
                      screenStyles.detailValue,
                      { color: theme === 'dark' ? '#b0b0b0' : '#333' },
                    ]}
                  >
                    {t('none')}
                  </Text>
                )}
                {selectedMed.wechselwirkungen?.length > 0 && (
                  <>
                    <Text
                      style={[
                        screenStyles.detailLabel,
                        { color: theme === 'dark' ? '#e1e1e1' : '#333' },
                      ]}
                    >
                      {t('interactions')}:
                    </Text>
                    {selectedMed.wechselwirkungen.map((w: any, i: number) => (
                      <Text
                        key={i}
                        style={[
                          screenStyles.detailValue,
                          { color: theme === 'dark' ? '#b0b0b0' : '#333' },
                        ]}
                      >
                        - {w.wechselwirkung}
                      </Text>
                    ))}
                  </>
                )}
              </>
            ) : (
              <Text style={{ color: theme === 'dark' ? '#e1e1e1' : '#333' }}>{t('loading_details')}</Text>
            )}
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const screenStyles = StyleSheet.create({
  listItem: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
  },
  medName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  medSub: {
    color: '#666',
    fontSize: 14,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    elevation: 4,
  },
  detailTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 4,
  },
  detailSub: {
    color: '#32b8ca',
    fontSize: 16,
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  detailValue: {
    marginLeft: 8,
    color: '#333',
  },
});

export default MedicationSearchScreen;
