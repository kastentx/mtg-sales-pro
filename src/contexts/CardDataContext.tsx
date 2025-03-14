import { createContext, useContext, useState, ReactNode } from 'react';
import { SetList, CardSet } from '../types';
import { API_CONFIG } from '@/config/api'; 
import { SetOption } from '../pages/Browser';

interface CardDataContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selectedSets: SetOption[];
  setSelectedSets: (sets: SetOption[]) => void;
  loadedSetData: SetList[];
  setLoadedSetData: (sets: SetList[]) => void;
  loadedCardData: CardSet[];
  setLoadedCardData: (cards: CardSet[]) => void;
  fetchCardsByUuids: (uuids: string[]) => Promise<any[]>;
}

const CardDataContext = createContext<CardDataContextType | undefined>(undefined);

export const useCardData = () => {
  const context = useContext(CardDataContext);
  if (context === undefined) {
    throw new Error('useCardData must be used within a CardDataProvider');
  }
  return context;
};

interface CardDataProviderProps {
  children: ReactNode;
}

export const CardDataProviderComponent = ({ children }: CardDataProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSets, setSelectedSets] = useState<SetOption[]>([]);
  const [loadedSetData, setLoadedSetData] = useState<SetList[]>([]);
  const [loadedCardData, setLoadedCardData] = useState<CardSet[]>([]);

  // Function to fetch card data from backend by UUIDs
  const fetchCardsByUuids = async (uuids: string[]) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.cards}/uuid/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuids }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch card data: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching card data:', error);
      throw error;
    }
  };

  return (
    <CardDataContext.Provider
      value={{
        isLoading,
        setIsLoading,
        selectedSets,
        setSelectedSets,
        loadedSetData,
        setLoadedSetData,
        loadedCardData,
        setLoadedCardData,
        fetchCardsByUuids,
      }}
    >
      {children}
    </CardDataContext.Provider>
  );
};

export { CardDataContext };
