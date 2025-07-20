import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
import UserService, { User, UserFilters } from '../services/UserService';
import FilterChips, { FilterOption } from '../components/FilterChips';

type ProfileStackParamList = {
  ProfileMain: undefined;
  UserManagement: undefined;
};



const UserManagementScreen = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { colors } = useTheme();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin' | 'moderator'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filterStatus, filterRole]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const filters: UserFilters = {
        status: filterStatus !== 'all' ? filterStatus.toUpperCase() as any : undefined,
        role: filterRole !== 'all' ? filterRole.toUpperCase() as any : undefined,
        page: 0,
        size: 50
      };

      const response = await UserService.getUsers(filters);
      setUsers(response.content || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = (users || []).filter(user => {
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus.toUpperCase();
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole;
    
    return matchesStatus && matchesRole;
  });

  const handleUserAction = async (user: User, action: 'suspend' | 'ban' | 'activate' | 'promote' | 'demote') => {
    const actionText = {
      suspend: 'suspendre',
      ban: 'bannir',
      activate: 'réactiver',
      promote: 'promouvoir',
      demote: 'rétrograder'
    };

    const fullName = `${user.firstName} ${user.lastName}`;

    Alert.alert(
      'Confirmation',
      `Voulez-vous ${actionText[action]} l'utilisateur ${fullName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: async () => {
            try {
              await UserService.performUserAction(user.id, { action });
              Alert.alert('Succès', `Utilisateur ${actionText[action]} avec succès`);
              loadUsers(); // Recharger les données
            } catch (error) {
              console.error('Erreur lors de l\'action sur l\'utilisateur:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de l\'action');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#4CAF50';
      case 'suspended': return '#FF9800';
      case 'banned': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
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
          <Text style={[styles.userName, { color: colors.text }]}>{`${item.firstName} ${item.lastName}`}</Text>
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
            Inscrit le {new Date(item.createdAt).toLocaleDateString()}
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
        {item.status === 'ACTIVE' ? (
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


        {/* Status Filters */}
        <View style={styles.filtersWrapper}>
          <FilterChips
            filters={[
              { key: 'all', label: 'Tous', count: filteredUsers.length },
              { key: 'active', label: 'Actifs', count: (users || []).filter(u => u.status === 'ACTIVE').length },
              { key: 'suspended', label: 'Suspendus', count: (users || []).filter(u => u.status === 'SUSPENDED').length },
              { key: 'banned', label: 'Bannis', count: (users || []).filter(u => u.status === 'BANNED').length },
            ]}
            selectedFilter={filterStatus}
            onFilterSelect={(filterKey) => setFilterStatus(filterKey as any)}
            title="Filtrer par statut"
            showTitle={false}
          />

          {/* Role Filters */}
          <FilterChips
            filters={[
              { key: 'all', label: 'Tous les rôles' },
              { key: 'user', label: 'Utilisateurs', count: (users || []).filter(u => u.role === 'USER').length },
              { key: 'admin', label: 'Admins', count: (users || []).filter(u => u.role === 'ADMIN').length },
              { key: 'moderator', label: 'Modérateur', count: (users || []).filter(u => u.role === 'MODERATOR').length },
            ]}
            selectedFilter={filterRole}
            onFilterSelect={(filterKey) => setFilterRole(filterKey as any)}
            title="Filtrer par rôle"
            showTitle={false}
          />
        </View>

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
            keyExtractor={(item) => item.id.toString()}
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
                    <Text style={[styles.detailValue, { color: colors.text }]}>{`${selectedUser.firstName} ${selectedUser.lastName}`}</Text>
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
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {selectedUser.lastLoginAt && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Dernière connexion:</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>
                          {new Date(selectedUser.lastLoginAt).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
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
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'transparent',
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
    paddingHorizontal: 0,
  },
  filtersWrapper: {
    marginBottom: 4,
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