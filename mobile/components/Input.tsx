import React, { useRef, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  hint?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  icon,
  error,
  hint,
  autoCapitalize = 'none',
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? theme.errorBorder : theme.border, error ? theme.error : theme.accent],
  });

  const isSecure = secureTextEntry && !showPassword;

  return (
    <View style={styles.wrapper}>
      {/* Label — always visible (Rule 8: Reduce Memory Load) */}
      {label ? (
        <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      ) : null}

      {/* Input box with animated focus border */}
      <Animated.View
        style={[
          styles.inputBox,
          {
            backgroundColor: theme.surface,
            borderColor,
            // Subtle glow on focus
            shadowColor: isFocused ? (error ? theme.error : theme.accent) : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isFocused ? 0.18 : 0,
            shadowRadius: 8,
            elevation: isFocused ? 3 : 0,
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={19}
            color={isFocused ? theme.accent : theme.textMuted}
            style={{ marginRight: 10 }}
          />
        )}

        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textPlaceholder}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label}
        />

        {/* Show/hide password toggle — Rule 5: Prevent Errors */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword((p) => !p)}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            style={{ padding: 4 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Inline error — Rule 3: Informative Feedback */}
      {error ? (
        <View style={styles.msgRow}>
          <Ionicons name="alert-circle-outline" size={13} color={theme.error} style={{ marginRight: 4 }} />
          <Text style={[styles.msgText, { color: theme.error }]}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={[styles.msgText, { color: theme.textMuted, marginTop: 4, marginLeft: 2 }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 7,
    marginLeft: 2,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 2,
  },
  msgText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
