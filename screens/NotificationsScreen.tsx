import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import NotificationService, { Notification } from '../services/NotificationService';

// Données mockées pour les notifications (fallback)
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Nouvelle offre reçue',
    message: 'Jean Dupont vous a fait une offre de 150€ pour votre iPhone',
    type: 'info',
    timestamp: 'Il y a 2h',
    isRead: false,
    productId: 123,
  },
  {
    id: '2',
    title: 'Message non lu',
    message: 'Vous avez 3 messages non lus de Sophie Martin',
    type: 'warning',
    timestamp: 'Il y a 4h',
    isRead: false,
    conversationId: 'conv_456',
  },
  {
    id: '3',
    title: 'Produit vendu',
    message: 'Félicitations ! Votre Nike Air Max a été vendue',
    type: 'success',
    timestamp: 'Hier',
    isRead: true,
    productId: 789,
  },
  {
    id: '4',
    title: 'Annonce expirée',
    message: 'Votre annonce "Samsung Galaxy" a expiré',
    type: 'error',
    timestamp: 'Il y a 2 jours',
    isRead: true,
    productId: 456,
  },
];

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Pour l'instant, on utilise directement les données mockées
      console.log('[NotificationsScreen] Chargement des notifications mockées');
      setNotifications(MOCK_NOTIFICATIONS);
      
      // TODO: Décommenter quand l'API sera disponible
      // const notificationsData = await NotificationService.getNotifications();
      // setNotifications(notificationsData.length > 0 ? notificationsData : MOCK_NOTIFICATIONS);
    } catch (error) {
      console.error('[NotificationsScreen] Erreur lors du chargement:', error);
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      // Pour l'instant, on marque comme lu localement
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      console.log(`[NotificationsScreen] Notification ${notificationId} marquée comme lue (local)`);
      
      // TODO: Décommenter quand l'API sera disponible
      // await NotificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('[NotificationsScreen] Erreur lors du marquage comme lu:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return 'information-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'success':
        return 'checkmark-circle-outline';
      case 'error':
        return 'close-circle-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'info':
        return '#007AFF';
      case 'warning':
        return '#FF9500';
      case 'success':
        return '#34C759';
      case 'error':
        return '#FF3B30';
      default:
        return colors.primary;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        { 
          backgroundColor: colors.card,
          borderColor: colors.border + '20',
          opacity: item.isRead ? 0.7 : 1,
        }
      ]}
      onPress={() => {
        markAsRead(item.id);
        // Navigation vers le produit ou la conversation si nécessaire
        if (item.productId) {
          // navigation.navigate('ProductDetail', { productId: item.productId });
        } else if (item.conversationId) {
          // navigation.navigate('Conversation', { conversationId: item.conversationId });
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getNotificationIcon(item.type) as any} 
            size={20} 
            color={getNotificationColor(item.type)} 
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.notificationMessage, { color: colors.tabIconDefault }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.notificationTime, { color: colors.tabIconDefault }]}>
            {item.timestamp}
          </Text>
        </View>
        {!item.isRead && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top','left','right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Liste des notifications */}
      {loading ? (
        <View style={styles.loadingContainer}>
          {[1,2,3].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.skeletonCard, 
                { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border + '20',
                }
              ]}
            > 
              <View style={styles.skeletonHeader}>
                <View style={[styles.skeletonIcon, { backgroundColor: colors.border + '40' }]} />
                <View style={styles.skeletonContent}>
                  <View style={[styles.skeletonLine, { width: '80%', backgroundColor: colors.border + '40' }]} />
                  <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.border + '40', marginTop: 8 }]} />
                  <View style={[styles.skeletonLine, { width: '40%', backgroundColor: colors.border + '40', marginTop: 8 }]} />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.tabIconDefault} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Aucune notification</Text>
              <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
                Vous recevrez des notifications pour les nouvelles offres, messages et activités importantes.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  notificationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  skeletonCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
}); 