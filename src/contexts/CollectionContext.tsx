import { createContext, useContext, useState, ReactNode } from 'react';
import { CardSet } from '../types';
import { getCardIdentifier } from '../utils/cardUtils';

export interface CollectionCardEntry extends CardSet {
  quantity: number;
  isFoil?: boolean;
}

interface CollectionContextType {
  collectionCards: CollectionCardEntry[];
  addCardToCollection: (card: CardSet, quantity: number, isFoil?: boolean) => void;
  removeCardFromCollection: (card: CollectionCardEntry) => void;
  updateCardQuantity: (card: CollectionCardEntry, quantity: number) => void;
  clearCollection: () => void;
  toggleExpandedCard: (card: CollectionCardEntry) => void;
  expandedCardId: string | null;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
};

interface CollectionProviderProps {
  children: ReactNode;
}

export const CollectionProviderComponent = ({ children }: CollectionProviderProps) => {
  const [collectionCards, setCollectionCards] = useState<CollectionCardEntry[]>([]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const addCardToCollection = (card: CardSet, quantity: number = 1, isFoil: boolean = false) => {
    // Create a consistent card identifier that includes foil status
    const cardIdentifier = getCardIdentifier(card, isFoil);
    
    setCollectionCards(prevCards => {
      // Check if card already exists in collection with the same foil status
      const existingCardIndex = prevCards.findIndex(entry => 
        getCardIdentifier(entry) === cardIdentifier
      );
      
      if (existingCardIndex !== -1) {
        // If card exists, increment its quantity by the provided quantity
        const newCards = [...prevCards];
        newCards[existingCardIndex] = {
          ...newCards[existingCardIndex],
          quantity: newCards[existingCardIndex].quantity + quantity
        };
        return newCards;
      }
      
      // If card doesn't exist, add it with the provided quantity and foil status
      return [...prevCards, { ...card, quantity, isFoil }];
    });
  };

  const removeCardFromCollection = (card: CollectionCardEntry) => {
    // Generate a consistent identifier for the card to be removed
    const cardIdentifier = getCardIdentifier(card);
    
    setCollectionCards(prevCards => 
      prevCards.filter(entry => 
        getCardIdentifier(entry) !== cardIdentifier
      )
    );
  };

  const updateCardQuantity = (card: CollectionCardEntry, quantity: number) => {
    if (quantity <= 0) {
      // Remove card if quantity is 0 or negative
      removeCardFromCollection(card);
      return;
    }

    // Generate a consistent identifier for the card to be updated
    const cardIdentifier = getCardIdentifier(card);
    
    setCollectionCards(prevCards => {
      const existingCardIndex = prevCards.findIndex(entry => 
        getCardIdentifier(entry) === cardIdentifier
      );
      
      if (existingCardIndex !== -1) {
        // Update quantity for existing card
        const newCards = [...prevCards];
        newCards[existingCardIndex] = {
          ...newCards[existingCardIndex],
          quantity
        };
        return newCards;
      }
      
      // If card doesn't exist (shouldn't happen normally), add it
      return [...prevCards, { ...card, quantity }];
    });
  };

  const clearCollection = () => {
    setCollectionCards([]);
  };

  // Also update expanded card ID handling to account for foil status
  const toggleExpandedCard = (card: CollectionCardEntry) => {
    
    const cardId = getCardIdentifier(card);
    setExpandedCardId(prevId => prevId === cardId ? null : cardId);
  };

  return (
    <CollectionContext.Provider
      value={{
        collectionCards,
        addCardToCollection,
        removeCardFromCollection,
        updateCardQuantity,
        clearCollection,
        toggleExpandedCard,
        expandedCardId,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

export { CollectionContext };
