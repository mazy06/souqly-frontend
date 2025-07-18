import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import SearchService, { Suggestion } from '../services/SearchService';

interface EnhancedSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onPressCamera?: () => void;
  onSubmit?: () => void;
  onSuggestionPress?: (suggestion: Suggestion) => void;
  placeholder?: string;
  showSuggestions?: boolean;
}

export default function EnhancedSearchBar({
  value,
  onChangeText,
  onPressCamera,
  onSubmit,
  onSuggestionPress,
  placeholder = "Rechercher un article ou un membre",
  showSuggestions = true,
}: EnhancedSearchBarProps) {
  const { colors, isDark } = useTheme();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value.trim().length >= 2 && showSuggestions) {
      // Délai pour éviter trop de requêtes
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(async () => {
        try {
          setLoading(true);
          const results = await SearchService.getSuggestions(value.trim(), 5);
          setSuggestions(results);
          setShowSuggestionsList(true);
        } catch (error) {
          console.error('Erreur lors de la récupération des suggestions:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestionsList(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [value, showSuggestions]);

  const handleTextChange = (text: string) => {
    onChangeText(text);
    if (text.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestionsList(false);
    }
  };

  const handleSuggestionPress = (suggestion: Suggestion) => {
    onChangeText(suggestion.title);
    setShowSuggestionsList(false);
    if (onSuggestionPress) {
      onSuggestionPress(suggestion);
    }
  };

  const renderSuggestion = ({ item }: { item: Suggestion }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSuggestionPress(item)}
    >
      <View style={styles.suggestionContent}>
        <Text style={[styles.suggestionTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.brand && (
          <Text style={[styles.suggestionBrand, { color: colors.textSecondary }]}>
            {item.brand}
          </Text>
        )}
        {item.categoryName && (
          <Text style={[styles.suggestionCategory, { color: colors.textSecondary }]}>
            {item.categoryName}
          </Text>
        )}
      </View>
      <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[
        styles.searchBar, 
        { 
          backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
          borderColor: colors.border + '40',
          shadowColor: colors.text + '15',
        }
      ]}>
        <Ionicons name="search" size={20} color={colors.tabIconDefault} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.tabIconDefault}
          value={value}
          onChangeText={handleTextChange}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
        />
        {loading && (
          <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIcon} />
        )}
        {onPressCamera && (
          <TouchableOpacity onPress={onPressCamera} style={styles.cameraButton}>
            <Ionicons name="camera-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestionsList && suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 0,
    marginBottom: 10,
    height: 48,
    flex: 1,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  loadingIcon: {
    marginLeft: 8,
  },
  cameraButton: {
    marginLeft: 8,
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 54,
    left: 8,
    right: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionsList: {
    borderRadius: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionBrand: {
    fontSize: 14,
    marginBottom: 1,
  },
  suggestionCategory: {
    fontSize: 12,
  },
}); 