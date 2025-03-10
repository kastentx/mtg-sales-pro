import { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';

export const useBackendStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_CONFIG.baseUrl}/status`);
        setIsConnected(response.ok);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { isConnected };
};
