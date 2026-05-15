import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassBackground from '../../components/GlassBackground';
import { useTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <GlassBackground>
      <View style={styles.container}>
        <View style={[styles.glassCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Home</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Welcome to FitTrackBD</Text>
        </View>
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
  },
  glassCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Overridden by theme usually but base for web fallback
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});
