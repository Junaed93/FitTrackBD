import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { saveToken } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { theme } = useTheme();

  useEffect(() => {
    if (token) {
      saveToken(token).then(() => {
        router.replace('/(tabs)/home');
      });
    } else {
      router.replace('/login');
    }
  }, [token]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={theme.accent} />
      <Text style={{ color: theme.textSecondary, marginTop: 16, fontSize: 16, fontWeight: '500' }}>Signing you in with Google...</Text>
    </View>
  );
}
