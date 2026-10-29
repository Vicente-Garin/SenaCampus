import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONTS, SHADOWS } from '../constants/theme';

export default function SignViewer({ sequence = [], isTranslating = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLetter, setCurrentLetter] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1); // 1x o 1.5x

  const timeoutRef = useRef(null);

  const currentGloss = sequence[currentIndex] || null;

  useEffect(() => {
    if (!sequence || sequence.length === 0 || !isPlaying) return;

    // Duración base según el tipo de recurso
    const baseDuration = currentGloss?.tipo === 'dactilologia' ? 800 : 1500;
    const duration = baseDuration / speed;

    if (currentGloss?.tipo === 'dactilologia' && currentGloss.deletreo?.length > 0) {
      let charIdx = 0;
      setCurrentLetter(currentGloss.deletreo[0]);

      const letterInterval = setInterval(() => {
        charIdx++;
        if (charIdx < currentGloss.deletreo.length) {
          setCurrentLetter(currentGloss.deletreo[charIdx]);
        } else {
          clearInterval(letterInterval);
          // Pasar a la siguiente glosa al terminar el deletreo
          timeoutRef.current = setTimeout(() => {
            advanceSequence();
          }, 400 / speed);
        }
      }, 600 / speed);

      return () => {
        clearInterval(letterInterval);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    } else {
      // Glosa con animación directa
      timeoutRef.current = setTimeout(() => {
        advanceSequence();
      }, duration);

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [currentIndex, sequence, isPlaying, speed]);

  const advanceSequence = () => {
    if (currentIndex < sequence.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false); // Fin de la oración
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const toggleSpeed = () => {
    setSpeed((prev) => (prev === 1 ? 1.5 : 1));
  };

  if (isTranslating) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.coral} />
        <Text style={styles.stateText}>Escuchando y traduciendo...</Text>
      </View>
    );
  }

  if (!sequence || sequence.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderIcon}>🤟</Text>
          <Text style={styles.placeholderText}>
            Presiona el micrófono para traducir una cátedra a LSCh
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Marco visual de la Seña */}
      <View style={styles.displayFrame}>
        {currentGloss?.tipo === 'dactilologia' ? (
          <View style={styles.dactilologyCard}>
            <Text style={styles.badgeText}>Dactilología (Deletreo manual)</Text>
            <View style={styles.letterCircle}>
              <Text style={styles.letterText}>{currentLetter}</Text>
            </View>
            <Text style={styles.wordSubtext}>{currentGloss.termino}</Text>
          </View>
        ) : (
          <View style={styles.lottieCard}>
            <View style={styles.lottieBadge}>
              <Text style={styles.lottieBadgeText}>Seña Directa</Text>
            </View>
            {/* Aquí se monta <LottieView source={currentGloss.asset} /> */}
            <Text style={styles.signName}>{currentGloss?.termino?.toUpperCase()}</Text>
            <Text style={styles.categoryText}>Categoría: {currentGloss?.categoria}</Text>
          </View>
        )}
      </View>

      {/* Barra de progreso de la oración */}
      <View style={styles.progressRow}>
        <Text style={styles.counterText}>
          Glosa {currentIndex + 1} de {sequence.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / sequence.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Controles de reproducción */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlButton} onPress={handleRestart}>
          <Text style={styles.controlButtonText}>🔄 Repetir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.speedButton]}
          onPress={toggleSpeed}
        >
          <Text style={styles.speedButtonText}>{speed}x</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isPlaying ? styles.pauseButton : styles.playButton]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Text style={styles.controlButtonText}>{isPlaying ? '⏸ Pausar' : '▶ Reanudar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.superficie,
    borderRadius: 20,
    padding: SPACING.md,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.borde
  },
  displayFrame: {
    height: 250,
    backgroundColor: COLORS.crema,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borde
  },
  dactilologyCard: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.textoSecundario,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  letterCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.coral,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card
  },
  letterText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.blanco
  },
  wordSubtext: {
    marginTop: SPACING.sm,
    fontSize: 16,
    color: COLORS.textoPrincipal,
    fontWeight: '600'
  },
  lottieCard: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  lottieBadge: {
    backgroundColor: COLORS.mentaLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: SPACING.sm
  },
  lottieBadgeText: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '700'
  },
  signName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.coral,
    marginBottom: 4
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.textoSecundario
  },
  progressRow: {
    marginVertical: SPACING.sm
  },
  counterText: {
    fontSize: 12,
    color: COLORS.textoSecundario,
    marginBottom: 4,
    textAlign: 'right'
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.borde,
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.coral,
    borderRadius: 3
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs
  },
  controlButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.crema,
    borderWidth: 1,
    borderColor: COLORS.borde
  },
  controlButtonText: {
    color: COLORS.textoPrincipal,
    fontSize: 13,
    fontWeight: '600'
  },
  speedButton: {
    backgroundColor: COLORS.coralLight,
    borderColor: COLORS.coral
  },
  speedButtonText: {
    color: COLORS.coral,
    fontWeight: 'bold',
    fontSize: 13
  },
  pauseButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  playButton: {
    backgroundColor: COLORS.mentaLight,
    borderColor: COLORS.menta
  },
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm
  },
  placeholderText: {
    textAlign: 'center',
    color: COLORS.textoSecundario,
    fontSize: 14,
    lineHeight: 20
  },
  stateText: {
    marginTop: SPACING.sm,
    color: COLORS.textoSecundario,
    fontSize: 14
  }
});