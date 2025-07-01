import { useCallback } from 'react';
import { useMaintenance } from '../contexts/MaintenanceContext';

export function useMaintenanceHandler() {
  const { setMaintenanceMode, clearMaintenanceMode } = useMaintenance();

  const handleMaintenanceError = useCallback((error: any) => {
    // Debug: afficher l'erreur reçue
    if (__DEV__) {
      console.log('🔍 MaintenanceHandler - Erreur reçue:', error);
      console.log('🔍 MaintenanceHandler - Type d\'erreur:', typeof error);
      console.log('🔍 MaintenanceHandler - Message:', error?.message);
    }

    // Vérifier si c'est une erreur de maintenance
    const isMaintenance = 
      error instanceof TypeError ||
      (error.message && /^Erreur HTTP: (500|502|503|504)$/.test(error.message)) ||
      (error.message && error.message.includes('NetworkError')) ||
      (error.message && error.message.includes('ERR_ABORTED')) ||
      (error.message && error.message.includes('ERR_CONNECTION_REFUSED')) ||
      (error.message && error.message.includes('Failed to fetch'));

    if (__DEV__) {
      console.log('🔍 MaintenanceHandler - Est-ce une erreur de maintenance?', isMaintenance);
    }

    if (isMaintenance) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (__DEV__) {
        console.log('🔍 MaintenanceHandler - Activation du mode maintenance avec:', errorMessage);
      }
      setMaintenanceMode(true, errorMessage);
      return true; // Indique que l'erreur a été gérée
    }

    return false; // L'erreur n'est pas une erreur de maintenance
  }, [setMaintenanceMode]);

  const retryConnection = useCallback(() => {
    clearMaintenanceMode();
    // Optionnel : relancer les requêtes en cours
  }, [clearMaintenanceMode]);

  return {
    handleMaintenanceError,
    retryConnection,
  };
}
