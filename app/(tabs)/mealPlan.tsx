import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import CalendarStrip from '../components/calendarStrip'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

// Define global for TypeScript
declare global {
  var tempMealData: any;
}

// Define meal type for TypeScript
interface MealDetails {
  name: string;
  calories: string;
  macros: {
    protein: string;
    carbs: string;
    fat: string;
  };
  imageDescription: string;
  imageUrl?: string;
}

// Sample meal data for testing
const sampleMealData = {
  day: "Monday",
  meal: {
    name: "Greek Yogurt with Berries and Honey",
    calories: "350-400",
    macros: {
      protein: "25g",
      carbs: "35g",
      fat: "18g"
    },
    imageDescription: "Bowl of creamy Greek yogurt topped with fresh berries and drizzled with honey",
    imageUrl: "https://oaidalleapiprodscus.blob.core.windows.net/private/org-vtY04A3NV1Py3QjgZYM37Bsn/user-wjySu4AbTBXtpsoT9gUyTMq0/img-TfpwkGOMRLGnPPE9STdBi3Ys.png?st=2023-07-18T12%3A00%3A00Z&se=2023-07-18T14%3A00%3A00Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-07-18T13%3A00%3A00Z&ske=2023-07-19T13%3A00%3A00Z&sks=b&skv=2021-08-06&sig=abcdefg123456789"
  }
};

export default function MealPlan() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [showMealData, setShowMealData] = useState(false)
  const [mealData, setMealData] = useState(sampleMealData)
  const [isFavorite, setIsFavorite] = useState(false)
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  
  // Use this effect to detect if we're coming from the AI chat screen
  useEffect(() => {
    // Check if there's a query parameter indicating we're coming from AI chat
    if (params.fromAIChat === 'true' && params.hasMealPlanData === 'true') {
      setShowMealData(true)
      
      // In a real app, you would fetch this from a proper state manager or local storage
      // For this demo, we're using a global variable
      if (global.tempMealData) {
        setMealData(global.tempMealData)
      }
    }
    
    // Start animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, [params, fadeAnim, scaleAnim])
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }
  
  return (
    <View style={styles.container}>
      <View style={{marginBottom: 10}}>
        <CalendarStrip/>
      </View>
      <View style={{alignItems: 'center'}}>
        <Image source={require('../../assets/images/bar.png')} style={{width: 370, height: 2}}/>
      </View>
      
      {showMealData ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mealContainer}>
            {/* Show the day of the meal plan */}
            <Text style={styles.dayTitle}>{mealData.day}</Text>
            
            <View style={styles.mealCard}>
              {/* Use the generated image URL if available, otherwise use placeholder */}
              {mealData.meal.imageUrl ? (
                <Image 
                  source={{ uri: mealData.meal.imageUrl }}
                  style={styles.mealImage}
                  resizeMode="cover"
                />
              ) : (
                <Image 
                  source={require('../../assets/images/foodImage.png')} 
                  style={styles.mealImage}
                />
              )}
              <View style={styles.mealInfoContainer}>
                <View style={styles.mealTitleRow}>
                  <Text style={styles.mealTitle}>{mealData.meal.name}</Text>
                  <TouchableOpacity onPress={toggleFavorite}>
                    <Ionicons 
                      name={isFavorite ? "heart" : "heart-outline"} 
                      size={24} 
                      color={isFavorite ? "#FF4B8C" : "#666"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.macrosContainer}>
              <View style={styles.caloriesContainer}>
                <Text style={styles.caloriesLabel}>Calories</Text>
                <Text style={styles.caloriesValue}>{mealData.meal.calories}</Text>
              </View>
              <View style={styles.macrosRow}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{mealData.meal.macros.protein}</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{mealData.meal.macros.carbs}</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Fat</Text>
                  <Text style={styles.macroValue}>{mealData.meal.macros.fat}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{mealData.meal.imageDescription}</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        // Display prompt when no meal plan is available
        <View style={styles.emptyStateWrapper}>
          <Animated.View 
            style={[
              styles.emptyStateContainer, 
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.emptyStateIconContainer}>
              <Ionicons name="fast-food-outline" size={80} color="#624BF5" />
            </View>
            <Text style={styles.emptyStateTitle}>No Meal Plan Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Get personalized meal suggestions with nutrition details and appetizing AI-generated images.
            </Text>
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => router.push('/AIChatScreen')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" style={styles.chatButtonIcon} />
              <Text style={styles.chatButtonText}>Generate Meal Plan</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F9',
    paddingHorizontal: 24,
    paddingVertical: 60,
    marginBottom: 25,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // New styles for meal display
  mealContainer: {
    marginTop: 20,
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#624BF5',
    marginBottom: 15,
  },
  mealCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealImage: {
    width: '100%', 
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  mealInfoContainer: {
    padding: 15,
  },
  mealTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  macrosContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  caloriesContainer: {
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F9',
    paddingBottom: 10,
  },
  caloriesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C2C2C2',
  },
  caloriesValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#624BF5',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C2C2C2',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  descriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyStateWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F2F4F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#624BF5',
    marginBottom: 15,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  chatButton: {
    backgroundColor: '#624BF5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#624BF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  chatButtonIcon: {
    marginRight: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
