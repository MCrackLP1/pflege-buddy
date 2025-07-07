import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definitionen für fehlende Browser-APIs in React Native
declare global {
  interface Response {
    body: ReadableStream<Uint8Array> | null;
  }

  interface ReadableStream<R = any> {
    getReader(): ReadableStreamDefaultReader<R>;
  }

  interface ReadableStreamDefaultReader<R = any> {
    read(): Promise<ReadableStreamReadResult<R>>;
    releaseLock(): void;
  }

  interface ReadableStreamReadResult<T> {
    done: boolean;
    value?: T;
  }

  class TextDecoder {
    constructor(encoding?: string);
    decode(input?: Uint8Array, options?: { stream?: boolean }): string;
  }
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp?: string;
}

// const API_URL = 'https://kuglergames.duckdns.org:3000/api/chat';
// Verwende einen lokalen Mock für die Entwicklung
// const API_URL = 'https://httpbin.org/post'; // Testzwecke - httpbin gibt die gesendeten Daten zurück

// Externer Server mit HTTPS
const API_URL = 'https://kuglergames.duckdns.org:8443/api/chat';
// Streaming-Endpunkt mit Fallback auf non-streaming, wenn der Streaming-Endpunkt nicht erreichbar ist
const API_STREAM_URL = 'https://kuglergames.duckdns.org:8443/api/chat/stream';
const API_KEY = 'f8a3b2c1-d9e7-4f08-a6b5-e2c1a9f7d4e0';

// Flag für den Offline-Modus
let OFFLINE_MODE = false;

// Verbesserte Fallback-Antworten mit zusätzlichen Kategorien
const FALLBACK_RESPONSES: Record<string, string> = {
  grippe:
    'Typische Grippesymptome sind hohes Fieber, Muskelschmerzen, Kopfschmerzen, trockener Husten, allgemeine Schwäche und Müdigkeit.',
  erkältung:
    'Erkältungssymptome sind meist Schnupfen, Husten, leichtes Fieber, Halsschmerzen und Niesen.',
  kopfschmerzen:
    'Kopfschmerzen können verschiedene Ursachen haben wie Stress, Dehydrierung, Schlafmangel oder Erkrankungen.',
  fieber:
    'Fieber ist ein Symptom, bei dem die Körpertemperatur über 38°C liegt. Es ist eine natürliche Abwehrreaktion des Körpers gegen Infektionen.',
  blutdruck:
    'Normaler Blutdruck liegt bei etwa 120/80 mmHg. Hoher Blutdruck (über 140/90) kann zu Herz-Kreislauf-Erkrankungen führen.',
  diabetes:
    'Diabetes ist eine Stoffwechselerkrankung, bei der der Blutzuckerspiegel erhöht ist. Es gibt Typ 1 und Typ 2 Diabetes.',
  server_error:
    'Entschuldigung, der medizinische KI-Dienst ist momentan überlastet oder nicht verfügbar. Ihre Anfrage wurde gespeichert und wird bearbeitet, sobald der Dienst wieder verfügbar ist.',
  llm_error:
    'Das medizinische KI-Modell konnte Ihre Anfrage nicht verarbeiten. Bitte stellen Sie Ihre Frage klarer oder vereinfachen Sie sie.',
  default:
    'Es tut mir leid, der Server scheint derzeit nicht erreichbar zu sein. Bei medizinischen Notfällen wenden Sie sich bitte direkt an einen Arzt oder rufen Sie den Notdienst.',
};

// Hilfsfunktion für Fallback-Antworten
const getFallbackResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();

  // Suche nach Keywords in der Anfrage
  for (const [keyword, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (keyword !== 'default' && lowerQuery.includes(keyword)) {
      return response;
    }
  }

  return FALLBACK_RESPONSES.default;
};

// Sicherere Fehlerbehandlung, die keine Error.stack-Probleme verursacht
const safeErrorHandler = (error: any, message: string = ''): string => {
  try {
    // Vermeide Error.stack-Zugriffe, die zu Fehlern führen können
    return `${message} ${error?.message || 'Unbekannter Fehler'}`;
  } catch {
    return `${message} Fehlerdetails nicht verfügbar`;
  }
};

