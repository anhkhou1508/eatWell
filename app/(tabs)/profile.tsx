import { View, Text, StyleSheet, Image, Pressable, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { AntDesign, FontAwesome, MaterialIcons, Ionicons, Feather, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Profile() {
  const userName = "Anh Khoi Nguyen"; // Replace with actual user name from your data source
  const [streakCount, setStreakCount] = useState(7); // Example streak count
  
  const navigateToComingSoon = () => {
    router.push('/comingSoonFeature');
  };
  
  return (
    <ScrollView style={{flex: 1, backgroundColor: '#FBFBFB'}}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../../assets/images/avatar.png')} // Replace with actual avatar image
              style={styles.avatar}
              defaultSource={require('../../assets/images/avatar.png')}
            />
            <Pressable style={styles.editAvatarButton}>
              <AntDesign name="camera" size={16} color="white" />
            </Pressable>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streakCount}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
              <Ionicons name="flame" size={18} color="#FF9500" style={styles.statIcon} />
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Achievements</Text>
              <MaterialIcons name="emoji-events" size={18} color="#624BF5" style={styles.statIcon} />
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Goal Progress</Text>
              <Ionicons name="trending-up" size={18} color="#34C759" style={styles.statIcon} />
            </View>
          </View>
        </View>
        
        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <Pressable style={styles.optionItem} onPress={navigateToComingSoon}>
            <AntDesign name="user" size={20} color="#73767B" />
            <Text style={styles.optionText}>Edit Profile</Text>
            <AntDesign name="right" size={16} color="#73767B" style={styles.chevron} />
          </Pressable>
          
          <Pressable style={styles.optionItem} onPress={navigateToComingSoon}>
            <FontAwesome name="bullseye" size={20} color="#73767B" />
            <Text style={styles.optionText}>Goals</Text>
            <AntDesign name="right" size={16} color="#73767B" style={styles.chevron} />
          </Pressable>
          
          <Pressable style={styles.optionItem} onPress={navigateToComingSoon}>
            <MaterialIcons name="restaurant" size={20} color="#73767B" />
            <Text style={styles.optionText}>Nutrition</Text>
            <AntDesign name="right" size={16} color="#73767B" style={styles.chevron} />
          </Pressable>
          
          <Pressable style={styles.optionItem} onPress={navigateToComingSoon}>
            <Ionicons name="trending-up" size={20} color="#73767B" />
            <Text style={styles.optionText}>Progress</Text>
            <AntDesign name="right" size={16} color="#73767B" style={styles.chevron} />
          </Pressable>
          
          <Pressable style={styles.optionItem} onPress={navigateToComingSoon}>
            <MaterialIcons name="favorite-border" size={20} color="#73767B" />
            <Text style={styles.optionText}>Favorite Meals</Text>
            <AntDesign name="right" size={16} color="#73767B" style={styles.chevron} />
          </Pressable>
          
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <Pressable style={styles.optionItem} onPress={navigateToComingSoon}>
            <Ionicons name="notifications-outline" size={20} color="#73767B" />
            <Text style={styles.optionText}>Notifications</Text>
            <AntDesign name="right" size={16} color="#73767B" style={styles.chevron} />
          </Pressable>
          
          <Pressable style={styles.optionItem} onPress={navigateToComingSoon}>
            <MaterialCommunityIcons name="theme-light-dark" size={20} color="#73767B" />
            <Text style={styles.optionText}>Appearance</Text>
            <AntDesign name="right" size={16} color="#73767B" style={styles.chevron} />
          </Pressable>
          
          <Pressable style={styles.optionItem} onPress={navigateToComingSoon}>
            <Entypo name="help-with-circle" size={20} color="#73767B" />
            <Text style={styles.optionText}>Help & Support</Text>
            <AntDesign name="right" size={16} color="#73767B" style={styles.chevron} />
          </Pressable>
          
          <Pressable style={styles.optionItem} onPress={navigateToComingSoon}>
            <Feather name="log-out" size={20} color="#73767B" />
            <Text style={styles.optionText}>Log Out</Text>
            <AntDesign name="right" size={16} color="#73767B" style={styles.chevron} />
          </Pressable>
          
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FBFBFB',
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 75,
    paddingBottom: 20,
    backgroundColor: '#624BF5',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: '#E1E1E1', // Placeholder color if image fails to load
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#624BF5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: -52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    paddingTop: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#73767B',
    marginTop: 4,
  },
  statIcon: {
    position: 'absolute',
    top: -5,
    right: 20,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    marginTop: 15,
    marginBottom: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    height: 57,
    borderRadius: 13,
    paddingHorizontal: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#73767B',
    fontWeight: 'bold',
  },
  chevron: {
    marginLeft: 'auto',
  },
  versionText: {
    marginTop: 20,
    fontSize: 12,
    color: '#999',
  }
});
