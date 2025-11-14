import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SimpleIcons from '../icons/SimpleIcons';
import colors from '../../assets/Theme/colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const ChatInputModal = ({
  visible,
  onClose,
  inputText,
  onChangeText,
  onSend,
  sending,
  placeholder = "Γράψτε ένα μήνυμα...",
}) => {
  const inputRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();

      // Auto-focus input after a tiny delay to ensure modal is mounted
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Slide down animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0], // Slide from bottom
  });

  const handleSend = () => {
    onSend();
    // Don't close modal - let parent handle it after successful send
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
            },
          ]}
          onStartShouldSetResponder={() => true} // Prevent backdrop touch from propagating
        >
          <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoid}
            >
              {/* Handle bar at top */}
              <View style={styles.handleBar} />

              {/* Empty space in middle - can add suggestions, emojis, etc. later */}
              <View style={{ flex: 1 }} />

              {/* Input Section at bottom */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.textInput}
                  placeholder={placeholder}
                  placeholderTextColor={colors.Text.secondary}
                  value={inputText}
                  onChangeText={onChangeText}
                  multiline
                  textAlignVertical="center"
                  maxLength={1000}
                />
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={inputText.trim() === "" || sending}
                  style={[
                    styles.sendButton,
                    {
                      backgroundColor:
                        inputText.trim() !== "" && !sending
                          ? colors.Main[500]
                          : colors.Border.light,
                    },
                  ]}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <SimpleIcons
                      name="send"
                      size={20}
                      color={
                        inputText.trim() !== "" ? "white" : colors.Text.secondary
                      }
                    />
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.65, // At least half screen height
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  safeArea: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.1,
  },
  keyboardAvoid: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.Border?.light || '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
    marginRight: 8,
    backgroundColor: colors.Background?.primary || '#f9fafb',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatInputModal;
