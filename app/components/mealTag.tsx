import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

type Props = {
  color: string;
  mealType: string;
  mealName: string[];
  kcal: string;
};
export default function MealTag({ color, mealType, mealName, kcal }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <View style={styles.mealInfo}>
        <Text style={styles.mealType}>{mealType}</Text>
        <View style={styles.mealNameContainer}>
          {mealName.map((item, index) => (
            <Text key={index} style={styles.mealName}>{item}</Text>
          ))}
        </View>
        <View style={styles.kcalContainer}>
          <Text style={styles.kcal}>
            {kcal}
            <Text style={styles.kcalUnit}> kcal</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
    borderTopRightRadius: 79,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 180,
    width: 120,
  },
  mealInfo: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
  },
  mealType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 13,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  mealNameContainer: {
    marginTop: 12,
    marginBottom: 5,
    flexShrink: 1,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  kcalContainer: {
    marginTop: 'auto',
  },
  kcal: {
    fontSize: 25,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  kcalUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
});
