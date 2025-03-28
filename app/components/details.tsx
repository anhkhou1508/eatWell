import { View, Text, StyleSheet, Pressable,  } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign';

type Props = {
  tabName: string;
}
export default function details({tabName}: Props) {
  const router = useRouter();
  return(
    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginHorizontal: 15}}>
        <Pressable style={{flexDirection:'row', alignItems:'center', gap: 2}} onPress={() => router.push(tabName)}>
          <Text style={{fontSize: 14, fontWeight: 'bold', color: "#624BF5"}}>Details</Text>
          <Text style={{marginTop: 1.5}}>
            <AntDesign name="arrowright" size={15} color="#5F6368" />
          </Text>
        </Pressable>
    </View>
  )
}