/**
 * ErrorBoundary.tsx
 * 
 * Eine Komponente zum Abfangen von unbehandelten Fehlern in React-Komponenten.
 * Verhindert, dass die gesamte App abstürzt, wenn ein Fehler in einer Komponente auftritt.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import Logger from '../utils/logger';
import { useTranslation } from 'react-i18next';

// Props-Interface für die ErrorBoundary-Komponente
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// State-Interface für die ErrorBoundary-Komponente
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary-Komponente zum Abfangen von Fehlern
 * Wird verwendet, um die App vor Abstürzen zu schützen und benutzerfreundliche
 * Fehlerseiten anzuzeigen
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // Diese Lifecycle-Methode wird aufgerufen, wenn ein Fehler in einem Kind auftritt
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  // Diese Lifecycle-Methode wird aufgerufen, wenn ein Fehler in einem Kind auftritt
  // Hier können wir den Fehler protokollieren
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Fehler in unserem Logger protokollieren
    Logger.exception(error, 'ErrorBoundary');
    
    // Optional: Fehlerzurückruf aufrufen, wenn bereitgestellt
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // Fehler zurücksetzen und erneut versuchen
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    // Wenn ein Fehler aufgetreten ist, zeigen wir die Fallback-UI an
    if (this.state.hasError) {
      // Benutzerdefinierte Fallback-Komponente verwenden, wenn bereitgestellt
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Standard-Fehlerfallback-UI
      const { error, errorInfo } = this.state;
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Ein Fehler ist aufgetreten</Text>
          <Text style={styles.subtitle}>Die Anwendung ist auf einen unerwarteten Fehler gestoßen</Text>
          
          <ScrollView style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Fehlerdetails:</Text>
            <Text style={styles.errorMessage}>{error?.toString()}</Text>
            
            {__DEV__ && errorInfo && (
              <Text style={styles.errorStack}>
                {errorInfo.componentStack}
              </Text>
            )}
          </ScrollView>
          
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Wenn kein Fehler aufgetreten ist, rendern wir die Kinder normal
    return this.props.children;
  }
}

// Erstellen eines Wrappers, um den Theme-Context verwenden zu können
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

// Styles für den Fehlerbildschirm
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    maxHeight: 300,
    width: '100%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 12,
  },
  errorStack: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#32b8ca',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ErrorBoundary; 