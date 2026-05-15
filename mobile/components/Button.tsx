import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  fullWidth = true,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  // ── variant styles ──────────────────────────────────────────────────────
  const bg: Record<ButtonVariant, string> = {
    primary: theme.accent,
    secondary: 'transparent',
    danger: '#ef4444',
    success: theme.success,
  };

  const borderColor: Record<ButtonVariant, string> = {
    primary: 'transparent',
    secondary: theme.border,
    danger: 'transparent',
    success: 'transparent',
  };

  const textColor: Record<ButtonVariant, string> = {
    primary: '#ffffff',
    secondary: theme.textSecondary,
    danger: '#ffffff',
    success: '#ffffff',
  };

  const iconColor: Record<ButtonVariant, string> = {
    primary: '#ffffff',
    secondary: theme.textMuted,
    danger: '#ffffff',
    success: '#ffffff',
  };

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={{ transform: [{ scale }], width: fullWidth ? '100%' : undefined }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={[
          styles.base,
          {
            backgroundColor: bg[variant],
            borderColor: borderColor[variant],
            borderWidth: variant === 'secondary' ? 1.5 : 0,
            opacity: isDisabled ? 0.55 : 1,
            // Shadow for primary only
            ...(variant === 'primary' && {
              shadowColor: theme.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 6,
            }),
          },
        ]}
      >
        {loading ? (
          <View style={styles.row}>
            <ActivityIndicator color={textColor[variant]} size="small" />
            <Text style={[styles.label, { color: textColor[variant], marginLeft: 8 }]}>
              Please wait…
            </Text>
          </View>
        ) : (
          <View style={styles.row}>
            {icon && (
              <Ionicons
                name={icon}
                size={19}
                color={iconColor[variant]}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={[styles.label, { color: textColor[variant] }]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
