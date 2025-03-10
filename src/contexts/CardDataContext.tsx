import { createContext, useContext, useState, ReactNode } from 'react';
import { AllPrintingsFile } from '../types';
import { SetOption } from '../pages/Browser';

interface CardDataContextType {
  cardData: AllPrintingsFile | null;
  isLoading: boolean;
  lastModified: Date | null;  // Changed from lastChecked to lastModified
  refreshData: () => Promise<void>;
  selectedSets: SetOption[];
  setSelectedSets: (sets: SetOption[]) => void;
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
  const [cardData, setCardData] = useState<AllPrintingsFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [selectedSets, setSelectedSets] = useState<SetOption[]>([]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Implement data fetching logic here
      // For now, this is a placeholder
      setIsLoading(false);
      setLastModified(new Date());
    } catch (error) {
      console.error('Error refreshing card data:', error);
      setIsLoading(false);
    }
  };

  return (
    <CardDataContext.Provider
      value={{
        cardData,
        isLoading,
        lastModified,
        refreshData,
        selectedSets,
        setSelectedSets,
      }}
    >
      {children}
    </CardDataContext.Provider>
  );
};

export { CardDataContext };
