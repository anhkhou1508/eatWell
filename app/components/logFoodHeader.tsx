import { View, Text, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function LogFoodHeader() {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="#000" />
      </Pressable>
      
      <View style={styles.centerContainer}>
        <Text style={styles.headerText}>Log Food</Text>
      </View>
      
      <View style={styles.placeholder} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    width: '100%'
  },
  backButton: {
    padding: 5,
    marginLeft: -20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#624BF5'
  },
  placeholder: {
    width: 24
  }
})
