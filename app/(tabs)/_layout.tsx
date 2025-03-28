import { Tabs } from 'expo-router';
import { Image, StyleSheet, View, Pressable, Text, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import AddFoodModal from '../components/addFoodModal';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import LogFoodOption from '../components/logFoodOption';

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState(false);
  const openAddFoodModal = () => {
    setModalVisible(true)
  }
  const closeAddFoodModal = () => {
    setModalVisible(false)
  }
  return (
    <>
    <Tabs
        screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: {
                backgroundColor: "#FBFBFB",
                position: 'absolute',
                borderTopColor: "#FBFBFB",
                borderTopWidth: 20,
                height: 75,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                marginBottom: 7,
            },
            tabBarActiveTintColor: "#624BF5"
        }}
    >
      <Tabs.Screen
          name="index"
          options={{
              title: "home",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <Image 
                  source={require('../../assets/images/DashboardIcon.png')} 
                  style={{
                    width: 27, 
                    height: 30, 
                    tintColor: focused ? "#624BF5" : "#5F6368"
                  }} 
                />// <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
              ),
              
          }}
      />
      <Tabs.Screen
          name="diary"
          options={{
            title: "diary",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Image 
                  source={require('../../assets/images/diaryIcon.png')} 
                  style={{
                    width: 27, 
                    height: 25, 
                    tintColor: focused ? "#624BF5" : "#5F6368"
                  }} 
                />
            ),
            
        }}
      />
      <Tabs.Screen
          name="addFood"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Pressable onPress={openAddFoodModal} style={{ marginTop: -10 }}>
                <Image 
                  source={require('../../assets/images/addFoodIcon.png')} 
                  style={{
                    width: 30, 
                    height: 35, 
                    tintColor: "#624BF5"
                  }} 
                />
              </Pressable>
            ),
          }}
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault(); 
              openAddFoodModal(); 
            },
          })}
      />
      <Tabs.Screen
          name="mealPlan"
          options={{
            title: "home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Image 
                  source={require('../../assets/images/mealPlanIcon.png')} 
                  style={{
                    width: 30, 
                    height: 30, 
                    tintColor: focused ? "#624BF5" : "#5F6368"
                  }} 
              />
            ), 
        }}
      />
      <Tabs.Screen
          name="profile"
          options={{
            title: "home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Image 
                  source={require('../../assets/images/userIcon.png')} 
                  style={{
                    width: 30, 
                    height: 30, 
                    tintColor: focused ? "#624BF5" : "#5F6368"
                  }} 
              />
            ), 
        }}
      />
      
    </Tabs>
    <AddFoodModal isVisible={modalVisible} onClose={closeAddFoodModal}>
      
    </AddFoodModal>
    
    </>
    
  );
}
