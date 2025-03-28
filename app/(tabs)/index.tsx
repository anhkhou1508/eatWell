import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import CalendarNavigator from '../components/calendarNavigator';
import Details from '../components/details';
import NutritionTrackingBoard from '../components/nutritionTrackingBoard';
import MealTag from '../components/mealTag';
import BodyMeasurementBoard from '../components/bodyMeasurementBoard';

export default function index () {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{flexDirection: 'row', gap: 48, marginBottom: 60}}>
          <Text style={styles.greetingText}>Hello Khoi</Text>
          <CalendarNavigator/>
        </View>
        <View style={{flexDirection: 'row', gap: 170, marginBottom: 15}}>
          <Text style={styles.text}>Keto Diet</Text>
          <Details tabName="diary"/>
        </View>
        <View style={{marginBottom: 37}}>
          <NutritionTrackingBoard/>
        </View>
        <View style={{flexDirection: 'row', gap: 122, marginBottom: 15}}>
          <Text style={styles.text}>Today's Meals</Text>
          <Details tabName="diary"/>
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{marginBottom: 37}}>
          <View style={{flexDirection: 'row', gap: 18}}>
            <MealTag color="#FA8484" mealType="Breakfast" mealName={["Pancakes, syrup"]} kcal="743"/>
            <MealTag color="#6B7DE3" mealType="Lunch" mealName={["Noodles, chicken, tomatoes"]} kcal="621"/>
            <MealTag color="#7BC99B" mealType="Dinner" mealName={["Salad, chicken, tomatoes"]} kcal="345"/>
            <MealTag color="#F578A0" mealType="Snack" mealName={["Boca"]} kcal="100"/>
          </View>
        </ScrollView>
        <View style={{flexDirection: 'row', gap: 65, marginBottom: 15}}>
          <Text style={styles.text}>Body Measurements</Text>
          <Details tabName="comingSoonFeature"/>
        </View>
        <View>
          <BodyMeasurementBoard/>
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
  greetingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
  },
  text: {
    fontSize: 21,
    fontWeight: 'bold',
    color: 'black',
  },
});
