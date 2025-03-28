import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Declare global variable for temporary data storage
// In a real app, you would use a proper state management system
declare global {
  var tempMealData: any;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  mealPlan?: {
    days: Array<{
      day: string;
      meals: {
        breakfast: {
          name: string;
          calories: string;
          macros: {
            protein: string;
            carbs: string;
            fat: string;
          };
          imageDescription: string;
          imageUrl?: string;
        };
        lunch: {
          name: string;
          calories: string;
          macros: {
            protein: string;
            carbs: string;
            fat: string;
          };
          imageDescription: string;
          imageUrl?: string;
        };
        dinner: {
          name: string;
          calories: string;
          macros: {
            protein: string;
            carbs: string;
            fat: string;
          };
          imageDescription: string;
          imageUrl?: string;
        };
      };
    }>;
  };
}

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I\'m your meal planning assistant. How can I help you today?', isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Convert messages to the format expected by the API
  const formatChatHistory = () => {
    return messages.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    }));
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Prepare chat history for the API
      const chatHistory = formatChatHistory();
      
      // Call the API
      const response = await fetch('/api/mealPlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          chatHistory: chatHistory,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      
      // Clean the response text from any code blocks or markdown
      let cleanedText = data.response;
      // Remove any ```json or ``` formatting
      cleanedText = cleanedText.replace(/```(?:json)?[\s\S]*?```/g, '');
      // Remove any remaining markdown code indicators
      cleanedText = cleanedText.replace(/```/g, '');
      
      // Create AI response message
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: cleanedText.trim(),
        isUser: false,
      };
      
      // If there's a meal plan in the response, add it to the message
      if (data.mealPlan && data.mealPlan.days) {
        aiResponse.mealPlan = data.mealPlan;
      }
      
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      // Show error message to user
      Alert.alert(
        'Error',
        'Failed to get a response. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const applyMealPlan = () => {
    // Get the latest message that contains a meal plan
    const mealPlanMessage = messages.findLast(msg => msg.mealPlan);
    
    if (mealPlanMessage?.mealPlan) {
      // For this demo, we'll just take the first day and its breakfast
      const firstDay = mealPlanMessage.mealPlan.days[0];
      
      // Create a simplified version of the data with just one meal (breakfast)
      const mealData = {
        day: firstDay.day,
        meal: firstDay.meals.breakfast
      };
      
      // Navigate to the meal plan screen with a flag indicating we have data
      router.push({
        pathname: '/(tabs)/mealPlan',
        params: { 
          fromAIChat: 'true',
          day: firstDay.day,
          hasMealPlanData: 'true'
        }
      });
      
      // Store the meal data in a global variable for demonstration purposes
      // In a real app, you would use a proper state management solution
      global.tempMealData = mealData;
      
      console.log('Meal plan applied for day:', firstDay.day);
    } else {
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View style={[styles.header, { marginTop: -50, paddingTop: 50 }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#624BF5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Meal Assistant</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Chat Messages */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => (
              <View key={message.id} style={styles.messageRow}>
                {!message.isUser && (
                  <Image 
                    source={require('../assets/images/botImage.png')} 
                    style={styles.botAvatar} 
                  />
                )}
                <View 
                  style={[
                    styles.messageBubble, 
                    message.isUser ? styles.userBubble : styles.aiBubble
                  ]}
                >
                  <Text style={[
                    styles.messageText, 
                    message.isUser ? styles.userMessageText : styles.aiMessageText
                  ]}>
                    {message.text}
                  </Text>
                  
                  {message.mealPlan && (
                    <View style={styles.mealPlanContainer}>
                      {message.mealPlan.days.map((day, index) => (
                        <View key={index} style={styles.dayRow}>
                          <Text style={styles.dayText}>{day.day}</Text>
                          <View style={styles.mealsContainer}>
                            <View style={styles.mealTableRow}>
                              <Text style={styles.mealTypeText}>Breakfast</Text>
                              <View style={styles.mealColumnDivider} />
                              <Text style={styles.mealDishText}>{day.meals.breakfast.name}</Text>
                            </View>
                            <View style={styles.mealRowDivider} />
                            <View style={styles.mealTableRow}>
                              <Text style={styles.mealTypeText}>Lunch</Text>
                              <View style={styles.mealColumnDivider} />
                              <Text style={styles.mealDishText}>{day.meals.lunch.name}</Text>
                            </View>
                            <View style={styles.mealRowDivider} />
                            <View style={styles.mealTableRow}>
                              <Text style={styles.mealTypeText}>Dinner</Text>
                              <View style={styles.mealColumnDivider} />
                              <Text style={styles.mealDishText}>{day.meals.dinner.name}</Text>
                            </View>
                          </View>
                          {message.mealPlan && index < message.mealPlan.days.length - 1 && (
                            <View style={styles.dayDivider} />
                          )}
                        </View>
                      ))}
                      <TouchableOpacity style={styles.mealPlanButton} onPress={() => applyMealPlan()}>
                        <Text style={styles.mealPlanButtonText}>Save Plan</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Input Area */}
          <View style={[styles.inputContainer, { marginBottom: -50, paddingBottom: 62 }]}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#A79E9E"
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (inputText.trim() === '' || isLoading) ? styles.sendButtonDisabled : {}
              ]} 
              onPress={handleSend}
              disabled={inputText.trim() === '' || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: 'white',
    
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    marginTop: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 16,

  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: '#624BF5',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
    marginTop: 15,
    
  },
  aiBubble: {
    backgroundColor: '#F2F4F9',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginLeft: 5,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#333',
  },
  mealPlanContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 10,
  },
  dayRow: {
    marginBottom: 10,
  },
  dayText: {
    fontWeight: 'bold',
    fontSize: 19,
    marginBottom: 8,
    color: '#624BF5',
  },
  mealsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  mealTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  mealTypeText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#333',
    width: 70,
  },
  mealColumnDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    height: '100%',
    marginHorizontal: 8,
  },
  mealDishText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  mealRowDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    width: '100%',
  },
  dayDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 10,
  },
  mealPlanButton: {
    width: 110,
    height: 35,
    backgroundColor: '#624BF5',
    borderRadius: 103,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  mealPlanButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F4F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#624BF5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#A79E9E',
  },
});