// Funktion zum Parsen von Server-Sent Events in React Native
const parseSSEResponse = (text: string) => {
  const result: Array<{ data: string }> = [];

  const lines = text.split('\n');
  let currentData = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('data:')) {
      currentData = line.substring(5).trim();
      if (currentData) {
        result.push({ data: currentData });
      }
    } else if (line === '' && currentData) {
      // Leere Zeile markiert das Ende eines Events
      currentData = '';
    }
  }

  return result;
};

// Konstante für maximale Anzahl Zeichen, bevor eine Nachricht gekürzt wird
// Auf einen sehr hohen Wert setzen, damit Nachrichten praktisch nie gekürzt werden
const MAX_MESSAGE_LENGTH = 100000;

// --- Neue AI Lade-Platzhalter Komponente ---
const AiLoadingPlaceholder = ({ theme }: { theme: 'light' | 'dark' }) => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const dotScale1 = useRef(new Animated.Value(0.8)).current;
  const dotScale2 = useRef(new Animated.Value(0.8)).current;
  const dotScale3 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    let isMounted = true;
    const animate = () => {
      if (!isMounted) return;
      
      // Create a combined animation for opacity and scale
      Animated.parallel([
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dotScale1, { toValue: 1.2, duration: 300, useNativeDriver: true }),
          Animated.timing(dotScale1, { toValue: 0.8, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(150),
          Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(150),
          Animated.timing(dotScale2, { toValue: 1.2, duration: 300, useNativeDriver: true }),
          Animated.timing(dotScale2, { toValue: 0.8, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(dotScale3, { toValue: 1.2, duration: 300, useNativeDriver: true }),
          Animated.timing(dotScale3, { toValue: 0.8, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => {
        if (isMounted) {
          animate();
        }
      });
    };
    animate();
    return () => {
      isMounted = false;
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
      dotScale1.stopAnimation();
      dotScale2.stopAnimation();
      dotScale3.stopAnimation();
    };
  }, [dot1, dot2, dot3, dotScale1, dotScale2, dotScale3]);

  const dotColor = theme === 'dark' ? '#32b8ca' : '#32b8ca';

  return (
    <View style={[styles.messageBubble, styles.aiMessage, { backgroundColor: 'transparent' }]}>
      <View style={[
        styles.messageContent,
        styles.aiMessageContent,
        { 
          backgroundColor: 'transparent',
          alignItems: 'flex-start',
          elevation: 0,
          shadowOpacity: 0,
          borderRadius: 0
        }
      ]}>
        <View style={[styles.dotsRow, { justifyContent: 'flex-start' }]}>
          <Animated.View style={[
            styles.dot, 
            { 
              opacity: dot1, 
              backgroundColor: dotColor,
              transform: [{ scale: dotScale1 }]
            }
          ]} />
          <Animated.View style={[
            styles.dot, 
            { 
              opacity: dot2, 
              backgroundColor: dotColor,
              transform: [{ scale: dotScale2 }]
            }
          ]} />
          <Animated.View style={[
            styles.dot, 
            { 
              opacity: dot3, 
              backgroundColor: dotColor,
              transform: [{ scale: dotScale3 }]
            }
          ]} />
        </View>
      </View>
    </View>
  );
};
// --- Ende Lade-Platzhalter Komponente ---

// Simple gradient background for the input area
const InputBackground = ({ theme }: { theme: 'light' | 'dark' }) => {
  return (
    <View style={styles.backgroundContainer}>
      <LinearGradient
        colors={[
          theme === 'dark' ? 'rgba(30, 30, 30, 0)' : 'rgba(255, 255, 255, 0)',
          theme === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          theme === 'dark' ? 'rgba(30, 30, 30, 1)' : 'rgba(255, 255, 255, 1)',
        ]}
        style={styles.backgroundGradient}
      />
    </View>
  );
};

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { theme, fontSizeScale } = useSettings();
  const { t } = useTranslation();
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
  const cursorAnim = useRef(new Animated.Value(0)).current;
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

  // Check if user has visited before
  useEffect(() => {
    const checkFirstVisit = async () => {
      try {
        const hasVisited = await AsyncStorage.getItem('hasVisitedChat');
        if (hasVisited) {
          setShowWelcomeMessage(false);
        } else {
          setShowWelcomeMessage(true);
        }
      } catch (error) {
        console.error('Error checking first visit:', error);
      }
    };
    
    checkFirstVisit();
  }, []);

  // Blinking cursor animation
  useEffect(() => {
    if (streamingMessage) {
      const cursorAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      
      cursorAnimation.start();
      
      return () => {
        cursorAnimation.stop();
      };
    }
  }, [streamingMessage, cursorAnim]);

  // Prüft, ob der ScrollView am unteren Rand ist
  const isScrollAtBottom = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
  };

  // Scroll-Handler
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollAtBottom(event)) {
      setUserHasScrolledUp(false);
      setShowScrollToBottomButton(false);
    } else {
      setUserHasScrolledUp(true);
      setShowScrollToBottomButton(true);
    }
  };

  // Scrollt nach unten und setzt Flags zurück
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    setUserHasScrolledUp(false);
    setShowScrollToBottomButton(false);
  };

  // Automatisches Scrollen bei neuen Nachrichten, aber nur wenn User nicht hochgescrollt ist
  useEffect(() => {
    if (!userHasScrolledUp) {
      scrollToBottom();
    }
  }, [messages, streamingMessage]);

  const formatTimestamp = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Set that user has visited chat
    if (showWelcomeMessage) {
      setShowWelcomeMessage(false);
      try {
        await AsyncStorage.setItem('hasVisitedChat', 'true');
      } catch (error) {
        console.error('Error saving visit status:', error);
      }
    }

    setUserHasScrolledUp(false);
    setShowScrollToBottomButton(false);

    const userMessageId = Date.now().toString();
    const timestamp = formatTimestamp();
    const userMessage: Message = {
      id: userMessageId,
      text: inputText,
      isUser: true,
      timestamp,
    };

    const currentInput = inputText;
    setInputText('');
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);
    setIsWaitingForResponse(true);
    setStreamingMessage(null);

    setTimeout(() => scrollToBottom(), 50);

    const streamId = (Date.now() + 1).toString();

    if (OFFLINE_MODE) {
      setTimeout(() => {
        const offlineResponse = getFallbackResponse(currentInput);
        setMessages(prev => [
          ...prev,
          { id: streamId, text: offlineResponse, isUser: false, timestamp: formatTimestamp() },
        ]);
        setIsLoading(false);
        setIsWaitingForResponse(false);
      }, 500);
      return;
    }

    const doStreamingRequest = () => {
      return new Promise<string>((resolve, reject) => {
        try {
          let accumulatedText = '';
          const xhr = new XMLHttpRequest();
          let buffer = '';
          let firstChunkReceived = false;
          xhr.timeout = 180000;

          xhr.onreadystatechange = () => {
            try {
              if (xhr.readyState >= 3) {
                const newData = xhr.responseText.substring(buffer.length);
                buffer = xhr.responseText;
                const events = parseSSEResponse(newData);

                if (events.length > 0 && !firstChunkReceived) {
                  firstChunkReceived = true;
                  setIsWaitingForResponse(false);
                }

                for (const event of events) {
                  try {
                    if (event.data === '[DONE]') continue;
                    let content = '';
                    let parsed: any = null;
                    let isThinkingEvent = false;
                    try {
                      parsed = JSON.parse(event.data);
                      // Prüfe auf thinking-Event
                      if (parsed.thinking === true) {
                        setIsThinking(true);
                        setStreamingMessage(null); // Text-Stream zurücksetzen
                        isThinkingEvent = true;
                      }
                      content =
                        parsed.choices?.[0]?.delta?.content ||
                        parsed.text ||
                        parsed.content ||
                        parsed.chunk ||
                        '';
                    } catch (e) {
                      content = typeof event.data === 'string' ? event.data : '';
                    }

                    // Filtere Systemtexte wie <think>, <thinking>, "Denke nach...", etc.
                    const trimmed = content.trim().toLowerCase();
                    if (
                      trimmed === "<think>" ||
                      trimmed === "<thinking>" ||
                      trimmed === t('thinking_dots') ||
                      trimmed === t('thinking_text') ||
                      trimmed === "thinking..." ||
                      trimmed === "thinking"
                    ) {
                      // Ignorieren, nicht zum Antworttext hinzufügen!
                      continue;
                    }

                    // Wenn ein Text kommt, thinking wieder ausblenden
                    if (content && !isThinkingEvent) {
                      setIsThinking(false);
                      accumulatedText += content;
                      if (firstChunkReceived) {
                         setStreamingMessage({
                            id: streamId,
                            text: accumulatedText,
                            isUser: false,
                         });
                      }
                    }
                  } catch (parseError) {
                     console.error("Error parsing SSE event data:", parseError, "Data:", event.data);
                  }
                }
              }
              if (xhr.readyState === 4) {
                if (!firstChunkReceived) {
                     setIsWaitingForResponse(false);
                }
                setIsThinking(false); // Sicherheitshalber am Ende
                if (xhr.status >= 200 && xhr.status < 300) {
                                      resolve(accumulatedText || t('no_response_received'));
                } else {
                  reject(new Error(`${t('http_error')} ${xhr.status} ${xhr.statusText}`));
                }
              }
            } catch (readyStateError) {
                 console.error("Error in onreadystatechange:", readyStateError);
                 if (isWaitingForResponse) setIsWaitingForResponse(false);
                 setIsThinking(false);
                 reject(readyStateError);
            }
          };

          xhr.ontimeout = () => {
            reject(new Error(t('timeout_streaming_request')));
          };
          xhr.onerror = () => {
            reject(new Error(t('network_error_streaming')));
          };
          xhr.onabort = () => {
            reject(new Error(t('streaming_request_aborted')));
          };

          xhr.open('POST', API_STREAM_URL, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('X-API-Key', API_KEY);
          xhr.setRequestHeader('Accept', 'text/event-stream');
          xhr.send(
            JSON.stringify({
              prompt: currentInput,
              stream: true,
            })
          );
        } catch (setupError) {
           console.error("Error setting up streaming request:", setupError);
          reject(setupError);
        }
      });
    };

    try {
      const streamedResponse = await doStreamingRequest();

      setMessages(prev => [
        ...prev.filter(m => m.id !== streamId),
        {
          id: streamId,
          text: streamedResponse,
          isUser: false,
          timestamp: formatTimestamp(),
        },
      ]);
      setStreamingMessage(null);

    } catch (error: any) {
       console.error("Error during chat request:", error);
        try {
            const regularResponse = await fetch(API_URL, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
                 body: JSON.stringify({ prompt: currentInput }),
             });
             if (!regularResponse.ok) {
                 throw new Error(`${t('regular_api_failed')} ${regularResponse.status}`);
             }
             const data = await regularResponse.json();
             let responseText = '';
             if (typeof data === 'string') { responseText = data; }
             else if (data.response) { responseText = data.response; }
             else if (data.answer) { responseText = data.answer; }
             else if (data.content) { responseText = data.content; }
             else if (data.reply) { responseText = data.reply; }
             else {
                 const stringEntry = Object.entries(data).find(([_, value]) => typeof value === 'string');
                 if (stringEntry && typeof stringEntry[1] === 'string') { responseText = stringEntry[1]; }
                 else { responseText = JSON.stringify(data); }
             }
             const cleanedText = responseText.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"').replace(/\\n/g, '\n');

             setMessages(prev => [
                 ...prev,
                 { id: streamId, text: cleanedText, isUser: false, timestamp: formatTimestamp() }
             ]);

        } catch (fallbackError: any) {
            console.error("Error during fallback API request:", fallbackError);
             const errorMsg = safeErrorHandler(fallbackError, t('error_sending'));
             const isNetworkError = errorMsg.includes('Network') || errorMsg.includes('Netzwerk') || errorMsg.includes('Failed to fetch');

             let displayError = FALLBACK_RESPONSES.server_error;
             if (isNetworkError) {
                 OFFLINE_MODE = true;
                 displayError = getFallbackResponse(currentInput);
                 Alert.alert(t('networkError'), t('connectionNotPossible'), [{ text: t('ok') }]);
             }

              setMessages(prev => [
                ...prev,
                { id: streamId, text: displayError, isUser: false, timestamp: formatTimestamp() }
              ]);
        }

    } finally {
      setStreamingMessage(null);
      setIsLoading(false);
      setIsWaitingForResponse(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#F8F9FA' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: 80 }]}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        onScrollBeginDrag={() => {
          setUserHasScrolledUp(true);
          setShowScrollToBottomButton(true);
        }}
        scrollEventThrottle={16}
      >
        {showWelcomeMessage && (
          <View style={styles.welcomeContainer}>
            <Text style={[
              styles.welcomeTitle,
              { color: theme === 'dark' ? '#FFFFFF' : '#333333' }
            ]}>
              {t('welcomeTitle')}
            </Text>
            <Text style={[
              styles.welcomeText,
              { color: theme === 'dark' ? '#CCCCCC' : '#555555' }
            ]}>
              {t('welcomeText')}
            </Text>
            <Text style={[
              styles.welcomeHint,
              { color: theme === 'dark' ? '#32b8ca' : '#32b8ca' }
            ]}>
              {t('welcomeHint')}
            </Text>
          </View>
        )}

        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userMessage : styles.aiMessage,
              message.isUser
                ? theme === 'dark' ? styles.userMessageDark : styles.userMessageLight
                : [theme === 'dark' ? styles.aiMessageDark : styles.aiMessageLight, { backgroundColor: 'transparent' }],
            ]}
          >
            {message.isUser ? (
              <LinearGradient
                colors={['#3AC1CF', '#32b8ca', '#2AAFBF']}
                style={[
                  styles.messageContent,
                  styles.userMessageContent,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text
                  style={[
                    styles.messageText,
                    { fontSize: 16 * fontSizeScale },
                    styles.userMessageText,
                  ]}
                >
                  {message.text}
                </Text>
                {message.timestamp && (
                  <Text
                    style={[
                      styles.timestampText,
                      { color: 'rgba(255, 255, 255, 0.7)', alignSelf: 'flex-end' }
                    ]}
                  >
                    {message.timestamp}
                  </Text>
                )}
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.messageContent,
                  styles.aiMessageContent,
                  {
                    backgroundColor: 'transparent',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderRadius: 0
                  },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { fontSize: 16 * fontSizeScale },
                    theme === 'dark' ? styles.aiMessageTextDark : styles.aiMessageTextLight,
                  ]}
                >
                  {message.text}
                </Text>
                {message.timestamp && (
                  <Text
                    style={[
                      styles.timestampText,
                      { color: theme === 'dark' ? 'rgba(224, 224, 224, 0.7)' : 'rgba(48, 48, 48, 0.7)', alignSelf: 'flex-start' }
                    ]}
                  >
                    {message.timestamp}
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}

        {isWaitingForResponse && <AiLoadingPlaceholder theme={theme} />}

        {streamingMessage && !isWaitingForResponse && (
          <View
             style={[
               styles.messageBubble,
               styles.aiMessage,
               theme === 'dark' ? styles.aiMessageDark : styles.aiMessageLight,
               { backgroundColor: 'transparent' }
             ]}
          >
             <View style={[
               styles.messageContent,
               styles.aiMessageContent,
               { 
                 backgroundColor: 'transparent',
                 elevation: 0,
                 shadowOpacity: 0,
                 borderRadius: 0
               }
             ]}>
               <Text style={[ 
                 styles.messageText, 
                 { fontSize: 16 * fontSizeScale },
                 theme === 'dark' ? styles.aiMessageTextDark : styles.aiMessageTextLight 
               ]}>
                 {streamingMessage.text}
                 {streamingMessage.text.length > 0 && (
                   <Animated.Text 
                     style={{ 
                       color: theme === 'dark' ? '#32b8ca' : '#32b8ca',
                       opacity: cursorAnim
                     }}
                   >
                     ▌
                   </Animated.Text>
                 )}
               </Text>
             </View>
           </View>
        )}

        {isLoading && !isWaitingForResponse && !streamingMessage && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} />
          </View>
        )}

        {isThinking && (
          <View style={styles.loadingContainer}>
            <Text style={{ color: theme === 'dark' ? '#32b8ca' : '#32b8ca', fontSize: 16 * fontSizeScale, fontWeight: 'bold', marginBottom: 8 }}>{t('thinking')}</Text>
            <ActivityIndicator size="small" color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} />
          </View>
        )}
      </ScrollView>

      {showScrollToBottomButton && (
        <TouchableOpacity
          style={[
            styles.scrollButton,
            { backgroundColor: theme === 'dark' ? '#32b8ca' : '#32b8ca' },
          ]}
          onPress={scrollToBottom}
        >
          <Icon name="chevron-down" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <View style={[ 
        styles.disclaimerFooter, 
        { 
          backgroundColor: 'transparent',
        }
      ]}>
        <Text style={[
          styles.disclaimerFooterText, 
          { 
            color: theme === 'dark' ? '#B0B0B0' : '#707070',
            fontWeight: '500'
          }
        ]}>
          {t('disclaimer')}
        </Text>
      </View>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
            borderTopColor: theme === 'dark' ? '#333333' : '#E1E4E8',
          },
        ]}
      >
        <InputBackground theme={theme} />
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme === 'dark' ? '#2D2D2D' : '#F0F2F5',
                color: theme === 'dark' ? '#FFFFFF' : '#303030',
                borderColor: theme === 'dark' ? '#444444' : '#E1E4E8',
                fontSize: 16 * fontSizeScale,
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('input_placeholder')}
            placeholderTextColor={theme === 'dark' ? '#888888' : '#9AA0A6'}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <LinearGradient
              colors={['#3AC1CF', '#32b8ca', '#2AAFBF']}
              style={styles.sendButtonGradient}
            >
              <Icon name="send-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
    width: '100%',
  },
  messageContent: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 38,
    justifyContent: 'center',
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessageContent: {
    borderTopRightRadius: 4,
    marginLeft: 'auto',
    width: '90%',
  },
  aiMessageContent: {
    borderTopLeftRadius: 0,
    width: '100%',
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
    paddingLeft: '10%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    paddingRight: 0,
    marginBottom: 16,
  },
  userMessageLight: {},
  userMessageDark: {},
  aiMessageLight: {},
  aiMessageDark: {},
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  aiMessageTextLight: {
    color: '#303030',
  },
  aiMessageTextDark: {
    color: '#E0E0E0',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    position: 'relative',
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    marginRight: 10,
    maxHeight: 120,
    minHeight: 48,
    borderWidth: 1,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#32b8ca',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  disclaimerFooter: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 0,
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  disclaimerFooterText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  timestampText: {
    fontSize: 10,
    fontWeight: '400',
    marginTop: 4,
    marginHorizontal: 4,
    opacity: 0.8,
  },
  scrollButton: {
    position: 'absolute',
    right: 20,
    bottom: 75,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  loadingBar: {
    height: 4,
    width: '50%',
    borderRadius: 2,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  loadingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 10,
  },
  loadingDot: {
    fontSize: 20,
    lineHeight: 20,
    marginHorizontal: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 24,
    marginVertical: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    backgroundColor: '#32b8ca',
  },
  backgroundContainer: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 20,
    overflow: 'hidden',
    zIndex: 0,
  },
  backgroundGradient: {
    height: 20,
    width: '100%',
  },
  welcomeContainer: {
    padding: 24,
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.25,
  },
  welcomeText: {
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: '90%',
  },
  welcomeHint: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ChatScreen;
