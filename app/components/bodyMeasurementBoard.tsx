import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function bodyMeasurementBoard() {
  return (
    <View style={styles.container}>
      <View style={styles.whiteBox}>
        <View style={styles.comingSoonContainer}>
          <MaterialCommunityIcons name="scale-bathroom" size={60} color="#624BF5" />
          <Text style={styles.comingSoonText}>Body Measurements</Text>
          <Text style={styles.descriptionText}>
            Track your weight, BMI, body fat percentage and more. This feature will be available soon!
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
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  whiteBox: {
    width: '100%',
    height: 240,
    backgroundColor: 'white',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 79,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
    paddingVertical: 25,
    alignItems: 'center',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  comingSoonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#624BF5',
    marginTop: 10,
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#5F6368',
    textAlign: 'center',
    marginBottom: 15,
  },
  featureList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    color: '#624BF5',
    marginLeft: 5,
  }
});