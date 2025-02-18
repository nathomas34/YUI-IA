import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withSequence,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'ai'}>>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  const fairyStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` }
      ],
    };
  });

  const animateFairy = () => {
    // Correction de l'utilisation d'Easing
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, {
          duration: 1000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withTiming(0, {
          duration: 1000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      ),
      -1,
      true
    );

    rotate.value = withRepeat(
      withSequence(
        withTiming(-5, {
          duration: 2000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withTiming(5, {
          duration: 2000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      ),
      -1,
      true
    );

    scale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );

    translateX.value = withSequence(
      withTiming(Math.random() * 20 - 10, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      withTiming(0, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
  };

  useEffect(() => {
    animateFairy();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeVoice = async () => {
      try {
        if (Platform.OS === 'web') {
          setIsVoiceAvailable(false);
          return;
        }

        await Voice.destroy();
        await Voice.removeAllListeners();

        const isAvailable = await Voice.isAvailable();
        if (isMounted) {
          setIsVoiceAvailable(isAvailable);
        }

        if (!isAvailable) {
          console.log('Voice recognition is not available');
          return;
        }

        Voice.onSpeechStart = () => {
          if (isMounted) {
            setIsListening(true);
            animateFairy();
          }
        };

        Voice.onSpeechEnd = () => {
          if (isMounted) {
            setIsListening(false);
          }
        };

        Voice.onSpeechResults = (e: SpeechResultsEvent) => {
          if (isMounted && e.value) {
            const transcript = e.value[0].toLowerCase();
            setMessages(prev => [...prev, { text: transcript, sender: 'user' }]);
            
            if (transcript.includes('yui')) {
              animateFairy();
              setTimeout(() => {
                if (isMounted) {
                  setMessages(prev => [...prev, {
                    text: "Je suis là ! Comment puis-je t'aider ? ✨",
                    sender: 'ai'
                  }]);
                }
              }, 500);
            }
          }
        };

        Voice.onSpeechError = (e: any) => {
          if (isMounted) {
            console.error('Voice recognition error:', e);
            setIsListening(false);
          }
        };
      } catch (e) {
        console.error('Error setting up voice recognition:', e);
        if (isMounted) {
          setIsVoiceAvailable(false);
        }
      }
    };

    initializeVoice();

    return () => {
      isMounted = false;
      if (Platform.OS !== 'web') {
        Voice.destroy().then(Voice.removeAllListeners);
      }
    };
  }, []);

  const toggleListening = async () => {
    if (!isVoiceAvailable) return;

    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
      } else {
        await Voice.start('fr-FR');
        setIsListening(true);
        animateFairy();
      }
    } catch (e) {
      console.error('Error toggling voice recognition:', e);
      setIsListening(false);
    }
  };

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessages = [...messages, { text: inputText, sender: 'user' as const }];
      setMessages(newMessages);
      setInputText('');
      
      setTimeout(() => {
        animateFairy();
        setMessages([...newMessages, {
          text: getAIResponse(inputText),
          sender: 'ai' as const
        }]);
      }, 500);
    }
  };

  const getAIResponse = (input: string) => {
    const responses = [
      "Je suis là pour t'aider ! ✨",
      "Intéressant ! Dis m'en plus... 🌟",
      "Je comprends ce que tu veux dire. ✨",
      "Je peux t'aider avec ça ! 🌟",
      "Laisse-moi réfléchir un instant... ✨"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1b2e', '#2a2b4e']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Yui AI Assistant</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          <View style={styles.pixieContainer}>
            <Animated.View style={[styles.pixieWrapper, fairyStyle]}>
              <View style={styles.pixieAvatar}>
                <Text style={styles.pixieEmoji}>🧚‍♀️</Text>
              </View>
            </Animated.View>
            <Text style={styles.welcomeText}>
              Bonjour ! Je suis Yui, ta fée assistante. {Platform.OS !== 'web' ? "Parle-moi ou écris-moi !" : "Écris-moi un message !"}
            </Text>
          </View>

          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageWrapper,
                message.sender === 'user' ? styles.userMessage : styles.aiMessage
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Écris ton message ici..."
            placeholderTextColor="#666"
            multiline
          />
          <View style={styles.buttonContainer}>
            {Platform.OS !== 'web' && isVoiceAvailable && (
              <Pressable 
                onPress={toggleListening} 
                style={[styles.iconButton, isListening && styles.listeningButton]}
              >
                <Ionicons 
                  name={isListening ? "mic" : "mic-outline"}
                  size={24} 
                  color={isListening ? "#fff" : "#7b5ee6"}
                />
              </Pressable>
            )}
            <Pressable onPress={handleSend} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Envoyer</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  pixieContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pixieWrapper: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  pixieAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#7b5ee6',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7b5ee6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  pixieEmoji: {
    fontSize: 30,
  },
  welcomeText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageWrapper: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#7b5ee6',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2d2e4a',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  inputContainer: {
    padding: 15,
    backgroundColor: '#2a2b4e',
  },
  input: {
    backgroundColor: '#1a1b2e',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#1a1b2e',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  listeningButton: {
    backgroundColor: '#7b5ee6',
  },
  sendButton: {
    backgroundColor: '#7b5ee6',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});