import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'
import KcalProcessCircle from '../components/kcalProcessCircle'
import MacroProcessBar from '../components/macroProcessBar'
import NTBsComponent from '../components/NTBsComponent'

export default function nutritionTrackingBoard() {
  return (
    <View style={styles.container}>
      <View style={styles.whiteBox}>
        <View style={{flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: 15}}>

          <View style={{flexDirection: 'column', gap: 13}}>
            <View style={{flexDirection: 'row', gap: 60}}>
              <View style={{flexDirection: 'column', gap: 22}}>
                <NTBsComponent title="Eaten" kcal={1382}/>
                <NTBsComponent title="Burned" kcal={82}/>
              </View>
              <View>
                <KcalProcessCircle color="#624BF5" value={1300} maxValue={2000}/>
              </View>
            </View>
            <Image source={require('../../assets/images/bar.png')} style={{width: 290, height: 3, borderRadius:100}} />
          </View>
          
          <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 50}}>
            <MacroProcessBar color="#5CB5AE" title="Carbs" value={100} maxValue={100}/>
            <MacroProcessBar color="#F2B453" title="Protein" value={100} maxValue={100}/>
            <MacroProcessBar color="#FF3131" title="Fat" value={100} maxValue={100}/>
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
  }
});