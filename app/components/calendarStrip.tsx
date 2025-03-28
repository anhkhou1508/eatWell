import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { AntDesign } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function CalendarStrip() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const router = useRouter()
  
  // Get current month, day of week, and date
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  
  const currentMonth = monthNames[currentDate.getMonth()]
  
  // Generate dates for the week (Monday to Saturday)
  const generateWeekDays = () => {
    const days = []
    const day = new Date(currentDate)
    
    // Find the previous Monday (or today if it's Monday)
    const dayOfWeek = currentDate.getDay() // 0 is Sunday, 1 is Monday
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust to get to Monday
    day.setDate(currentDate.getDate() + diff)
    
    // Generate 6 days from Monday to Saturday
    for (let i = 0; i < 6; i++) {
      days.push(new Date(day))
      day.setDate(day.getDate() + 1)
    }
    return days
  }
  
  const weekDays = generateWeekDays()
  
  const handleDayPress = (index: number) => {
    setSelectedDay(selectedDay === index ? null : index)
  }
  
  return (
    <View>
      <Text style={{fontSize: 32, fontWeight: 'bold', color: 'black', alignSelf: 'center'}}>{currentMonth}</Text>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8}}>
        {/* Monday to Wednesday */}
        {weekDays.slice(0, 3).map((day, index) => {
          const dayInitial = dayNames[index].charAt(0)
          const date = day.getDate()
          const isSelected = selectedDay === index
          
          return (
            <TouchableOpacity 
              key={index} 
              style={{
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: 4
              }}
              onPress={() => handleDayPress(index)}
            >
              {isSelected ? (
                <View style={{
                  width: 32, 
                  height: 57, 
                  borderRadius: 60, 
                  backgroundColor: '#624BF5',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{fontWeight: 'bold', color: 'white', fontSize: 16}}>{dayInitial}</Text>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 60,
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 6
                  }}>
                    <Text style={{fontSize: 16, fontWeight: 'bold', color: '#624BF5'}}>{date}</Text>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={{fontWeight: 'bold', fontSize: 16, color: '#A79E9E'}}>{dayInitial}</Text>
                  <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 6, color: '#A79E9E'}}>{date}</Text>
                </>
              )}
            </TouchableOpacity>
          )
        })}
        
        {/* Bot Button in the middle */}
        <TouchableOpacity 
          style={{
            borderRadius: 20,
            justifyContent: 'center', 
            alignItems: 'center'
          }}
          onPress={() => router.push("/AIChatScreen")}
        >
          <Image source={require('../../assets/images/botImage.png')} style={{width: 46, height: 46}}/>
        </TouchableOpacity>
        
        {/* Thursday to Saturday */}
        {weekDays.slice(3, 6).map((day, index) => {
          const actualIndex = index + 3
          const dayInitial = dayNames[actualIndex].charAt(0)
          const date = day.getDate()
          const isSelected = selectedDay === actualIndex
          
          return (
            <TouchableOpacity 
              key={actualIndex} 
              style={{
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: 4
              }}
              onPress={() => handleDayPress(actualIndex)}
            >
              {isSelected ? (
                <View style={{
                  width: 32, 
                  height: 57, 
                  borderRadius: 60, 
                  backgroundColor: '#624BF5',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{fontWeight: 'bold', color: 'white', fontSize: 16}}>{dayInitial}</Text>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 60,
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 6
                  }}>
                    <Text style={{fontSize: 16, fontWeight: 'bold', color: '#624BF5'}}>{date}</Text>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={{fontWeight: 'bold', fontSize: 16, color: '#A79E9E'}}>{dayInitial}</Text>
                  <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 6, color: '#A79E9E'}}>{date}</Text>
                </>
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
