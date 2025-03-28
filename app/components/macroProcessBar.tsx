import { View, Text } from 'react-native'
import React from 'react'
import * as Progress from 'react-native-progress';

type Props = {
  color: string;
  title: string;
  value: number;
  maxValue: number;
}

export default function macroProcessBar({color, title, value, maxValue}: Props) {
  const progress = value / maxValue;
  const remainValue = maxValue - value;
  return(
    <View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 3}}>
      <Text style={{fontSize: 15, fontWeight: 'bold', color: 'black', marginBottom: 2}}>{title}</Text>
      <Progress.Bar
        progress={progress}
        color={color}
        height={4}
        width={60}
        borderRadius={10}
        borderWidth={0}
        unfilledColor="#D9D9D9"
      />
      <Text style={{fontSize: 11, fontWeight: 'bold', color: '#A3A1A1', marginTop: -2}}>{remainValue} g left</Text>
    </View>
  )
}
