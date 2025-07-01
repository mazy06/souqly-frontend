import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { MaintenanceProvider, useMaintenance } from './contexts/MaintenanceContext';
import { setMaintenanceCallback } from './services/ApiService';
import { useMaintenanceHandler } from './hooks/useMaintenanceHandler';
import AppNavigator from './navigation/AppNavigator';
import MaintenanceScreen from './screens/MaintenanceScreen';

function AppContent() {
  const { isMaintenanceMode, maintenanceError, clearMaintenanceMode } = useMaintenance();
  const { handleMaintenanceError } = useMaintenanceHandler();

  // Enregistrer le callback de maintenance dans ApiService
  React.useEffect(() => {
    setMaintenanceCallback((isMaintenance, error) => {
      if (isMaintenance && error) {
        handleMaintenanceError(new Error(error));
      }
    });
  }, [handleMaintenanceError]);

  if (isMaintenanceMode) {
    return (
      <MaintenanceScreen 
        error={maintenanceError || undefined}
        onRetry={clearMaintenanceMode}
      />
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <MaintenanceProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </MaintenanceProvider>
  );
} 