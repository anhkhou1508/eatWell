import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import MacroTrackingBoard from '../components/macroTrackingBoard'
import CalendarNavigator from '../components/calendarNavigator'
import MealInformationBar from '../components/mealInformationBar'
import { useRouter, useLocalSearchParams } from 'expo-router';

type FoodItem = {
  name: string;
  calories: number;
  branch: string;
  amount: number;
}

export default function diary() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [newFoodItemData, setNewFoodItemData] = useState<FoodItem | null>(null);
  const [targetMealType, setTargetMealType] = useState<string | null>(null);
  const processedParamsRef = useRef<string | null>(null);
  const [pendingIngredients, setPendingIngredients] = useState<FoodItem[]>([]);

  // Handle receiving new food item
  useEffect(() => {
    // Only process params if they're new and contain the required data
    const paramsKey = params.newFoodItem ? `${params.newFoodItem}-${params.mealType}` : null;
    
    if (params.newFoodItem && 
        params.mealType && 
        paramsKey !== processedParamsRef.current) {
      try {
        // Mark these params as processed
        processedParamsRef.current = paramsKey;
        
        const foodItem = JSON.parse(params.newFoodItem as string);
        setNewFoodItemData(foodItem);
        setTargetMealType(params.mealType as string);
        
        // Check if there are pending ingredients from scan meal feature
        if (params.pendingIngredients) {
          const ingredients = JSON.parse(params.pendingIngredients as string);
          setPendingIngredients(ingredients);
        }
      } catch (error) {
        console.error('Error parsing food item:', error);
      }
    }
  }, [params]);

  // Handler for when a MealInformationBar component has processed the new food item
  const handleFoodItemAdded = (mealType: string) => {
    if (targetMealType === mealType) {
      // Clear the current food item data
      setNewFoodItemData(null);
      
      // Check if there are pending ingredients to process next
      if (pendingIngredients.length > 0) {
        // Get the next ingredient
        const nextIngredient = pendingIngredients[0];
        const remainingIngredients = pendingIngredients.slice(1);
        
        // Update state to process this ingredient
        setNewFoodItemData(nextIngredient);
        setPendingIngredients(remainingIngredients);
        
        // Don't clear target meal type since we're still adding to the same meal
      } else {
        // No more pending ingredients, clear everything
        setTargetMealType(null);
        
        // Clear URL params
        router.setParams({});
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <CalendarNavigator/>
          <Pressable onPress={() => router.push('/comingSoonFeature')}>
            <Image source={require('../../assets/images/botImage.png')} style={{width: 50, height: 50, borderRadius:100}} />
          </Pressable>
        </View>
        <View style={{marginBottom: 30}}>
          <MacroTrackingBoard/>
        </View>
        <View style={{flexDirection: 'column', gap: 12}}>
          <MealInformationBar 
            mealType="Breakfast" 
            newFoodItem={targetMealType === "Breakfast" ? newFoodItemData : null}
            onFoodItemAdded={() => handleFoodItemAdded("Breakfast")}
          />
          <MealInformationBar 
            mealType="Lunch" 
            newFoodItem={targetMealType === "Lunch" ? newFoodItemData : null}
            onFoodItemAdded={() => handleFoodItemAdded("Lunch")}
          />
          <MealInformationBar 
            mealType="Dinner" 
            newFoodItem={targetMealType === "Dinner" ? newFoodItemData : null}
            onFoodItemAdded={() => handleFoodItemAdded("Dinner")}
          />
          <MealInformationBar 
            mealType="Snack" 
            newFoodItem={targetMealType === "Snack" ? newFoodItemData : null}
            onFoodItemAdded={() => handleFoodItemAdded("Snack")}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F9',
    paddingHorizontal: 24,
    paddingVertical: 50,
    marginBottom: 33,
  },
  headerContainer: {
    flexDirection: 'row',
    transform: [{scale: 1.3}],
    alignItems: 'center',
    marginVertical: 10,
    gap: 70,
    marginLeft: 20,
    marginBottom: 40,
  },
});