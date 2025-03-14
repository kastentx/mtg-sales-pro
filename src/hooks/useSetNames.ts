import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

interface SetInfo {
  name: string;
  code: string;
  keyruneCode: string;
}

export function useSetNames() {
  const [sets, setSets] = useState<SetInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sets}`)
      .then(res => res.json())
      .then((data: SetInfo[]) => {
        setSets(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  return { sets, isLoading, error };
}
