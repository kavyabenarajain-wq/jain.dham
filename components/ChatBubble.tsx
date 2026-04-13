import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { ChatMessage } from '@/types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const colors = useThemeColors();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowRight]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.accent + '20' }]}>
          <Ionicons name="diamond" size={16} color={colors.accent} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.chatBubbleUser }
            : { backgroundColor: colors.chatBubbleBot },
          isUser ? styles.bubbleRight : styles.bubbleLeft,
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: isUser ? colors.chatTextUser : colors.chatTextBot },
          ]}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    marginHorizontal: 12,
    gap: 8,
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleLeft: {
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    borderBottomRightRadius: 4,
  },
  text: {
    fontFamily: 'Inter-Variable',
    fontSize: 15,
    lineHeight: 22,
  },
});
