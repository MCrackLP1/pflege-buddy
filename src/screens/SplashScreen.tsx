import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, StatusBar, Text, Animated, Easing, ActivityIndicator, Dimensions, Platform } from 'react-native';
import Video from 'react-native-video';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';

interface SplashScreenProps {
  onComplete: () => void;
}

const { width, height } = Dimensions.get('window');

/**
 * Splash Screen Komponente, die beim App-Start ein Video abspielt
 * @param {SplashScreenProps} props - Die Props der Komponente
 * @returns {JSX.Element} Die SplashScreen Komponente
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { theme } = useSettings();
  const backgroundColor = theme === 'dark' ? '#121212' : '#f5f5f5';
  const textColor = theme === 'dark' ? '#FFFFFF' : '#000000';
  
  const { t } = useTranslation();

  // Text für die Buchstaben-Animation (nur native Animationen)
  const titleText = t('app_title');
  const letterAnimations = useRef(
    titleText.split('').map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(-80),
      scale: new Animated.Value(0.5),
      rotate: new Animated.Value(0)
    }))
  ).current;
  
  // Native Animationen für Container
  const backgroundScale = useRef(new Animated.Value(0.95)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnimNative = useRef(new Animated.Value(1)).current;
  
  // Animation für den Ladetext (nur native Animationen)
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState('');
  
  // Timer für Punktanimation
  const [dotCount, setDotCount] = useState(0);
  
  // Animation für Partikel (nur native Animationen)
  const particles = useRef(Array(8).fill(0).map(() => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    scale: new Animated.Value(0),
    opacity: new Animated.Value(0),
    rotate: new Animated.Value(0)
  }))).current;

  // Animationen starten
  useEffect(() => {
    // Hintergrund-Animation
    Animated.sequence([
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad)
      }),
      Animated.timing(backgroundScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.8))
      })
    ]).start();
    
    // Buchstaben-Animation
    const animateLetters = letterAnimations.map((anim, i) => {
      const isSpace = titleText[i] === ' ';
      const delay = 600 + (i * 100);
      
      return Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 400,
          delay: delay,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 700,
          delay: delay,
          useNativeDriver: true,
          easing: Easing.out(Easing.elastic(1.2))
        }),
        Animated.timing(anim.scale, {
          toValue: 1,
          duration: 700,
          delay: delay,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(2))
        }),
        Animated.timing(anim.rotate, {
          toValue: isSpace ? 0 : Math.random() * 2 - 1, // Leichte Drehung für jeden Buchstaben
          duration: 700,
          delay: delay,
          useNativeDriver: true,
          easing: Easing.out(Easing.elastic(1.5))
        })
      ]);
    });
    
    // Alle Buchstaben-Animationen starten
    Animated.stagger(50, animateLetters).start();
    
    // Pulsierender Effekt für den Titel (nur native Animation)
    const animatePulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimNative, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin)
        }),
        Animated.timing(pulseAnimNative, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin)
        })
      ]).start(() => {
        animatePulse();
      });
    };
    
    // Lade-Text Animation
    Animated.timing(loadingOpacity, {
      toValue: 1,
      duration: 800,
      delay: 1000 + (titleText.length * 100) + 500,
      useNativeDriver: true,
    }).start();
    
    // Partikel-Animation
    particles.forEach((particle, index) => {
      // Zufällige Position und Bewegung für jedes Partikel
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 120;
      const duration = 1500 + Math.random() * 2000;
      const delay = 1000 + Math.random() * 1000 + index * 100;
      
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: Math.cos(angle) * distance,
            duration,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad)
          }),
          Animated.timing(particle.y, {
            toValue: Math.sin(angle) * distance,
            duration,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad)
          }),
          Animated.timing(particle.scale, {
            toValue: 0.5 + Math.random() * 1.0,
            duration: duration * 0.6,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1))
          }),
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 0.8,
              duration: duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: duration * 0.8,
              useNativeDriver: true,
            })
          ]),
          Animated.timing(particle.rotate, {
            toValue: Math.random() * 4 - 2,
            duration,
            useNativeDriver: true,
            easing: Easing.linear
          })
        ])
      ]).start();
    });
    
    // Starte Pulse-Animation
    animatePulse();
    
    // Timer für Punktanimation (ohne Animated API - nur setState)
    const dotsInterval = setInterval(() => {
      setDotCount((prev) => (prev >= 3 ? 0 : prev + 1));
    }, 500);
    
    // Fallback-Timer
    const timer = setTimeout(() => {
      // Fallback Timeout
      onComplete();
    }, 8000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(dotsInterval);
    };
  }, [letterAnimations, loadingOpacity, titleText.length, backgroundOpacity, backgroundScale, pulseAnimNative, particles, onComplete]);

  // Aktualisiere Punkte basierend auf dotCount
  useEffect(() => {
    setDots('.'.repeat(dotCount));
  }, [dotCount]);

  const handleVideoError = (error: any) => {
    console.error('Video error:', error);
    // Log more details about the error
    console.error('Video error details:', JSON.stringify(error));
    // Nach einem kurzen Timeout die App starten
    setTimeout(onComplete, 500);
  };

  // Add this function to handle video loading
  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
  };

  // Rendere jeden Buchstaben als eigenes animiertes Element
  const renderAnimatedTitle = () => {
    return titleText.split('').map((letter, index) => {
      const rotateStr = letterAnimations[index].rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '1deg']
      });
      
      return (
        <Animated.Text
          key={`letter-${index}`}
          style={[
            styles.titleLetter,
            {
              opacity: letterAnimations[index].opacity,
              transform: [
                { translateY: letterAnimations[index].translateY },
                { scale: letterAnimations[index].scale },
                { rotate: rotateStr }
              ],
              // Hinzufügen von Abstand zwischen den Wörtern
              marginRight: letter === ' ' ? 10 : 0,
              textShadowColor: theme === 'dark' ? 'rgba(3, 218, 198, 0.9)' : 'rgba(50, 184, 202, 0.9)'
            }
          ]}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </Animated.Text>
      );
    });
  };
  
  // Rendere die Partikel
  const renderParticles = () => {
    return particles.map((particle, index) => {
      const rotateStr = particle.rotate.interpolate({
        inputRange: [-2, 0, 2],
        outputRange: ['-2rad', '0rad', '2rad']
      });
      
      return (
        <Animated.View
          key={`particle-${index}`}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
                { rotate: rotateStr }
              ],
              opacity: particle.opacity,
              backgroundColor: theme === 'dark' ? '#03dac6' : '#32b8ca' // Turquoise particles
            }
          ]}
        />
      );
    });
  };

  // Definiere statische Farben statt Animationen
  const backgroundColor1 = theme === 'dark' ? 'rgba(3, 218, 198, 0.75)' : 'rgba(50, 184, 202, 0.75)'; // Turquoise background
  const borderColor1 = theme === 'dark' ? 'rgba(3, 218, 198, 0.7)' : 'rgba(50, 184, 202, 0.7)'; // Turquoise color from the app

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar translucent backgroundColor="transparent" />
      
      {/* Using require again, which worked originally */}
      <Video
        source={require('../../assets/videos/splash.mp4')}
        style={styles.fullscreenVideo}
        resizeMode="cover"
        onEnd={onComplete}
        onError={handleVideoError}
        onLoad={handleVideoLoad}
        repeat={false}
        muted={true}
        volume={0}
        onPlaybackStateChanged={(state) => console.log('Playback state changed:', state)}
      />
      
      {/* Overlay mit Titel und Ladeanimation */}
      <View style={styles.overlay}>
        <View style={styles.titleWrapper}>
          <Animated.View 
            style={[
              styles.titleBackground,
              {
                opacity: backgroundOpacity,
                transform: [{ scale: backgroundScale }, { scale: pulseAnimNative }],
                backgroundColor: backgroundColor1,
                borderColor: borderColor1,
                borderWidth: 3,
                shadowColor: theme === 'dark' ? '#03dac6' : '#32b8ca', // Turquoise shadow color
              }
            ]}
          >
            <View style={styles.titleContainer}>
              {renderAnimatedTitle()}
            </View>
            {renderParticles()}
          </Animated.View>
        </View>
        
        <Animated.View style={[styles.loadingContainer, { opacity: loadingOpacity }]}>
          <View style={styles.loadingTextContainer}>
            <Text style={styles.loadingText}>{t('welcome')} wird geladen{dots}</Text>
          </View>
          <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    position: 'absolute',
    top: '70%', // Nach unten verschoben auf 70% statt 60%
    width: '100%',
    alignItems: 'center',
  },
  titleBackground: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 15,
    borderWidth: 2,
    elevation: 20, // Android-Schatten
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    overflow: 'visible',
  },
  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleLetter: {
    fontSize: 38, // Größere Schrift
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 3,
  },
  spinner: {
    marginTop: 10,
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: -1,
  }
});

export default SplashScreen; 