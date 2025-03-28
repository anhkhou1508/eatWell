import { View, Text, Pressable, Animated, Image, Modal, TextInput, TouchableOpacity } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Progress from 'react-native-progress';
import MacroProcessPie from './macroProcessPie';

type FoodItem = {
  name: string;
  calories: number;
  branch: string;
  amount: number;
}

type Props = {
  mealType: string;
  newFoodItem?: FoodItem | null;
  onFoodItemAdded?: () => void;
}

const testCal: FoodItem[] = [
  {
    name: "Egg Noodles",
    calories: 130,
    branch: "Tesco",
    amount: 150
  },

  {
    name: "Chicken",
    calories: 340,
    branch: "Tesco",
    amount: 250
  },
]

export default function MealInformationBar({mealType, newFoodItem, onFoodItemAdded}: Props) {
  
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(70)).current;
  const [contentHeight, setContentHeight] = useState(70);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [editedItem, setEditedItem] = useState<FoodItem>({
    name: '',
    calories: 0,
    branch: '',
    amount: 0
  });
  const [foodItems, setFoodItems] = useState<FoodItem[]>(testCal);
  const processedNewFoodItemRef = useRef<string | null>(null);
  
  // Add new food item when received from props
  useEffect(() => {
    // Only process if newFoodItem exists and is not the same as the last processed item
    if (newFoodItem && JSON.stringify(newFoodItem) !== processedNewFoodItemRef.current) {
      // Store the current food item to prevent duplicate processing
      processedNewFoodItemRef.current = JSON.stringify(newFoodItem);
      
      // Add the food item to the list
      setFoodItems(prevItems => [...prevItems, newFoodItem]);
      
      // Expand the bar to show the new item
      setIsExpanded(true);
      
      // Get the latest content height
      const updatedHeight = calculateHeight(foodItems.length + 1);
      animatedHeight.setValue(updatedHeight);
      
      // Call the callback to notify parent that we've added the item
      if (onFoodItemAdded) {
        onFoodItemAdded();
      }
    }
  }, [newFoodItem, onFoodItemAdded]);
  
  // Calculate the height based on number of items
  const calculateHeight = (itemCount = foodItems.length) => {
    // Base height for header (70) + spacing + 54 per item + space for add button
    const itemHeight = 54; // Approximate height per item
    const baseHeight = 70; // Header height
    const addButtonSpace = 50; // Space for add button
    return baseHeight + (itemCount * itemHeight) + addButtonSpace;
  };
  
  useEffect(() => {
    setContentHeight(calculateHeight());
    
    // Update animated height when food items change and view is expanded
    if (isExpanded) {
      Animated.timing(animatedHeight, {
        toValue: calculateHeight(),
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [foodItems.length, isExpanded]);
  
  const toggleView = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 70 : contentHeight,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  const router = useRouter();

  const openEditModal = (item: FoodItem) => {
    setSelectedItem(item);
    setEditedItem({...item});
    setModalVisible(true);
  };

  const saveChanges = () => {
    if (selectedItem) {
      const updatedItems = foodItems.map(item => 
        item.name === selectedItem.name ? editedItem : item
      );
      setFoodItems(updatedItems);
      setModalVisible(false);
    }
  };

  const deleteItem = () => {
    if (selectedItem) {
      const updatedItems = foodItems.filter(item => item.name !== selectedItem.name);
      setFoodItems(updatedItems);
      setModalVisible(false);
    }
  };

  const TestComponent = ({name, calories, branch, ammount}: {name: string, calories: number, branch: string, ammount: number}) => {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
        <Text>{name}</Text>
        <Text>{calories}</Text>
        <Text>{branch}</Text>
        <Text>{ammount}</Text>
      </View>
    )
  }

  return (
    <View style={{flexDirection:"column", gap: 20}}>
      
      <Animated.View 
        style={{
          height: animatedHeight,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 15,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        
        <Pressable onPress={toggleView} style={{flexDirection: 'row', alignItems: 'center', marginTop: 7}}>
          <Text style={{fontSize: 23, fontWeight: 'bold', color: "#624BF5", marginRight: 15}}>
              {mealType}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 2}}>
              <Text style={{fontSize: 21, fontWeight: 'bold', color: "black"}}>{foodItems.reduce((sum, item) => sum + item.calories, 0)}</Text>
              <Text style={{fontSize: 12, fontWeight: 'bold', color: '#A3A1A1', marginTop: 4}}>kcal</Text>
          </View>
          <View style={{marginLeft: 'auto'}}>
              <Entypo name={isExpanded ? "chevron-down" : "chevron-right"} size={24} color="black" /> 
          </View>
        </Pressable>
        <View style={{alignItems: 'center', marginTop: 23}}>
          <Image source={require('../../assets/images/bar.png')} style={{width: 330, height: 3, borderRadius:100}} />
        </View>


        {foodItems.map((item) => (
          <Pressable 
            key={item.name} 
            style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 15}}
            onPress={() => openEditModal(item)}
          >
            <View style={{flexDirection: 'column'}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: 'black'}}>{item.name}</Text>
              <View style={{flexDirection: 'row', gap: 5}}>
                <Text style={{color: '#A3A1A1',fontSize: 12, marginRight: -3, fontWeight: 'bold'}}>{item.branch},</Text>
                <Text style={{color: '#A3A1A1',fontSize: 12, fontWeight: 'bold'}}>{item.amount}g</Text>
              </View>
            </View>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 3, marginRight: 12}}>{item.calories}</Text>
          </Pressable>
        ))}


        
        {isExpanded && (
          <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: -10}}>
            <Pressable onPress={() => router.push('/logFood')}>
              <Image source={require('../../assets/images/addFoodIcon.png')} style={{width: 35, height: 35}} />
            </Pressable>
          </View>
        )}
      </Animated.View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <View style={{width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 5}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: '#624BF5'}}>Edit Food Item</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={24} color="black" />
              </Pressable>
            </View>
            
            <Text style={{marginBottom: 5, fontWeight: 'bold'}}>Name:</Text>
            <TextInput
              style={{borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10}}
              value={editedItem.name}
              onChangeText={(text) => setEditedItem({...editedItem, name: text})}
            />
            
            <Text style={{marginBottom: 5, fontWeight: 'bold'}}>Calories:</Text>
            <TextInput
              style={{borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10}}
              value={editedItem.calories.toString()}
              onChangeText={(text) => setEditedItem({...editedItem, calories: parseInt(text) || 0})}
              keyboardType="numeric"
            />
            
            <Text style={{marginBottom: 5, fontWeight: 'bold'}}>Brand:</Text>
            <TextInput
              style={{borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10}}
              value={editedItem.branch}
              onChangeText={(text) => setEditedItem({...editedItem, branch: text})}
            />
            
            <Text style={{marginBottom: 5, fontWeight: 'bold'}}>Amount (g):</Text>
            <TextInput
              style={{borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 20}}
              value={editedItem.amount.toString()}
              onChangeText={(text) => setEditedItem({...editedItem, amount: parseInt(text) || 0})}
              keyboardType="numeric"
            />
            
            {/* Macro Process Pie Section */}
            <View style={{
              marginBottom: 15, 
              marginTop: 0, 
              backgroundColor: '#F8F8F8', 
              borderRadius: 15, 
              padding: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}>
              <Text style={{
                fontSize: 16, 
                fontWeight: 'bold', 
                marginBottom: 10, 
                textAlign: 'center',
                color: '#624BF5'
              }}>
                Nutritional Breakdown
              </Text>
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 5,
                transform: [{ scale: 0.9 }]
              }}>
                <MacroProcessPie 
                  protein={15} 
                  carbs={25} 
                  fat={10} 
                  calories={editedItem.calories} 
                />
              </View>
            </View>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity 
                style={{backgroundColor: '#FF3B30', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5}}
                onPress={deleteItem}
              >
                <Text style={{color: 'white', fontWeight: 'bold'}}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{backgroundColor: '#624BF5', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5}}
                onPress={saveChanges}
              >
                <Text style={{color: 'white', fontWeight: 'bold'}}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}