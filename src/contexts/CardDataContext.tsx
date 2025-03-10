import { createContext, useContext, useState, ReactNode } from 'react';
import { Set } from '../types';
import { SetOption } from '../pages/Browser';

interface CardDataContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selectedSets: SetOption[];
  setSelectedSets: (sets: SetOption[]) => void;
  loadedSetData: Set[];
  setLoadedSetData: (sets: Set[]) => void;
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
  const [loadedSetData, setLoadedSetData] = useState<Set[]>([]);

  return (
    <CardDataContext.Provider
      value={{
        isLoading,
        setIsLoading,
        selectedSets,
        setSelectedSets,
        loadedSetData,
        setLoadedSetData,
      }}
    >
      {children}
    </CardDataContext.Provider>
  );
};

export { CardDataContext };
