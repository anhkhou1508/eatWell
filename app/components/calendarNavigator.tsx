import { View, Text, Pressable, StyleSheet } from 'react-native'
import Entypo from '@expo/vector-icons/Entypo';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import React, { useState } from 'react'
import Modal from "react-native-modal"
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function CalendarNavigator() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const onDateChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 20}}>
        <Pressable style={{marginRight: 7}} onPress={goToPreviousDay}>
            <Entypo name="chevron-left" size={24} color="#5F6368" />
        </Pressable>
        <Pressable style={{flexDirection: 'row', alignItems: 'center', gap: 1}} onPress={toggleModal}>
            <EvilIcons name="calendar" size={27} color="#5F6368" />
            <Text style={{fontSize: 15, fontWeight: 'bold', color: '#5F6368'}}>{formatDate(selectedDate)}</Text>
        </Pressable>
        <Pressable style={{marginLeft: 10}} onPress={goToNextDay}>
            <Entypo name="chevron-right" size={24} color="#5F6368" />
        </Pressable>

        <Modal isVisible={isModalVisible} onBackdropPress={toggleModal} style={{margin: 0}}>
          <View style={styles.modalContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Change Date</Text>
              <Pressable onPress={toggleModal}>
                <MaterialIcons name="close" color="#624BF5" size={22} />
              </Pressable>
            </View>
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                themeVariant="light"
                textColor="#624BF5"
              />
            </View>
          </View>
        </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  modalContent: {
    height: '40%',
    width: '100%',
    backgroundColor: '#E6EDFE',
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: 'absolute',
    bottom: 0,
  },
  titleContainer: {
    height: '16%',
    backgroundColor: '#E6EDFE',
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#624BF5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
