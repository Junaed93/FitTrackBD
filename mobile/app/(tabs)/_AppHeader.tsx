import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { removeToken } from '../../services/api';

type AppHeaderProps = {
  showLogout?: boolean;
};

export default function AppHeader({ showLogout = true }: AppHeaderProps) {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await removeToken();
    router.replace('/login');
  };

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={[styles.brandIcon, { backgroundColor: theme.accentSurface }]}>
          <Image
            source={require('../../assets/images/trimly logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.brandText, { color: theme.text }]}>Trimly</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          accessibilityLabel="Toggle theme"
        >
          <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        {showLogout ? (
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.25)' }]}
            accessibilityLabel="Logout"
          >
            <Ionicons name="log-out-outline" size={20} color={theme.error} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandLogo: {
    width: 34,
    height: 34,
    transform: [{ scale: 1.1 }],
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});