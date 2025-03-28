import { View, Text } from 'react-native'
import React from 'react'
import * as Progress from 'react-native-progress';

type Props = {
  color: string;
  value: number;
  maxValue: number;
}

export default function kcalProcessCircle({color, value, maxValue}: Props) {
  const progress = value / maxValue;
  return(
    <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10}}>
          <Progress.Circle 
            progress={progress} 
            color={color} 
            size={125} 
            showsText={true} 
            textStyle={{fontSize: 33, fontWeight: 'bold', color: 'black'}} 
            unfilledColor="#D9D9D9"
            formatText={() => (
              <View style={{alignItems: 'center'}}>
                <Text style={{fontSize: 30, fontWeight: 'bold', color: 'black'}}>{value}</Text>
                <Text style={{fontSize: 12, fontWeight: 'bold', color: '#A3A1A1', marginTop: -5}}>kcal left</Text>
              </View>
            )}
            borderWidth={0}
            thickness={9}
          />
      </View>
    </View>

  )
}