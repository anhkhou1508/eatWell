import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import MacroProcessCircle from './macroProcessCircle';
import Details from './details';
export default function macroTrackingBoard() {
  return (
    <View style={styles.container}>
      <View style={styles.whiteBox}>
        <View style={{flexDirection: 'row', alignItems: 'flex-end', marginBottom: 15}}>
          <Text style={{fontSize: 23, fontWeight: 'bold', color: '#624BF5', marginRight: 15}}>Eaten:</Text>
          <Text style={{fontSize: 21, fontWeight: 'bold', color: '#black', marginRight: 2}}>1382</Text>
          <Text style={{fontSize: 13, fontWeight: 'bold', color: '#A3A1A1', marginBottom: 2}}>kcal</Text>
        </View>
        <View style={{flexDirection: 'row', gap: 30}}>
          <MacroProcessCircle color="#5CB4B0" title="Carbonhydrate" value={70} maxValue={132}/>
          <MacroProcessCircle color="#F3B353" title="Protein" value={90} maxValue={130}/>
          <MacroProcessCircle color="#FF3131" title="Fat" value={132} maxValue={100}/>
        </View>
        <View style={{alignItems: 'flex-end', marginTop: 15}}>
          <Details tabName="profile"/>
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
    height: 210,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 17,
  }
});