import { View, Text, Image, Pressable, StyleSheet, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native'
import React from 'react'

type Props = {
  image: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function LogFoodOption({ image, title, onPress, style }: Props) {
  return (
    <Pressable style={[styles.container, style]} onPress={onPress}>
      <Image 
        source={image} 
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 158,
    height: 111,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  title: {
    color: '#624BF5',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
