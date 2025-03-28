import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PropsWithChildren } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from "react-native-modal"
import LogFoodOption from './logFoodOption';
import { router } from 'expo-router';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
}>;

export default function AddFoodModal({ isVisible, children, onClose }: Props) {
  const navigateToLogFood = () => {
    onClose();
    router.push('/logFood');
  };

  return (
    
  <Modal isVisible={isVisible} onBackdropPress={onClose} style={{margin:0}} >
      <View style={styles.modalContent}>
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <LogFoodOption 
              image={require('../../assets/images/scanAMealIcon.png')} 
              title="Scan a meal" 
              onPress={navigateToLogFood}
            />
            <LogFoodOption 
              image={require('../../assets/images/scanABarcodeIcon.png')} 
              title="Scan a barcode" 
              onPress={navigateToLogFood}
            />
          </View>
          <View style={styles.optionsRow}>
            <LogFoodOption 
              image={require('../../assets/images/voiceLogIcon.png')} 
              title="Voice log" 
              onPress={navigateToLogFood}
            />
            <LogFoodOption 
              image={require('../../assets/images/addFoodIcon.png')} 
              title="Quick add" 
              onPress={navigateToLogFood}
            />
          </View>
        </View>
      </View>
  </Modal>
    
  );
}

const styles = StyleSheet.create({
  modalContent: {
    height: '39%',
    width: '100%',
    backgroundColor: '#E6EDFE',
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: 'absolute',
    bottom: 0,
  },
  optionsContainer: {
    padding: 20,
    paddingTop: 30,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
});
