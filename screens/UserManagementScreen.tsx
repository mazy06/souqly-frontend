import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

type ProfileStackParamList = {
  ProfileMain: undefined;
  UserManagement: undefined;
};

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'banned';
  joinDate: string;
  lastActivity: string;
  productsCount: number;
  rating: number;
}

const UserManagementScreen = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { colors } = useTheme();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin' | 'moderator'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Mock data - à remplacer par un vrai appel API
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Marie Dupont',
          email: 'marie.dupont@email.com',
          role: 'user',
          status: 'active',
          joinDate: '2024-01-15',
          lastActivity: '2024-12-20',
          productsCount: 12,
          rating: 4.8
        },
        {
          id: '2',
          name: 'Jean Martin',
          email: 'jean.martin@email.com',
          role: 'user',
          status: 'suspended',
          joinDate: '2023-11-20',
          lastActivity: '2024-12-18',
          productsCount: 5,
          rating: 3.2
        },
        {
          id: '3',
          name: 'Sophie Bernard',
          email: 'sophie.bernard@email.com',
          role: 'moderator',
          status: 'active',
          joinDate: '2023-08-10',
          lastActivity: '2024-12-21',
          productsCount: 0,
          rating: 5.0
        },
        {
          id: '4',
          name: 'Pierre Dubois',
          email: 'pierre.dubois@email.com',
          role: 'user',
          status: 'banned',
          joinDate: '2024-03-05',
          lastActivity: '2024-12-10',
          productsCount: 8,
          rating: 2.1
        },
        {
          id: '5',
          name: 'Admin Principal',
          email: 'admin@souqly.com',
          role: 'admin',
          status: 'active',
          joinDate: '2023-01-01',
          lastActivity: '2024-12-21',
          productsCount: 0,
          rating: 5.0
        }
      ];
      
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleUserAction = (user: User, action: 'suspend' | 'ban' | 'activate' | 'promote' | 'demote') => {
    const actionText = {
      suspend: 'suspendre',
      ban: 'bannir',
      activate: 'réactiver',
      promote: 'promouvoir',
      demote: 'rétrograder'
    };

    Alert.alert(
      'Confirmation',
      `Voulez-vous ${actionText[action]} l'utilisateur ${user.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: () => {
            // Ici on appellerait l'API pour effectuer l'action
            Alert.alert('Succès', `Utilisateur ${actionText[action]} avec succès`);
            loadUsers(); // Recharger les données
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'suspended': return '#FF9800';
      case 'banned': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#E91E63';
      case 'moderator': return '#9C27B0';
      case 'user': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedUser(item);
        setShowUserModal(true);
      }}
    >
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
        </View>
        <View style={styles.userStats}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.userDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            Inscrit le {new Date(item.joinDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.productsCount} produits
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="star-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.rating}/5
          </Text>
        </View>
      </View>
      
      <View style={styles.userActions}>
        {item.status === 'active' ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
              onPress={() => handleUserAction(item, 'suspend')}
            >
              <Ionicons name="pause-outline" size={16} color="white" />
              <Text style={styles.actionButtonText}>Suspendre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={() => handleUserAction(item, 'ban')}
            >
              <Ionicons name="ban-outline" size={16} color="white" />
              <Text style={styles.actionButtonText}>Bannir</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleUserAction(item, 'activate')}
          >
            <Ionicons name="checkmark-outline" size={16} color="white" />
            <Text style={styles.actionButtonText}>Réactiver</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Gestion des Utilisateurs
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInput, { backgroundColor: colors.card }]}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchTextInput, { color: colors.text }]}
              placeholder="Rechercher un utilisateur..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'all' && { backgroundColor: colors.primary }]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'all' && { color: 'white' }]}>
              Tous ({users.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'active' && { backgroundColor: colors.primary }]}
            onPress={() => setFilterStatus('active')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'active' && { color: 'white' }]}>
              Actifs ({users.filter(u => u.status === 'active').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'suspended' && { backgroundColor: colors.primary }]}
            onPress={() => setFilterStatus('suspended')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'suspended' && { color: 'white' }]}>
              Suspendus ({users.filter(u => u.status === 'suspended').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'banned' && { backgroundColor: colors.primary }]}
            onPress={() => setFilterStatus('banned')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'banned' && { color: 'white' }]}>
              Bannis ({users.filter(u => u.status === 'banned').length})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Users List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Chargement des utilisateurs...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {/* User Detail Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Détails de l'utilisateur
                  </Text>
                  <TouchableOpacity onPress={() => setShowUserModal(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody}>
                  <View style={styles.userDetailSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations</Text>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Nom:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedUser.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedUser.email}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Rôle:</Text>
                      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(selectedUser.role) }]}>
                        <Text style={styles.roleText}>{selectedUser.role}</Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Statut:</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedUser.status) }]}>
                        <Text style={styles.statusText}>{selectedUser.status}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.userDetailSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques</Text>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Produits:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedUser.productsCount}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Note:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedUser.rating}/5</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Inscription:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {new Date(selectedUser.joinDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Dernière activité:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {new Date(selectedUser.lastActivity).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 100,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchTextInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  userStats: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  userDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
  },
  userDetailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '400',
  },
});

export default UserManagementScreen; 