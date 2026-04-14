import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { ChatBubble } from '@/components/ChatBubble';
import { TypingIndicator } from '@/components/TypingIndicator';
import { SuggestedChips } from '@/components/SuggestedChips';
import { sendChatMessage } from '@/services/openaiApi';
import { SUGGESTED_PROMPTS } from '@/constants/config';
import type { ChatMessage } from '@/types/chat';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Jai Jinendra! I\'m Dhambot, your spiritual companion. Ask me anything about Jain philosophy, temples, practices, or festivals.',
  timestamp: Date.now(),
};

export default function AIGuideScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const allMessages = [...messages, userMessage].filter((m) => m.id !== 'welcome');
      const response = await sendChatMessage(allMessages);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'Dhambot is unavailable right now, please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const showSuggestions = messages.length <= 1;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <View style={[styles.headerIcon, { backgroundColor: colors.accent + '15' }]}>
          <Ionicons name="diamond" size={20} color={colors.accent} />
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Dhambot</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            AI Spiritual Guide
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      {/* Suggested prompts */}
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <SuggestedChips chips={SUGGESTED_PROMPTS} onPress={sendMessage} />
        </View>
      )}

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          placeholder="Ask Dhambot..."
          placeholderTextColor={colors.muted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => sendMessage(inputText)}
          returnKeyType="send"
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.4 }]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim() || isTyping}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Geist_700Bold',
    fontSize: 18,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Variable',
    fontSize: 12,
  },
  messageList: {
    paddingVertical: 12,
    paddingBottom: 8,
  },
  suggestionsContainer: {
    paddingVertical: 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Variable',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D97757',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
});
