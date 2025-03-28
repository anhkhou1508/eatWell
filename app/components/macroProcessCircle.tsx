import { View, Text } from 'react-native'
import React from 'react'
import * as Progress from 'react-native-progress';

type Props = {
  color: string;
  title: string;
  value: number;
  maxValue: number;
}

export default function macroProcessCircle({color, title, value, maxValue}: Props) {
  const progress = value / maxValue;
  return(
    <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7}}>
      <Text style={{fontSize: 13, fontWeight: 'bold', color: color}}>
        {title}
      </Text>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10}}>
          <Progress.Circle 
            progress={progress} 
            color={color} 
            size={85} 
            showsText={true} 
            unfilledColor="#D9D9D9"
            formatText={() => 
              <View style={{alignItems: 'center', flexDirection: 'row'}}>
                <Text style={{fontSize: 14, fontWeight: 'bold', color: 'black'}}>{value}/{maxValue}</Text>
                <Text style={{fontSize: 12, fontWeight: 'bold', color: '#A3A1A1', marginTop:5}}>g</Text>
              </View>
            }
            borderWidth={0}
            thickness={7}
          />
      </View>
    </View>

  )
}