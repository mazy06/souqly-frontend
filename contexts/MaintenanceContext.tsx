import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  maintenanceError: string | null;
  setMaintenanceMode: (isMaintenance: boolean, error?: string) => void;
  clearMaintenanceMode: () => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);

  const setMaintenanceMode = (isMaintenance: boolean, error?: string) => {
    setIsMaintenanceMode(isMaintenance);
    setMaintenanceError(error || null);
  };

  const clearMaintenanceMode = () => {
    setIsMaintenanceMode(false);
    setMaintenanceError(null);
  };

  return (
    <MaintenanceContext.Provider value={{
      isMaintenanceMode,
      maintenanceError,
      setMaintenanceMode,
      clearMaintenanceMode,
    }}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}
