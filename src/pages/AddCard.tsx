import { Box, Button, Heading, HStack, Stack, Text, Flex, IconButton, Input } from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight, FaFastBackward, FaFastForward, FaSearch } from 'react-icons/fa';
import { OptionBase, Select } from 'chakra-react-select';
import { useTheme } from 'next-themes';
import { useCardData } from '../contexts/CardDataContext';
import { useCollection } from '../contexts/CollectionContext';
import { useState, useMemo, useEffect } from 'react';
import { CardSet, SortField, SortDirection, ViewMode } from '../types';
import CardListView from '../components/cards/CardListView';
import CardGridView from '../components/cards/CardGridView';
import PillToggle from '../components/cards/PillToggle';
import { getHighestRetailPrice, getColorName } from '../utils/cardUtils';
import { toaster } from '@/components/ui/toaster';

export interface PageSizeOption extends OptionBase {
  label: string;
  value: string;
}

// Add a helper function to check if a card only has foil pricing
const hasOnlyFoilPricing = (card: CardSet): boolean => {
  const hasFoil = !!(card.pricing?.retail?.foil && 
    Object.values(card.pricing.retail.foil).some(price => price !== undefined));
  const hasNormal = !!(card.pricing?.retail?.normal && 
    Object.values(card.pricing.retail.normal).some(price => price !== undefined));
  
  return hasFoil && !hasNormal;
};

