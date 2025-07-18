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
        { 
          backgroundColor: cardBg, 
          shadowColor: colors.text + '15', 
          borderColor: colors.border + '20',
        },
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
                { backgroundColor: colors.primary + '15' },
                hasUnread && { borderColor: colors.primary, borderWidth: 2 },
                { justifyContent: 'center', alignItems: 'center' },
              ]}
            >
              <Ionicons name="person" size={18} color={colors.primary} />
            </View>
          )}
          {hasUnread && (
            <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />
          )}
        </View>
        <View style={styles.infoWrapper}>
          <View style={styles.topRow}>
            <Text 
              style={[
                styles.name, 
                { color: colors.text },
                hasUnread && { fontWeight: '700' }
              ]} 
              numberOfLines={1}
            >
              {name}
            </Text>
            <Text style={[styles.time, { color: colors.tabIconDefault }]}>{time}</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text 
              style={[
                styles.lastMessage, 
                { color: hasUnread ? colors.text : colors.tabIconDefault },
                hasUnread && { fontWeight: '500' }
              ]} 
              numberOfLines={1}
            >
              {lastMessage}
            </Text>
            {hasUnread && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#fff',
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
    fontWeight: '600',
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 11,
    minWidth: 40,
    textAlign: 'right',
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  lastMessage: {
    fontSize: 13,
    flex: 1,
    lineHeight: 16,
  },
  unreadBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 6,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ConversationItem; 