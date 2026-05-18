import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@fitTrack_userStats';

export interface UserStats {
  initialWeight: number | null;
  targetWeight: number | null;
}

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const data = await AsyncStorage.getItem(STATS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load user stats', e);
  }
  return { initialWeight: null, targetWeight: null };
};

export const saveUserStats = async (stats: UserStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save user stats', e);
  }
};
