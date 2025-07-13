import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ConversationItemProps {
  avatarUrl?: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  onPress?: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  avatarUrl,
  name,
  lastMessage,
  time,
  unreadCount = 0,
  onPress,
}) => {
  const { colors, isDark } = useTheme();
  const hasUnread = unreadCount > 0;

  // Force le fond à blanc en light, #23242a en dark
  const cardBg = isDark ? '#23242a' : '#fff';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: cardBg, shadowColor: colors.text + '22', borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        <View style={styles.avatarWrapper}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={[
                styles.avatar,
                hasUnread && { borderColor: colors.primary, borderWidth: 2 },
              ]}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary + '22' },
                hasUnread && { borderColor: colors.primary, borderWidth: 2 },
                { justifyContent: 'center', alignItems: 'center' },
              ]}
            >
              <Ionicons name="person" size={22} color={colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.infoWrapper}>
          <View style={styles.topRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.time, { color: colors.tabIconDefault }]}>{time}</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={[styles.lastMessage, { color: colors.tabIconDefault }]} numberOfLines={1}>{lastMessage}</Text>
            {hasUnread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginRight: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    minWidth: 48,
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 15,
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
});

export default ConversationItem; 