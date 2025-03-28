import { View, Text, StyleSheet, Image, Pressable, ScrollView } from 'react-native'
import React, { useState } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function AiSuggestedMeals() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleTabPress = (tab: 'ingredients' | 'instructions') => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mealCard}>
        <Image source={require('../../assets/images/foodImage.png')} style={styles.mealImage}/>
        <View style={styles.mealInfoContainer}>
          <Text style={styles.mealTitle}>One-pan salmon with roast asparagus</Text>
          <Pressable 
            style={styles.favoriteButton} 
            onPress={toggleFavorite}
          >
            <MaterialIcons 
              name={isFavorite ? 'favorite' : 'favorite-outline'} 
              size={24} 
              color={isFavorite ? '#FF0000' : 'black'}
            />
          </Pressable>
        </View>
      </View>
      <View style={styles.macrosContainer}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={styles.macroValue}>25<Text style={styles.macroUnit}>g</Text></Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Carbohydrates</Text>
          <Text style={styles.macroValue}>12<Text style={styles.macroUnit}>g</Text></Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Fat</Text>
          <Text style={styles.macroValue}>18<Text style={styles.macroUnit}>g</Text></Text>
        </View>
      </View>
      <View style={styles.tabContainer}>
        <View style={styles.tabItem}>
          <Pressable onPress={() => handleTabPress('ingredients')}>
            <Text style={[
              styles.tabText, 
              activeTab === 'ingredients' && styles.activeTabText
            ]}>
              INGREDIENTS
            </Text>
          </Pressable>
          <View style={[
            styles.tabIndicator, 
            activeTab === 'ingredients' && styles.activeTabIndicator
          ]} />
        </View>
        <View style={styles.tabItem}>
          <Pressable onPress={() => handleTabPress('instructions')}>
            <Text style={[
              styles.tabText, 
              activeTab === 'instructions' && styles.activeTabText
            ]}>
              HOW TO COOK?
            </Text>
          </Pressable>
          <View style={[
            styles.tabIndicator, 
            activeTab === 'instructions' && styles.activeTabIndicator
          ]} />
        </View>
      </View>
      <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'ingredients' ? (
          <View>
            <Text style={styles.detailText}>• 4 salmon fillets</Text>
            <Text style={styles.detailText}>• 1 bunch asparagus</Text>
            <Text style={styles.detailText}>• 2 tbsp olive oil</Text>
            <Text style={styles.detailText}>• 1 lemon, sliced</Text>
            <Text style={styles.detailText}>• 2 cloves garlic, minced</Text>
            <Text style={styles.detailText}>• Salt and pepper to taste</Text>
            <Text style={styles.detailText}>• Fresh dill for garnish</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.detailText}>1. Preheat oven to 400°F (200°C).</Text>
            <Text style={styles.detailText}>2. Place salmon fillets in the center of a baking sheet.</Text>
            <Text style={styles.detailText}>3. Arrange asparagus around the salmon.</Text>
            <Text style={styles.detailText}>4. Drizzle everything with olive oil.</Text>
            <Text style={styles.detailText}>5. Sprinkle with minced garlic, salt, and pepper.</Text>
            <Text style={styles.detailText}>6. Place lemon slices on top of the salmon.</Text>
            <Text style={styles.detailText}>7. Bake for 12-15 minutes until salmon is cooked through.</Text>
            <Text style={styles.detailText}>8. Garnish with fresh dill before serving.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mealCard: {
    backgroundColor: '#F2F4F9',
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
    height: 226,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  mealInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  mealTitle: {
    fontSize: 20, 
    fontWeight: 'bold', 
    color: 'black', 
    marginRight: 10,
    flex: 1,
  },
  favoriteButton: {
    marginRight: 10,
  },
  macrosContainer: {
    flexDirection: 'row',
    gap: 52,
    backgroundColor: 'white',
    borderRadius: 13,
    marginTop: 20,
    width: '100%',
    height: 75,
    paddingHorizontal: 35,
    alignItems: 'center',

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
  macroUnit: {
    color: '#C2C2C2',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingBottom: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C2C2C2',
    paddingVertical: 8,
  },
  activeTabText: {
    color: '#624BF5',
  },
  tabIndicator: {
    height: 3,
    width: '100%',
    backgroundColor: '#E5E5E5',
    marginTop: 5,
  },
  activeTabIndicator: {
    backgroundColor: '#624BF5',
  },
  detailsContainer: {
    marginTop: 15,
    maxHeight: 200,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 8,
    color: '#333',
  }
});
