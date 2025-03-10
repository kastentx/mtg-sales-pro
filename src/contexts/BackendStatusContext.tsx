import React, { createContext, useContext, useState, useCallback } from 'react';
import { API_CONFIG } from '../config/api';
import { toaster } from '../components/ui/toaster';

interface BackendStatusContextType {
  isConnected: boolean;
  checkStatus: () => Promise<void>;
}

const BackendStatusContext = createContext<BackendStatusContextType | undefined>(undefined);

export const BackendStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.status}`);
      const newStatus = response.ok;
      setIsConnected(newStatus);
      
      toaster.create({
        title: `Connected to backend @ ${API_CONFIG.baseUrl}`,
        type: 'success',
        meta: { closable: true },
      });
    } catch (error) {
      setIsConnected(false);
      toaster.create({
        title: 'Backend connection failed',
        type: 'failure',
        meta: { closable: true },
      });
    }
  }, []);

  // Check status when provider mounts
  React.useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return (
    <BackendStatusContext.Provider value={{ isConnected, checkStatus }}>
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = () => {
  const context = useContext(BackendStatusContext);
  if (!context) {
    throw new Error('useBackendStatus must be used within a BackendStatusProvider');
  }
  return context;
};
