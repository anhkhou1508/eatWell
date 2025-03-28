import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'

const addFood = () => {
  const [expanded, setExpanded] = useState(false);
  const animatedWidth = useRef(new Animated.Value(100)).current;

  const toggleExpand = () => {
    const toValue = expanded ? 100 : 300;
    
    Animated.timing(animatedWidth, {
      toValue: toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setExpanded(!expanded);
  };

  // This ensures the animation is visible when the component mounts
  useEffect(() => {
    // Force a re-render to make sure animation is applied
    animatedWidth.setValue(100);
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>
          {expanded ? "Collapse" : "Expand"}
        </Text>
      </TouchableOpacity>
      
      <Animated.View 
        style={[
          styles.purpleView, 
          { width: animatedWidth }
        ]}
      >
        <Text style={styles.viewText} numberOfLines={expanded ? 0 : 1}>
          This is the hidden text that appears when expanded! It will be fully visible when the view is expanded.
        </Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  purpleView: {
    backgroundColor: 'purple',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  viewText: {
    color: 'white',
    textAlign: 'left',
    fontSize: 14,
  }
});

export default addFood