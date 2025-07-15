import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LoaderContextType {
  showLoader: () => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {/* {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#00BFA6" />
        </View>
      )} */}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) throw new Error('useLoader must be used within a LoaderProvider');
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
}); 