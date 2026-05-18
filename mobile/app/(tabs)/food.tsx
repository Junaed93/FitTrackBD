import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, FlatList, TouchableOpacity, Alert, useWindowDimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import GlassBackground from '../../components/GlassBackground';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import foodsData from '../../assets/data/foods.json';
import { getProfile } from '../../services/api';
import { getDailyCalories, getTodayString, logFoodItem, getDailyFoodLogs, FoodLog } from '../../services/foodStorage';

interface FoodItem {
  id: number;
  food_name_en: string;
  food_name_bn: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

export default function FoodScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobileLayout = width < 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [consumedCalories, setConsumedCalories] = useState(0);
  const [todayLogs, setTodayLogs] = useState<FoodLog[]>([]);

  // Modals Visibility
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantityInput, setQuantityInput] = useState('100');

  const fetchData = async () => {
    try {
      const profileRes = await getProfile();
      setProfile(profileRes.data);
    } catch (e) {
      console.log('Failed to fetch profile', e);
    }
  };

  const loadLogs = async () => {
    const today = getTodayString();
    const cals = await getDailyCalories(today);
    const logs = await getDailyFoodLogs(today);
    setConsumedCalories(cals);
    setTodayLogs(logs);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      loadLogs();
    }, [])
  );

  const openAddModal = (food: FoodItem) => {
    setSelectedFood(food);
    if (food.serving_size.includes('100g')) {
      setQuantityInput('100');
    } else {
      setQuantityInput('1');
    }
  };

  const confirmLogFood = async () => {
    if (!selectedFood) return;
    
    const qty = parseFloat(quantityInput);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity.');
      return;
    }

    let calculatedCalories = 0;
    let unitLabel = '';

    if (selectedFood.serving_size.includes('100g')) {
      calculatedCalories = (qty / 100) * selectedFood.calories;
      unitLabel = 'g';
    } else {
      calculatedCalories = qty * selectedFood.calories;
      const match = selectedFood.serving_size.match(/[a-zA-Z]+/);
      unitLabel = match ? match[0] : 'serving';
      if (qty > 1) unitLabel += 's';
    }

    try {
      await logFoodItem(getTodayString(), {
        foodName: selectedFood.food_name_en,
        quantity: qty,
        unit: unitLabel,
        calories: Math.round(calculatedCalories)
      });
      loadLogs();
      setSelectedFood(null);
      setSearchModalVisible(false); // Close search flow on success
      setSearchQuery('');
    } catch (e) {
      Alert.alert('Error', 'Failed to log food');
    }
  };

  const filteredFoods = (foodsData as FoodItem[]).filter(food => 
    food.food_name_en.toLowerCase().includes(searchQuery.toLowerCase()) || 
    food.food_name_bn.includes(searchQuery)
  );

  const totalAllowed = profile?.daily_calorie_target || 2000;
  const remaining = totalAllowed - consumedCalories;

  // Calculate dynamic macros in detail modal
  const getCalculatedNutrition = () => {
    if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const q = parseFloat(quantityInput) || 0;
    const isGrams = selectedFood.serving_size.includes('100g');
    const factor = isGrams ? q / 100 : q;

    return {
      calories: Math.round(selectedFood.calories * factor),
      protein: parseFloat((selectedFood.protein_g * factor).toFixed(1)),
      carbs: parseFloat((selectedFood.carbs_g * factor).toFixed(1)),
      fat: parseFloat((selectedFood.fat_g * factor).toFixed(1)),
    };
  };

  const calculated = getCalculatedNutrition();
  const caloriesRemainingAfterLog = remaining - calculated.calories;

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <View style={[styles.foodCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={[styles.foodName, { color: theme.text }]}>
          {item.food_name_en} <Text style={{ fontSize: 13, fontWeight: '400', color: theme.textSecondary }}>({item.food_name_bn})</Text>
        </Text>
        <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>
          {item.calories} kcal per {item.serving_size}
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.addBtn, { backgroundColor: theme.accentSurface }]} 
        onPress={() => openAddModal(item)}
      >
        <Ionicons name="add" size={20} color={theme.accentLight} />
      </TouchableOpacity>
    </View>
  );

  return (
    <GlassBackground>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Food Log</Text>
        
        {/* Calorie Summary Banner */}
        <View style={[styles.summaryBanner, { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Calories Remaining</Text>
              <Text style={[styles.summaryValue, { color: remaining >= 0 ? theme.success : theme.error }]}>
                {remaining} <Text style={{ fontSize: 16, fontWeight: '600' }}>kcal</Text>
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
               <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Eaten Today</Text>
               <Text style={[styles.summaryValueSm, { color: theme.accentLight }]}>{consumedCalories} / {totalAllowed}</Text>
            </View>
          </View>
        </View>

        {/* Shneiderman's Golden Rule Widget: Log Food CTA */}
        <TouchableOpacity 
          style={[styles.widgetCard, { backgroundColor: theme.accentSurface, borderColor: theme.accentBorder }]}
          onPress={() => setSearchModalVisible(true)}
        >
          <View style={[styles.widgetIconContainer, { backgroundColor: theme.accent }]}>
            <Ionicons name="restaurant" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.widgetTitle, { color: theme.text }]}>Log a Meal</Text>
            <Text style={[styles.widgetSubtitle, { color: theme.textSecondary }]}>Search through our local dataset & log calories</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Today's Logs */}
        <View style={{ flex: 1, marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Today's Logs</Text>
          {todayLogs.length > 0 ? (
            <FlatList
              data={todayLogs}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <View style={[styles.logRow, { borderBottomColor: theme.border, borderBottomWidth: index === todayLogs.length - 1 ? 0 : 1 }]}>
                  <View>
                    <Text style={[styles.logName, { color: theme.text }]}>{item.foodName}</Text>
                    <Text style={[styles.logQty, { color: theme.textMuted }]}>{item.quantity} {item.unit} • {item.time}</Text>
                  </View>
                  <Text style={[styles.logCals, { color: theme.accentLight }]}>{item.calories} kcal</Text>
                </View>
              )}
              contentContainerStyle={[styles.logContainer, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }]}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="cafe-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.placeholderText, { color: theme.textMuted }]}>No meals logged today yet.</Text>
            </View>
          )}
        </View>
      </View>

      {/* SEARCH FOOD MODAL */}
      <Modal visible={searchModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.fullModalContent, { backgroundColor: theme.bg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Search Food</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => { setSearchModalVisible(false); setSearchQuery(''); }}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Input 
                label=""
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Type rice, egg, fish, sweet..."
                icon="search-outline"
                autoFocus
              />
            </View>

            <FlatList
              data={filteredFoods}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderFoodItem}
              initialNumToRender={20}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 24 }}>No matches found</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* DETAIL & ADD MODAL */}
      <Modal visible={!!selectedFood} transparent animationType="fade">
        <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { backgroundColor: theme.bg, borderColor: theme.border }]}>
              {selectedFood && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.text, fontSize: 20 }]}>{selectedFood.food_name_en}</Text>
                    <TouchableOpacity onPress={() => setSelectedFood(null)}>
                      <Ionicons name="close" size={24} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: -4, marginBottom: 16 }}>({selectedFood.food_name_bn})</Text>
                  
                  {/* Detailed Nutrition Summary */}
                  <View style={[styles.nutritionGrid, { borderColor: theme.border }]}>
                    <View style={styles.nutritionBox}>
                      <Text style={[styles.nutritionVal, { color: theme.accent }]}>{calculated.calories}</Text>
                      <Text style={[styles.nutritionLbl, { color: theme.textMuted }]}>Calories</Text>
                    </View>
                    <View style={styles.nutritionBox}>
                      <Text style={[styles.nutritionVal, { color: theme.text }]}>{calculated.protein}g</Text>
                      <Text style={[styles.nutritionLbl, { color: theme.textMuted }]}>Protein</Text>
                    </View>
                    <View style={styles.nutritionBox}>
                      <Text style={[styles.nutritionVal, { color: theme.text }]}>{calculated.carbs}g</Text>
                      <Text style={[styles.nutritionLbl, { color: theme.textMuted }]}>Carbs</Text>
                    </View>
                    <View style={styles.nutritionBox}>
                      <Text style={[styles.nutritionVal, { color: theme.text }]}>{calculated.fat}g</Text>
                      <Text style={[styles.nutritionLbl, { color: theme.textMuted }]}>Fat</Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                     <Input
                        label={selectedFood.serving_size.includes('100g') ? "Enter Grams" : `Quantity (${selectedFood.serving_size})`}
                        value={quantityInput}
                        onChangeText={setQuantityInput}
                        keyboardType="numeric"
                        icon="calculator-outline"
                     />
                  </View>
                  
                  {/* Future remaining calories display */}
                  <View style={[styles.remainingPreviewBox, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: theme.border }]}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Remaining Calories After Logging</Text>
                    <Text style={{ fontSize: 24, fontWeight: '800', marginTop: 4, color: caloriesRemainingAfterLog >= 0 ? theme.success : theme.error }}>
                      {caloriesRemainingAfterLog} kcal
                    </Text>
                  </View>
                  
                  <View style={{ marginTop: 8 }}>
                    <Button title="Confirm & Log" onPress={confirmLogFood} />
                  </View>
                </>
              )}
           </View>
        </View>
      </Modal>

    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 64 : 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  summaryBanner: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  summaryValueSm: {
    fontSize: 20,
    fontWeight: '700',
  },
  widgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  widgetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  widgetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logContainer: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  logName: {
    fontSize: 16,
    fontWeight: '600',
  },
  logQty: {
    fontSize: 12,
    marginTop: 4,
  },
  logCals: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  fullModalContent: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    marginTop: Platform.OS === 'ios' ? 44 : 20,
    marginBottom: 20,
  },
  modalContent: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  nutritionBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  nutritionVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  nutritionLbl: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  remainingPreviewBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  }
});
