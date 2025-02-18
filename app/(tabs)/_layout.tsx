import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform, Pressable } from 'react-native';
import { useState } from 'react';
import Voice from '@react-native-voice/voice';

export default function TabLayout() {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = async () => {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
      } else {
        await Voice.start('fr-FR');
        setIsListening(true);
      }
    } catch (e) {
      console.error('Error toggling voice recognition:', e);
      setIsListening(false);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1b2e',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#7b5ee6',
        tabBarInactiveTintColor: '#666',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ size, color }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="chatbubble-ellipses" size={size} color={color} />
              {Platform.OS !== 'web' && (
                <Pressable onPress={toggleListening}>
                  <Ionicons 
                    name={isListening ? "mic" : "mic-outline"}
                    size={size} 
                    color={isListening ? "#7b5ee6" : color} 
                    style={{ marginLeft: 8 }}
                  />
                </Pressable>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}