export const AddCard = () => {
  const { resolvedTheme } = useTheme();
  const { loadedSetData, loadedCardData } = useCardData();
  const { addCardToCollection } = useCollection();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.List);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting state - moved from CardListView
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Add foilCardIds state to track which cards are foil
  const [foilCardIds, setFoilCardIds] = useState<Set<string>>(new Set());
  
  // Initialize foilCardIds with cards that only have foil pricing
  useEffect(() => {
    const newFoilCardIds = new Set<string>(foilCardIds);
    
    // Check each card in loadedCardData
    loadedCardData.forEach(card => {
      if (hasOnlyFoilPricing(card)) {
        newFoilCardIds.add(card.uuid);
      }
    });
    
    // Update foilCardIds if changes were made
    if (newFoilCardIds.size !== foilCardIds.size) {
      setFoilCardIds(newFoilCardIds);
    }
  }, [loadedCardData]);
  
  // Handler for toggling foil state
  const handleToggleFoil = (cardUuid: string, isFoil: boolean) => {
    console.log('Toggling foil state for card:', cardUuid, isFoil);
    setFoilCardIds(prev => {
      const newSet = new Set(prev);
      if (isFoil) {
        newSet.add(cardUuid);
      } else {
        newSet.delete(cardUuid);
      }
      return newSet;
    });
  };
  
  // Handler for sort changes
  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting changes
  };
  
  // Filter cards based on search query before sorting
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return loadedCardData;
    
    const query = searchQuery.toLowerCase().trim();
    return loadedCardData.filter(card => 
      card.name.toLowerCase().includes(query) || 
      card.type?.toLowerCase().includes(query) || 
      card.setCode?.toLowerCase().includes(query)
    );
  }, [loadedCardData, searchQuery]);
  
  // Apply sorting to filtered cards before pagination
  const sortedAllCards = useMemo(() => {
    if (!sortField) return filteredCards;

    return [...filteredCards].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'number':
          // Try to sort by numeric value if possible, otherwise lexicographically
          const numA = parseInt(a.number);
          const numB = parseInt(b.number);
          if (!isNaN(numA) && !isNaN(numB)) {
            comparison = numA - numB;
          } else {
            comparison = a.number.localeCompare(b.number);
          }
          break;
        case 'set':
          comparison = (a.setCode || '').localeCompare(b.setCode || '');
          break;
        case 'rarity':
          // Sort by rarity weight (mythic > rare > uncommon > common)
          const rarityWeight: Record<string, number> = {
            'mythic': 4,
            'rare': 3,
            'uncommon': 2,
            'common': 1,
            '': 0
          };
          const weightA = rarityWeight[a.rarity.toLowerCase() as keyof typeof rarityWeight] || 0;
          const weightB = rarityWeight[b.rarity.toLowerCase() as keyof typeof rarityWeight] || 0;
          comparison = weightB - weightA; // Default to high-to-low for rarity
          break;
        case 'color':
          comparison = getColorName(a.colors).localeCompare(getColorName(b.colors));
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'price':
          // Simplified to use only the high price for sorting
          const priceA = getHighestRetailPrice(a) || 0;
          const priceB = getHighestRetailPrice(b) || 0;
          comparison = priceA - priceB;
          break;
      }

      // Reverse for descending order
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [filteredCards, sortField, sortDirection]);
  
  // Calculate pagination AFTER sorting all cards
  const totalPages = Math.ceil(sortedAllCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCards = sortedAllCards.slice(startIndex, endIndex);
  
  // Page navigation
  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  // New navigation functions for first and last page
  const firstPage = () => {
    setCurrentPage(1);
  };
  
  const lastPage = () => {
    setCurrentPage(totalPages);
  };
  
  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };
  
  // Handle adding a card to collection
  const handleAddCard = (card: CardSet, quantity: number = 1, isFoil: boolean = false) => {
    // Use the foil state from our tracked foilCardIds
    addCardToCollection(card, quantity, isFoil);
    toaster.create({
      title: "Card added to collection",
      description: `${card.name}${isFoil ? ' (Foil)' : ''} has been added to your inventory.`,
    });
  };
  
  return (
    <Box bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'} color={resolvedTheme === 'dark' ? 'white' : 'gray.800'} borderRadius="lg" padding="6" boxShadow="sm" width="full">
      <Stack gap="6">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Add Card</Heading>
          <HStack gap={4}>
            <Box position="relative" maxW="250px">
              <Input
                placeholder="Search cards..."
                value={searchQuery}
                onChange={handleSearchChange}
                size="lg"
                pr="8"
              />
              <Box position="absolute" right="3" top="50%" transform="translateY(-50%)">
                <FaSearch />
              </Box>
            </Box>
            <PillToggle activeView={viewMode} onChange={setViewMode} />
          </HStack>
        </Flex>
        <hr />
        
        {loadedSetData.length === 0 ? (
          <Text>No sets loaded. Please select sets in the browser to view cards.</Text>
        ) : (
          <>
            {sortedAllCards.length === 0 ? (
              <Text>No cards match your search query.</Text>
            ) : viewMode === ViewMode.List ? (
              <CardListView 
                cards={currentCards} 
                onAddCard={handleAddCard} 
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                foilCardIds={foilCardIds}
                onToggleFoil={handleToggleFoil}
              />
            ) : (
              <CardGridView 
                cards={currentCards} 
                onAddCard={handleAddCard} 
                foilCardIds={foilCardIds}
                onToggleFoil={handleToggleFoil}
              />
            )}
            
            <HStack justify="space-between" gap={4}>
              <HStack gap={2} align="center">
                <IconButton 
                  aria-label="First page" 
                  onClick={firstPage} 
                  disabled={currentPage === 1}
                  size="sm"
                >
                  <FaFastBackward />
                </IconButton>
                <IconButton 
                  aria-label="Previous page" 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  size="sm"
                >
                  <FaChevronLeft />
                </IconButton>
                <Text>Page {currentPage} of {totalPages}</Text>
                <IconButton 
                  aria-label="Next page" 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  size="sm"
                >
                  <FaChevronRight />
                </IconButton>
                <IconButton 
                  aria-label="Last page" 
                  onClick={lastPage} 
                  disabled={currentPage === totalPages}
                  size="sm"
                >
                  <FaFastForward />
                </IconButton>
              </HStack>
              
              <HStack gap={2}>
                <Text>Cards per page:</Text>
                <Select 
                  options={[
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                    { value: 20, label: '20' },
                    { value: 50, label: '50' }
                  ]}
                  value={{ value: itemsPerPage, label: itemsPerPage.toString() }}
                  onChange={(e: any) => {
                    setItemsPerPage(e?.value || 10);
                    setCurrentPage(1); // Reset to first page when changing page size
                  }}
                  size="sm"
                />
              </HStack>
            </HStack>
            
            <Text fontSize="sm">
              Showing {startIndex + 1} - {Math.min(endIndex, sortedAllCards.length)} of {sortedAllCards.length} cards
            </Text>
          </>
        )}
      </Stack>
    </Box>
  );
};
