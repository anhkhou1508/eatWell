import { View, Text, Image } from 'react-native'
import React from 'react'

type Props = {
  title: string;
  kcal: number;
}
export default function NTBsComponent({title, kcal}: Props) {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
      <Image source={require('../../assets/images/bar2.png')} style={{width: 2, height: 47, borderRadius:100}} />
      <View style={{flexDirection: 'column', gap: 2}}>
        <Text style={{fontSize: 18, fontWeight: 'bold', color: '#624BF5'}}>{title}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontSize: 21, fontWeight: 'bold', color: 'black'}}>{kcal}</Text>
          <Text style={{fontSize: 14, fontWeight: '500', color: '#A3A1A1', marginTop: 4}}>kcal</Text>
        </View>
      </View>
    </View>
  )
}
