import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter, useNavigation } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function ComingSoonFeature() {
  const router = useRouter();
  const navigation = useNavigation();
  
  // Hide the tab bar when this screen is focused
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: 'none' },
      headerShown: false,
    });
    
    // Restore tab bar when unmounting
    return () => {
      navigation.setOptions({
        tabBarStyle: undefined,
        headerShown: undefined,
      });
    };
  }, [navigation]);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color="#000" 
          onPress={() => router.back()} 
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Coming Soon</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Exciting Features on the Way!</Text>
        
        <View style={styles.featureCard}>
          <MaterialCommunityIcons name="scale-bathroom" size={60} color="#624BF5" />
          <Text style={styles.featureTitle}>Body Measurements</Text>
          <Text style={styles.featureDescription}>
            Track your weight, BMI, body fat percentage and more to monitor your fitness journey.
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#624BF5" />
              <Text style={styles.featureText}>Weight tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#624BF5" />
              <Text style={styles.featureText}>Body measurements</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#624BF5" />
              <Text style={styles.featureText}>Progress visualization</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.featureCard}>
          <FontAwesome5 name="running" size={50} color="#624BF5" />
          <Text style={styles.featureTitle}>Advanced Workout Plans</Text>
          <Text style={styles.featureDescription}>
            Personalized workout routines based on your fitness goals and progress.
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#624BF5" />
              <Text style={styles.featureText}>AI-powered recommendations</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#624BF5" />
              <Text style={styles.featureText}>Video demonstrations</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#624BF5" />
              <Text style={styles.featureText}>Progress tracking</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.featureCard}>
          <Ionicons name="people" size={50} color="#624BF5" />
          <Text style={styles.featureTitle}>Community Challenges</Text>
          <Text style={styles.featureDescription}>
            Join fitness challenges with friends and the community to stay motivated.
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#624BF5" />
              <Text style={styles.featureText}>Group challenges</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#624BF5" />
              <Text style={styles.featureText}>Leaderboards</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#624BF5" />
              <Text style={styles.featureText}>Achievement badges</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  featureList: {
    width: '100%',
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#444',
  },
});
