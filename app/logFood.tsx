import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Keyboard, Alert, Linking, Image, Button, ActivityIndicator, Modal } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Stack, useRouter } from 'expo-router'
import LogFoodHeader from './components/logFoodHeader'
import { AntDesign, Ionicons, MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import LogFoodOption from './components/logFoodOption'
import * as ImagePicker from 'expo-image-picker'
import { CameraView, BarcodeScanningResult } from 'expo-camera'
import * as FileSystem from 'expo-file-system'
import MacroProcessPie from './components/macroProcessPie'
import * as Progress from 'react-native-progress';
import { Audio } from 'expo-av';


// Adding TypeScript interfaces for the scan meal API response
interface Ingredient {
  name: string;
  amount: string;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
}

interface MealAnalysis {
  dishName: string;
  calories: number;
  macros: MacroNutrients;
  ingredients: Ingredient[];
}

interface ApiResponse {
  response: MealAnalysis;
}

// Add interface for voice log API responses
interface VoiceLogApiResponse {
  response?: string;
  transcription?: string;
  error?: string;
  loading?: boolean;
}

// Add interface for voice food analysis response
interface VoiceFoodAnalysisResponse {
  dishName: string;
  calories: number;
  macros: MacroNutrients;
  ingredients: Ingredient[];
}

// Add interface for voice food analysis response API
interface VoiceFoodAnalysisApiResponse {
  structuredFoodData?: VoiceFoodAnalysisResponse;
  transcription?: string;
  error?: string;
}

// Add interfaces for search food results
interface SearchFoodMacro {
  protein: number;
  carbs: number;
  fat: number;
}

interface SearchFoodItem {
  name: string;
  calories: number;
  macros: SearchFoodMacro;
  servingSize: string;
  brand?: string;
}

interface SearchFoodResponse {
  results: SearchFoodItem[];
  error?: string;
}

export default function LogFood() {
  const [searchText, setSearchText] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [isBarcodeScanning, setIsBarcodeScanning] = useState(false)
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null)
  const [imageUri, setImageUri] = useState<string | null>(null)
  const cameraRef = useRef<any>(null)
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [quickAddModalVisible, setQuickAddModalVisible] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [isLoadingBarcode, setIsLoadingBarcode] = useState(false);
  const [testdata, setTestdata] = useState<VoiceLogApiResponse | null>(null);
  const [voiceLogInput, setVoiceLogInput] = useState('');
  const [newFoodItem, setNewFoodItem] = useState({
    name: '',
    calories: '',
    branch: '',
    amount: ''
  });
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');
  const [showTestApiButton, setShowTestApiButton] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPermission, setRecordingPermission] = useState<boolean | null>(null);
  const [showVoiceLogModal, setShowVoiceLogModal] = useState(false);
  const [voiceFoodAnalysis, setVoiceFoodAnalysis] = useState<VoiceFoodAnalysisResponse | null>(null);
  const [isAnalyzingVoiceFood, setIsAnalyzingVoiceFood] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchFoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter()
  
  // Function to search food with debounce
  const searchFood = (text: string) => {
    // Update search text state
    setSearchText(text);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If search text is empty, clear results and return
    if (!text.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    // Set debounce timeout (500ms)
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchResults(true);
      
      try {
        const response = await fetch('/api/searchFood', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: text }),
        });
        
        const data = await response.json() as SearchFoodResponse;
        
        if (data.error) {
          console.error('Search error:', data.error);
          Alert.alert('Search Error', 'Failed to search for food items');
          setSearchResults([]);
        } else {
          setSearchResults(data.results || []);
        }
      } catch (error) {
        console.error('Error searching food:', error);
        Alert.alert('Error', 'Failed to search for food items');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };
  
  // Handle selecting a food item from search results
  const handleSelectFood = (food: SearchFoodItem) => {
    // Create food item object
    const foodItem = {
      name: food.name,
      calories: food.calories,
      branch: food.brand || 'Unknown',
      amount: parseInt(food.servingSize) || 100
    };

    // Navigate back to diary with the new food item
    router.push({
      pathname: '/(tabs)/diary',
      params: { 
        newFoodItem: JSON.stringify(foodItem),
        mealType: selectedMealType
      }
    });
    
    // Clear search
    setSearchText('');
    setSearchResults([]);
    setShowSearchResults(false);
  };
  
  // Modify the handleClearSearch function to also clear search results
  const handleClearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setShowSearchResults(false);
    Keyboard.dismiss();
  };
  
  // Request microphone permissions
  const requestMicrophonePermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setRecordingPermission(status === 'granted');
    return status === 'granted';
  };
  
  // Function to start audio recording
  const startRecording = async () => {
    // Reset previous analysis data when starting a new recording
    setVoiceFoodAnalysis(null);
    setTestdata(null);
    setVoiceLogInput('');
    
    // Check for permissions
    const hasPermission = recordingPermission || await requestMicrophonePermission();
    
    if (!hasPermission) {
      Alert.alert(
        "Microphone Permission",
        "We need microphone access to record your voice",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Settings", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }
    
    try {
      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };
  
  // Function to stop audio recording and send to API
  const stopRecording = async () => {
    console.log('Stopping recording...');
    
    if (!recording) {
      console.log('No recording to stop');
      return;
    }
    
    try {
      // Stop the recording
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      
      // Set up default audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      
      // Get the recording URI
      const uri = recording.getURI();
      
      if (!uri) {
        console.error('No recording URI available');
        Alert.alert('Error', 'Failed to process recording. Please try again.');
        return;
      }
      
      console.log('Recording saved to', uri);
      
      // Show the voice log UI
      setShowTestApiButton(true);
      
      // Convert audio to base64 and send to API
      try {
        // Show loading state
        setTestdata({ loading: true });
        
        // Read file as base64
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Send to API
        const response = await fetch('/api/voiceLog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            audioBase64: base64Audio,
            extractIngredients: false // Just get transcription first
          }),
        });
        
        const result = await response.json();
        console.log('API Response:', result);
        
        // Update UI with result
        setTestdata(result);
        
        // If we have a transcription, set it as input
        if (result.transcription) {
          setVoiceLogInput(result.transcription);
        }
        
      } catch (error) {
        console.error('API Error:', error);
        setTestdata({ error: 'Failed to process audio. Please try again.' });
      }
      
      // Clean up recording
      setRecording(null);
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to process recording. Please try again.');
    }
  };
  
  // Function to extract ingredients from voice input
  const analyzeVoiceFood = async () => {
    if (!voiceLogInput) {
      Alert.alert('Error', 'Please record or type what you ate first.');
      return;
    }
    
    setIsAnalyzingVoiceFood(true);
    
    try {
      // Call the API to analyze the food input
      const response = await fetch('/api/voiceLog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: voiceLogInput,
          extractIngredients: true
        }),
      });
      
      const result = await response.json() as VoiceFoodAnalysisApiResponse;
      
      if (result.error) {
        console.error('API Error:', result.error);
        Alert.alert('Error', result.error);
        return;
      }
      
      if (result.structuredFoodData) {
        setVoiceFoodAnalysis(result.structuredFoodData);
        console.log('Received structured food data:', result.structuredFoodData);
      } else {
        Alert.alert('Error', 'Failed to extract ingredients. Please try again.');
      }
    } catch (error) {
      console.error('Food Analysis Error:', error);
      Alert.alert('Error', 'Failed to analyze food. Please try again.');
    } finally {
      setIsAnalyzingVoiceFood(false);
    }
  };
  
  const handleVoiceLog = async () => {
    setShowVoiceLogModal(true);
    setTestdata(null);
    setVoiceLogInput('');
    setShowTestApiButton(false);
    setVoiceFoodAnalysis(null);
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    setCameraPermission(status === 'granted')
    return status === 'granted'
  }

  const handleScanMeal = async () => {
    const hasPermission = await requestCameraPermission()
    
    if (hasPermission) {
      // Reset data when starting a new scan
      setData(null);
      setShowCamera(true)
      setIsBarcodeScanning(false)
    } else {
      Alert.alert(
        "Camera Permission",
        "We need camera access to scan your meal",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Settings", onPress: () => Linking.openSettings() }
        ]
      )
    }
  }

  const handleScanBarcode = async () => {
    const hasPermission = await requestCameraPermission()
    
    if (hasPermission) {
      // Reset barcode data when starting a new scan
      setScannedBarcode(null);
      setProductData(null);
      setShowCamera(true)
      setIsBarcodeScanning(true)
    } else {
      Alert.alert(
        "Camera Permission",
        "We need camera access to scan barcodes",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Settings", onPress: () => Linking.openSettings() }
        ]
      )
    }
  }

  const handleBarcodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    setScannedBarcode(data);
    setShowCamera(false);
    setIsLoadingBarcode(true);
    setShowBarcodeModal(true);
    
    try {
      const response = await fetch('/api/scanBarcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode: data }),
      });
      const result = await response.json();
      setProductData(result);
      
      // Initialize the newFoodItem with scanned product data
      if (result && result.product) {
        setNewFoodItem({
          name: result.product.name || '',
          calories: result.product.calories ? result.product.calories.toString() : '',
          branch: result.product.brand || '',
          amount: '100' // Default to 100g
        });
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      Alert.alert('Error', 'Failed to fetch product information');
    } finally {
      setIsLoadingBarcode(false);
    }
    
    console.log(`Barcode with type ${type} and data ${data} has been scanned!`);
  };

  const handleBackFromCamera = () => {
    setShowCamera(false)
  }

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setShowCamera(false);
      setShowAnalysisModal(true);
      // Reset previous analysis data when selecting a new image
      setData(null);
      // Now you can use the imageUri for further processing
      console.log("Selected image:", result.assets[0].uri);
    }
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImageUri(photo.uri);
      setShowCamera(false);
      setShowAnalysisModal(true);
      // Reset previous analysis data when taking a new picture
      setData(null);
      // Now you can use the imageUri for further processing
      console.log("Captured image:", photo.uri);
    }
  };

  // Convert image to base64
  const imageToBase64 = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      Alert.alert('Error', 'Failed to process image');
      return null;
    }
  };

  // Function to identify the dish
  const identifyDish = async () => {
    if (!imageUri) return;
    
    setIsAnalyzing(true);
    
    try {
      const base64Image = await imageToBase64(imageUri);
      
      if (!base64Image) {
        setIsAnalyzing(false);
        return;
      }
      
      const response = await fetch('/api/scanMeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64Image }),
      });
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error identifying dish:', error);
      Alert.alert('Error', 'Failed to identify dish. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // New function to handle quick add modal
  const handleQuickAdd = () => {
    setQuickAddModalVisible(true);
  }

  // New function to add food to meal
  const addFoodToMeal = () => {
    // Validate inputs
    if (!newFoodItem.name || !newFoodItem.calories || !newFoodItem.branch || !newFoodItem.amount) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    // Create food item object
    const foodItem = {
      name: newFoodItem.name,
      calories: parseInt(newFoodItem.calories),
      branch: newFoodItem.branch,
      amount: parseInt(newFoodItem.amount)
    };

    // Navigate back to diary with the new food item
    router.push({
      pathname: '/(tabs)/diary',
      params: { 
        newFoodItem: JSON.stringify(foodItem),
        mealType: selectedMealType
      }
    });

    // Reset form and close modal
    setNewFoodItem({
      name: '',
      calories: '',
      branch: '',
      amount: ''
    });
    setQuickAddModalVisible(false);
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView 
          style={styles.camera}
          ref={cameraRef}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_e', 'upc_a']
          }}
          onBarcodeScanned={isBarcodeScanning ? handleBarcodeScanned : undefined}
        >
          <View style={styles.cameraHeader}>
            <Pressable onPress={handleBackFromCamera} style={styles.backButton}>
              <AntDesign name="arrowleft" size={24} color="white" />
            </Pressable>
          </View>
          {isBarcodeScanning ? (
            <View style={styles.barcodeScannerContainer}>
              <MaterialCommunityIcons name="scan-helper" size={250} color="#624BF5" />
            </View>
          ) : (
            <View style={styles.cameraControls}>
              <Pressable onPress={handlePickImage} style={styles.cameraButton}>
                <MaterialIcons name="photo-library" size={28} color="white" />
                <Text style={styles.buttonText}>Gallery</Text>
              </Pressable>
              <Pressable onPress={handleTakePicture} style={styles.captureButton}>
                <Ionicons name="camera" size={32} color="white" />
              </Pressable>
            </View>
          )}
        </CameraView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LogFoodHeader />
      
      <View style={styles.searchContainer}>
        <AntDesign name="search1" size={20} color="#624BF5" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a food"
          placeholderTextColor="#CAC8C8"
          value={searchText}
          onChangeText={searchFood}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />
        {(searchText.length > 0 || isInputFocused) && (
          <Pressable onPress={handleClearSearch}>
            <AntDesign name="close" size={20} color="#624BF5" />
          </Pressable>
        )}
      </View>
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false} 
        style={{
          flexDirection: 'row', 
          marginBottom: 5,
          zIndex: 10,
          position: 'relative'
        }}
      >
        <LogFoodOption 
          image={require('../assets/images/scanAMealTest.png')} 
          title="Scan a meal" 
          onPress={handleScanMeal}
        />
        <View style={{ width: 15 }} /> {/* Added spacing */}
        <LogFoodOption 
          image={require('../assets/images/scanABarcodeIcon.png')} 
          title="Scan a barcode" 
          onPress={handleScanBarcode}
        />
        <View style={{ width: 15 }} /> {/* Added spacing */}
        <LogFoodOption 
          image={require('../assets/images/voiceLogIcon.png')} 
          title="Voice log"
          onPress={handleVoiceLog}
        />
        <View style={{ width: 15 }} /> {/* Added spacing */}
        <LogFoodOption 
          image={require('../assets/images/addFoodIcon.png')} 
          title="Quick add" 
          onPress={handleQuickAdd}
        />
      </ScrollView>
      
      {/* History Food Container */}
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>History</Text>
          <Pressable style={styles.filterButton}>
            <Feather name="filter" size={16} color="#624BF5" />
            <Text style={styles.filterButtonText}>Filter</Text>
          </Pressable>
        </View>
        <View style={styles.historyDivider} />
        
        {/* Example history items - just for UI display */}
        <View style={styles.emptyHistoryContainer}>
          <Text style={styles.emptyHistoryText}>No recent food items</Text>
        </View>
      </View>
      
      {/* Search Results Display */}
      {showSearchResults && (
        <View style={styles.searchResultsContainer}>
          {isSearching ? (
            <View style={styles.searchLoadingContainer}>
              <ActivityIndicator size="small" color="#624BF5" />
              <Text style={styles.searchLoadingText}>Searching for food...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <ScrollView style={styles.searchResultsScroll}>
              {searchResults.map((food, index) => (
                <Pressable 
                  key={index} 
                  style={({pressed}) => [
                    styles.searchResultItem,
                    pressed && {backgroundColor: '#f9f9f9'}
                  ]}
                  onPress={() => handleSelectFood(food)}
                >
                  <View style={styles.searchResultContent}>
                    <View style={styles.searchResultMain}>
                      <Text style={styles.searchResultName}>{food.name}</Text>
                      {food.brand && (
                        <Text style={styles.searchResultBrand}>{food.brand}</Text>
                      )}
                      <Text style={styles.searchResultServing}>{food.servingSize}</Text>
                    </View>
                    <View style={styles.searchResultNutrition}>
                      <Text style={styles.searchResultCalories}>{food.calories} kcal</Text>
                      <View style={styles.searchResultMacros}>
                        <Text style={[styles.macroText, {color: '#F3B353'}]}>P: {food.macros.protein}g</Text>
                        <Text style={[styles.macroText, {color: '#5CB4B0'}]}>C: {food.macros.carbs}g</Text>
                        <Text style={[styles.macroText, {color: '#FF3131'}]}>F: {food.macros.fat}g</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No food items found. Try a different search.</Text>
            </View>
          )}
        </View>
      )}
      
      {/* Voice Log Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showVoiceLogModal}
        onRequestClose={() => setShowVoiceLogModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Voice Log Food</Text>
              <Pressable 
                onPress={() => setShowVoiceLogModal(false)} 
                style={styles.closeButton}
              >
                <AntDesign name="close" size={24} color="#333" />
              </Pressable>
            </View>
            
            <ScrollView style={styles.voiceLogScrollView}>
              <View style={styles.voiceLogContainer}>
                <Text style={styles.voiceLogInstructions}>
                  {isRecording 
                    ? "Listening... Tap the mic when you're done." 
                    : "Tap the mic and describe what you ate."}
                </Text>
                
                <Pressable 
                  style={[
                    styles.micButtonCenter, 
                    isRecording && styles.recordingMicButton
                  ]} 
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <Ionicons 
                    name={isRecording ? "mic" : "mic-outline"} 
                    size={40} 
                    color={isRecording ? "#FFFFFF" : "#624BF5"} 
                  />
                </Pressable>
                
                {testdata?.loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#624BF5" />
                    <Text style={styles.loadingText}>Processing your voice...</Text>
                  </View>
                )}
                
                {testdata?.transcription && (
                  <View style={styles.transcriptionContainer}>
                    <Text style={styles.transcriptionLabel}>Your recording:</Text>
                    <Text style={styles.transcriptionText}>{testdata.transcription}</Text>
                    
                    {!voiceFoodAnalysis && !isAnalyzingVoiceFood && (
                      <Pressable 
                        style={styles.analyzeFoodButton} 
                        onPress={analyzeVoiceFood}
                      >
                        <Feather name="search" size={18} color="white" style={styles.buttonIcon} />
                        <Text style={styles.analyzeFoodButtonText}>Extract Ingredients</Text>
                      </Pressable>
                    )}
                  </View>
                )}
                
                {isAnalyzingVoiceFood && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#624BF5" />
                    <Text style={styles.loadingText}>Extracting ingredients...</Text>
                    <Text style={styles.loadingSubtext}>Identifying food items from your description</Text>
                  </View>
                )}
                
                {voiceFoodAnalysis && (
                  <View style={styles.foodAnalysisContainer}>
                    <Text style={styles.sectionTitle}>Extracted Ingredients</Text>
                    
                    <View style={styles.macroChartContainer}>
                      <MacroProcessPie 
                        protein={voiceFoodAnalysis.macros.protein} 
                        carbs={voiceFoodAnalysis.macros.carbs} 
                        fat={voiceFoodAnalysis.macros.fat} 
                        calories={voiceFoodAnalysis.calories} 
                      />
                    </View>
                    
                    <View style={styles.ingredientsSection}>
                      {voiceFoodAnalysis.ingredients.map((ingredient, index) => (
                        <View key={index} style={styles.ingredientItem}>
                          <View style={styles.ingredientNameContainer}>
                            <Text style={styles.ingredientName}>{ingredient.name}</Text>
                            <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>
                          </View>
                          <View style={styles.macroProgressContainer}>
                            <View style={styles.macroProgress}>
                              <Text style={styles.macroLabel}>Protein</Text>
                              <Progress.Bar
                                progress={ingredient.protein / 30} // Scale to reasonable range
                                color="#F3B353"
                                height={4}
                                width={60}
                                borderRadius={10}
                                borderWidth={0}
                                unfilledColor="#D9D9D9"
                              />
                              <Text style={styles.macroValue}>{ingredient.protein}g</Text>
                            </View>
                            <View style={styles.macroProgress}>
                              <Text style={styles.macroLabel}>Carbs</Text>
                              <Progress.Bar
                                progress={ingredient.carbs / 30} // Scale to reasonable range
                                color="#5CB4B0"
                                height={4}
                                width={60}
                                borderRadius={10}
                                borderWidth={0}
                                unfilledColor="#D9D9D9"
                              />
                              <Text style={styles.macroValue}>{ingredient.carbs}g</Text>
                            </View>
                            <View style={styles.macroProgress}>
                              <Text style={styles.macroLabel}>Fat</Text>
                              <Progress.Bar
                                progress={ingredient.fat / 30} // Scale to reasonable range
                                color="#FF3131"
                                height={4}
                                width={60}
                                borderRadius={10}
                                borderWidth={0}
                                unfilledColor="#D9D9D9"
                              />
                              <Text style={styles.macroValue}>{ingredient.fat}g</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                    
                    {/* Meal Type Selector */}
                    <View style={styles.mealTypeSelectorContainer}>
                      <Text style={styles.mealTypeSelectorTitle}>Select Meal Type:</Text>
                      <View style={styles.mealTypeSelector}>
                        <View style={styles.mealTypeSelectorRow}>
                          <Pressable 
                            key="Breakfast"
                            style={[
                              styles.mealTypeOption,
                              selectedMealType === 'Breakfast' && styles.selectedMealType
                            ]}
                            onPress={() => setSelectedMealType('Breakfast')}
                          >
                            <Text style={[
                              styles.mealTypeText,
                              selectedMealType === 'Breakfast' && styles.selectedMealTypeText
                            ]}>
                              Breakfast
                            </Text>
                          </Pressable>
                          <Pressable 
                            key="Lunch"
                            style={[
                              styles.mealTypeOption,
                              selectedMealType === 'Lunch' && styles.selectedMealType
                            ]}
                            onPress={() => setSelectedMealType('Lunch')}
                          >
                            <Text style={[
                              styles.mealTypeText,
                              selectedMealType === 'Lunch' && styles.selectedMealTypeText
                            ]}>
                              Lunch
                            </Text>
                          </Pressable>
                        </View>
                        <View style={styles.mealTypeSelectorRow}>
                          <Pressable 
                            key="Dinner"
                            style={[
                              styles.mealTypeOption,
                              selectedMealType === 'Dinner' && styles.selectedMealType
                            ]}
                            onPress={() => setSelectedMealType('Dinner')}
                          >
                            <Text style={[
                              styles.mealTypeText,
                              selectedMealType === 'Dinner' && styles.selectedMealTypeText
                            ]}>
                              Dinner
                            </Text>
                          </Pressable>
                          <Pressable 
                            key="Snack"
                            style={[
                              styles.mealTypeOption,
                              selectedMealType === 'Snack' && styles.selectedMealType
                            ]}
                            onPress={() => setSelectedMealType('Snack')}
                          >
                            <Text style={[
                              styles.mealTypeText,
                              selectedMealType === 'Snack' && styles.selectedMealTypeText
                            ]}>
                              Snack
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                    
                    <Pressable 
                      style={styles.addToLogButton} 
                      onPress={() => {
                        if (voiceFoodAnalysis?.ingredients) {
                          // Convert all ingredients to FoodItem format and add to diary
                          const ingredientItems = voiceFoodAnalysis.ingredients.map((ingredient) => ({
                            name: ingredient.name,
                            calories: Math.round((ingredient.protein * 4) + (ingredient.carbs * 4) + (ingredient.fat * 9)), // Calculate calories based on macros
                            branch: "Voice Log",
                            amount: parseInt(ingredient.amount) || 100 // Default to 100g if amount cannot be parsed
                          }));
                          
                          // Navigate to diary with all ingredient items
                          router.push({
                            pathname: '/(tabs)/diary',
                            params: { 
                              newFoodItem: JSON.stringify(ingredientItems[0]), // Add first ingredient immediately
                              mealType: selectedMealType,
                              pendingIngredients: JSON.stringify(ingredientItems.slice(1)) // Store remaining ingredients for sequential addition
                            }
                          });
                        }
                        
                        setShowVoiceLogModal(false);
                        setVoiceFoodAnalysis(null);
                      }}
                    >
                      <Text style={styles.addToLogButtonText}>Add to Food Log</Text>
                    </Pressable>
                  </View>
                )}
                
                {testdata?.error && (
                  <View style={styles.errorApiContainer}>
                    <Text style={styles.errorApiText}>
                      {testdata.error}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Barcode Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBarcodeModal}
        onRequestClose={() => {
          setShowBarcodeModal(false);
          setProductData(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scanned Product</Text>
              <Pressable 
                onPress={() => {
                  setShowBarcodeModal(false);
                  setProductData(null);
                }} 
                style={styles.closeButton}
              >
                <AntDesign name="close" size={24} color="#333" />
              </Pressable>
            </View>
            
            <ScrollView style={styles.scanMealModalScrollView} showsVerticalScrollIndicator={false}>
              {isLoadingBarcode ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#624BF5" />
                  <Text style={styles.loadingText}>Fetching product information...</Text>
                </View>
              ) : productData && productData.product ? (
                <View style={styles.analysisContent}>
                  {/* Product Header - Name and Brand */}
                  <View style={styles.productHeader}>
                    <Text style={styles.productName}>{productData.product.name}</Text>
                    <Text style={styles.productBrandText}>{productData.product.brand}</Text>
                  </View>
                  
                  {/* Macro Process Pie */}
                  <View style={styles.macroChartContainer}>
                    <MacroProcessPie 
                      protein={productData.product.macros.protein} 
                      carbs={productData.product.macros.carbs} 
                      fat={productData.product.macros.fat} 
                      calories={productData.product.calories} 
                    />
                  </View>
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Meal Type:</Text>
                    <View style={styles.mealTypeSelector}>
                      <View style={styles.mealTypeSelectorRow}>
                        <Pressable 
                          key="Breakfast"
                          style={[
                            styles.mealTypeOption,
                            selectedMealType === 'Breakfast' && styles.selectedMealType
                          ]}
                          onPress={() => setSelectedMealType('Breakfast')}
                        >
                          <Text style={[
                            styles.mealTypeText,
                            selectedMealType === 'Breakfast' && styles.selectedMealTypeText
                          ]}>
                            Breakfast
                          </Text>
                        </Pressable>
                        <Pressable 
                          key="Lunch"
                          style={[
                            styles.mealTypeOption,
                            selectedMealType === 'Lunch' && styles.selectedMealType
                          ]}
                          onPress={() => setSelectedMealType('Lunch')}
                        >
                          <Text style={[
                            styles.mealTypeText,
                            selectedMealType === 'Lunch' && styles.selectedMealTypeText
                          ]}>
                            Lunch
                          </Text>
                        </Pressable>
                      </View>
                      <View style={styles.mealTypeSelectorRow}>
                        <Pressable 
                          key="Dinner"
                          style={[
                            styles.mealTypeOption,
                            selectedMealType === 'Dinner' && styles.selectedMealType
                          ]}
                          onPress={() => setSelectedMealType('Dinner')}
                        >
                          <Text style={[
                            styles.mealTypeText,
                            selectedMealType === 'Dinner' && styles.selectedMealTypeText
                          ]}>
                            Dinner
                          </Text>
                        </Pressable>
                        <Pressable 
                          key="Snack"
                          style={[
                            styles.mealTypeOption,
                            selectedMealType === 'Snack' && styles.selectedMealType
                          ]}
                          onPress={() => setSelectedMealType('Snack')}
                        >
                          <Text style={[
                            styles.mealTypeText,
                            selectedMealType === 'Snack' && styles.selectedMealTypeText
                          ]}>
                            Snack
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                  
                  <Pressable 
                    style={styles.addButton} 
                    onPress={() => {
                      // Create food item object using product data directly
                      const foodItem = {
                        name: productData.product.name,
                        calories: productData.product.calories,
                        branch: productData.product.brand || 'Unknown',
                        amount: 100 // Default to 100g
                      };

                      // Navigate back to diary with the new food item
                      router.push({
                        pathname: '/(tabs)/diary',
                        params: { 
                          newFoodItem: JSON.stringify(foodItem),
                          mealType: selectedMealType
                        }
                      });
                      
                      // Close modal
                      setShowBarcodeModal(false);
                    }}
                  >
                    <Text style={styles.addButtonText}>Add to Food Log</Text>
                  </Pressable>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Scan Meal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAnalysisModal}
        onRequestClose={() => setShowAnalysisModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan Meal</Text>
              <Pressable 
                onPress={() => setShowAnalysisModal(false)} 
                style={styles.closeButton}
              >
                <AntDesign name="close" size={24} color="#333" />
              </Pressable>
            </View>
            
            <ScrollView style={styles.scanMealModalScrollView} showsVerticalScrollIndicator={false}>
              {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.foodImage} resizeMode="cover" />
              )}
              
              {!data && !isAnalyzing && (
                <Pressable 
                  style={styles.identifyButton} 
                  onPress={identifyDish}
                >
                  <Feather name="search" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.identifyButtonText}>Identify Dish</Text>
                </Pressable>
              )}
              
              {isAnalyzing && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#624BF5" />
                  <Text style={styles.loadingText}>Analyzing your meal...</Text>
                  <Text style={styles.loadingSubtext}>Identifying ingredients and calculating nutritional values</Text>
                </View>
              )}
              
              {data && data.response && (
                <View style={styles.resultsContainer}>
                  
                  
                  <Text style={styles.dishName}>{data.response.dishName}</Text>
                  
                  <View style={styles.macroChartContainer}>
                    <MacroProcessPie 
                      protein={data.response.macros.protein} 
                      carbs={data.response.macros.carbs} 
                      fat={data.response.macros.fat} 
                      calories={data.response.calories} 
                    />
                  </View>
                  
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  
                  <View style={styles.ingredientsSection}>
                    {data.response.ingredients.map((ingredient, index) => (
                      <View key={index} style={styles.ingredientItem}>
                        <View style={styles.ingredientNameContainer}>
                          <Text style={styles.ingredientName}>{ingredient.name}</Text>
                          <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>
                        </View>
                        <View style={styles.macroProgressContainer}>
                          <View style={styles.macroProgress}>
                            <Text style={styles.macroLabel}>Protein</Text>
                            <Progress.Bar
                              progress={ingredient.protein / 30} // Scale to reasonable range
                              color="#F3B353"
                              height={4}
                              width={60}
                              borderRadius={10}
                              borderWidth={0}
                              unfilledColor="#D9D9D9"
                            />
                            <Text style={styles.macroValue}>{ingredient.protein}g</Text>
                          </View>
                          <View style={styles.macroProgress}>
                            <Text style={styles.macroLabel}>Carbs</Text>
                            <Progress.Bar
                              progress={ingredient.carbs / 30} // Scale to reasonable range
                              color="#5CB4B0"
                              height={4}
                              width={60}
                              borderRadius={10}
                              borderWidth={0}
                              unfilledColor="#D9D9D9"
                            />
                            <Text style={styles.macroValue}>{ingredient.carbs}g</Text>
                          </View>
                          <View style={styles.macroProgress}>
                            <Text style={styles.macroLabel}>Fat</Text>
                            <Progress.Bar
                              progress={ingredient.fat / 30} // Scale to reasonable range
                              color="#FF3131"
                              height={4}
                              width={60}
                              borderRadius={10}
                              borderWidth={0}
                              unfilledColor="#D9D9D9"
                            />
                            <Text style={styles.macroValue}>{ingredient.fat}g</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  {/* Meal Type Selector */}
                  <View style={styles.mealTypeSelectorContainer}>
                    <Text style={styles.mealTypeSelectorTitle}>Select Meal Type:</Text>
                    <View style={styles.mealTypeSelector}>
                      <View style={styles.mealTypeSelectorRow}>
                        <Pressable 
                          key="Breakfast"
                          style={[
                            styles.mealTypeOption,
                            selectedMealType === 'Breakfast' && styles.selectedMealType
                          ]}
                          onPress={() => setSelectedMealType('Breakfast')}
                        >
                          <Text style={[
                            styles.mealTypeText,
                            selectedMealType === 'Breakfast' && styles.selectedMealTypeText
                          ]}>
                            Breakfast
                          </Text>
                        </Pressable>
                        <Pressable 
                          key="Lunch"
                          style={[
                            styles.mealTypeOption,
                            selectedMealType === 'Lunch' && styles.selectedMealType
                          ]}
                          onPress={() => setSelectedMealType('Lunch')}
                        >
                          <Text style={[
                            styles.mealTypeText,
                            selectedMealType === 'Lunch' && styles.selectedMealTypeText
                          ]}>
                            Lunch
                          </Text>
                        </Pressable>
                      </View>
                      <View style={styles.mealTypeSelectorRow}>
                        <Pressable 
                          key="Dinner"
                          style={[
                            styles.mealTypeOption,
                            selectedMealType === 'Dinner' && styles.selectedMealType
                          ]}
                          onPress={() => setSelectedMealType('Dinner')}
                        >
                          <Text style={[
                            styles.mealTypeText,
                            selectedMealType === 'Dinner' && styles.selectedMealTypeText
                          ]}>
                            Dinner
                          </Text>
                        </Pressable>
                        <Pressable 
                          key="Snack"
                          style={[
                            styles.mealTypeOption,
                            selectedMealType === 'Snack' && styles.selectedMealType
                          ]}
                          onPress={() => setSelectedMealType('Snack')}
                        >
                          <Text style={[
                            styles.mealTypeText,
                            selectedMealType === 'Snack' && styles.selectedMealTypeText
                          ]}>
                            Snack
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                  
                  <Pressable 
                    style={styles.addToLogButton} 
                    onPress={() => {
                      if (data?.response?.ingredients) {
                        // Convert all ingredients to FoodItem format and add to diary
                        const ingredientItems = data.response.ingredients.map((ingredient) => ({
                          name: ingredient.name,
                          calories: Math.round((ingredient.protein * 4) + (ingredient.carbs * 4) + (ingredient.fat * 9)), // Calculate calories based on macros
                          branch: "Scan Meal",
                          amount: parseInt(ingredient.amount) || 100 // Default to 100g if amount cannot be parsed
                        }));
                        
                        // Navigate to diary with all ingredient items
                        router.push({
                          pathname: '/(tabs)/diary',
                          params: { 
                            newFoodItem: JSON.stringify(ingredientItems[0]), // Add first ingredient immediately
                            mealType: selectedMealType,
                            pendingIngredients: JSON.stringify(ingredientItems.slice(1)) // Store remaining ingredients for sequential addition
                          }
                        });
                      }
                      
                      setShowAnalysisModal(false);
                    }}
                  >
                    <Text style={styles.addToLogButtonText}>Add to Food Log</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Quick Add Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={quickAddModalVisible}
        onRequestClose={() => setQuickAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quick Add Food</Text>
              <Pressable 
                onPress={() => setQuickAddModalVisible(false)} 
                style={styles.closeButton}
              >
                <AntDesign name="close" size={24} color="#333" />
              </Pressable>
            </View>
            
            <ScrollView style={styles.quickAddModalScrollView}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Food Name:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter food name"
                  value={newFoodItem.name}
                  onChangeText={(text) => setNewFoodItem({...newFoodItem, name: text})}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Calories:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter calories"
                  value={newFoodItem.calories}
                  onChangeText={(text) => setNewFoodItem({...newFoodItem, calories: text})}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Brand:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter brand name"
                  value={newFoodItem.branch}
                  onChangeText={(text) => setNewFoodItem({...newFoodItem, branch: text})}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount (g):</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter amount in grams"
                  value={newFoodItem.amount}
                  onChangeText={(text) => setNewFoodItem({...newFoodItem, amount: text})}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Meal Type:</Text>
                <View style={styles.mealTypeSelector}>
                  <View style={styles.mealTypeSelectorRow}>
                    <Pressable 
                      key="Breakfast"
                      style={[
                        styles.mealTypeOption,
                        selectedMealType === 'Breakfast' && styles.selectedMealType
                      ]}
                      onPress={() => setSelectedMealType('Breakfast')}
                    >
                      <Text style={[
                        styles.mealTypeText,
                        selectedMealType === 'Breakfast' && styles.selectedMealTypeText
                      ]}>
                        Breakfast
                      </Text>
                    </Pressable>
                    <Pressable 
                      key="Lunch"
                      style={[
                        styles.mealTypeOption,
                        selectedMealType === 'Lunch' && styles.selectedMealType
                      ]}
                      onPress={() => setSelectedMealType('Lunch')}
                    >
                      <Text style={[
                        styles.mealTypeText,
                        selectedMealType === 'Lunch' && styles.selectedMealTypeText
                      ]}>
                        Lunch
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.mealTypeSelectorRow}>
                    <Pressable 
                      key="Dinner"
                      style={[
                        styles.mealTypeOption,
                        selectedMealType === 'Dinner' && styles.selectedMealType
                      ]}
                      onPress={() => setSelectedMealType('Dinner')}
                    >
                      <Text style={[
                        styles.mealTypeText,
                        selectedMealType === 'Dinner' && styles.selectedMealTypeText
                      ]}>
                        Dinner
                      </Text>
                    </Pressable>
                    <Pressable 
                      key="Snack"
                      style={[
                        styles.mealTypeOption,
                        selectedMealType === 'Snack' && styles.selectedMealType
                      ]}
                      onPress={() => setSelectedMealType('Snack')}
                    >
                      <Text style={[
                        styles.mealTypeText,
                        selectedMealType === 'Snack' && styles.selectedMealTypeText
                      ]}>
                        Snack
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
              
              <Pressable 
                style={styles.addButton} 
                onPress={addFoodToMeal}
              >
                <Text style={styles.addButtonText}>Add to Food Log</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFB',
    paddingHorizontal: 30,
    paddingVertical: 40,
    position: 'relative',
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 282,
    height: 51,
    width: 353,
    paddingHorizontal: 15,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 20,
    marginBottom: 25,
    zIndex: 20,
    position: 'relative',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#000',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    paddingTop: 50,
    paddingLeft: 20,
  },
  backButton: {
    padding: 10,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cameraButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 4,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
  barcodeScannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
  barcodeResultContainer: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  barcodeResultText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '90%',
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#624BF5',
  },
  closeButton: {
    padding: 5,
  },
  // Scan Meal Modal ScrollView Style
  scanMealModalScrollView: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingBottom: 30,
  },
  // Quick Add Modal ScrollView Style
  quickAddModalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  analysisContent: {
    padding: 20,
    alignItems: 'center',
  },
  foodImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
  },
  identifyButton: {
    backgroundColor: '#624BF5',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginTop: 10,
    minWidth: 220,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#624BF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  identifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '600',
    color: '#624BF5',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  resultsContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  resultHeaderText: {
    fontSize: 0,
    fontWeight: 'bold',
    color: '#624BF5',
    alignItems: 'center',
  },
  dishName: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  macroChartContainer: {
    alignItems: 'center',
    marginBottom: -15,
    paddingVertical: 10,
  },
  resultsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#624BF5',
    marginBottom: -10,
    marginTop: 30,
    alignSelf: 'center',
  },
  ingredientsSection: {
    marginTop: 20,
    width: '100%',
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  ingredientNameContainer: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ingredientAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  macroProgressContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroProgress: {
    alignItems: 'center',
  },
  macroItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
  },
  addToLogButton: {
    backgroundColor: '#624BF5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addToLogButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  mealTypeSelectorContainer: {
    marginBottom: 20,
    width: '100%',
  },
  mealTypeSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    marginTop: 10,
  },
  mealTypeSelector: {
    width: '100%',
    justifyContent: 'center',
    marginTop: 5,
  },
  mealTypeSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mealTypeOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    width: '48%',
    alignItems: 'center',
  },
  selectedMealType: {
    backgroundColor: '#624BF5',
  },
  mealTypeText: {
    fontSize: 14,
    color: '#333',
  },
  selectedMealTypeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#624BF5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productInfoContainer: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productBrand: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  nutritionContainer: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  caloriesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#624BF5',
    marginBottom: 15,
    textAlign: 'center',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFEBEE',
    borderRadius: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
  testApiButtonContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    alignItems: 'center',
  },
  testApiResponseText: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  voiceLogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  voiceLogInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  voiceLogButton: {
    backgroundColor: '#624BF5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  voiceLogButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorApiContainer: {
    padding: 20,
    backgroundColor: '#FFEBEE',
    borderRadius: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorApiText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
  apiResponseContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  apiResponseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderColor: '#FF3131',
    borderWidth: 1,
    borderRadius: 16,
  },
  transcriptionContainer: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#624BF5',
  },
  transcriptionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
  },
  voiceLogContainer: {
    padding: 20,
    alignItems: 'center',
  },
  voiceLogInstructions: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  micButtonCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#624BF5',
  },
  recordingMicButton: {
    backgroundColor: '#FF3131',
    borderColor: '#FF3131',
  },
  voiceLogInputContainer: {
    width: '100%',
    marginTop: 20,
  },
  voiceLogScrollView: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  analyzeFoodButton: {
    backgroundColor: '#624BF5',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzeFoodButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  foodAnalysisContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    marginTop: 15,
  },
  // New styles for product display
  productHeader: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  productBrandText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginVertical: 20,
  },
  productInfoDisplay: {
    marginBottom: 20,
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    flex: 1,
    marginLeft: 15,
  },
  searchResultsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    marginHorizontal: 10,
    marginBottom: 20,
    maxHeight: 300,
    zIndex: 999,
    paddingVertical: 5,
    position: 'absolute',
    top: 168,
    left: 10,
    right: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  searchLoadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#624BF5',
  },
  searchResultsScroll: {
    maxHeight: 300,
  },
  searchResultItem: {
    padding: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  searchResultContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchResultMain: {
    flex: 1,
    paddingRight: 10,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  searchResultBrand: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  searchResultServing: {
    fontSize: 12,
    color: '#888',
  },
  searchResultNutrition: {
    alignItems: 'flex-end',
    marginLeft: 5,
  },
  searchResultCalories: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#624BF5',
    marginBottom: 4,
  },
  searchResultMacros: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 3,
  },
  macroText: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 4,
    fontWeight: '500',
  },
  noResultsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  noResultsText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  historyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 2,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 530,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#624BF5',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#624BF5',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  historyDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginVertical: 10,
  },
  emptyHistoryContainer: {
    padding: 15,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#666',
  },
})
