import { Box, Heading, Stack, Text, Flex, HStack, IconButton, Input } from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight, FaFastBackward, FaFastForward, FaSearch } from 'react-icons/fa';
import { OptionBase, Select } from 'chakra-react-select';
import { useTheme } from 'next-themes';
import { useCollection } from '../contexts/CollectionContext';
import { useState, useMemo } from 'react';
import { CardSet, SortField, SortDirection, ViewMode, CollectionCardEntry } from '../types';
import CardListView from '../components/cards/CardListView';
import CardGridView from '../components/cards/CardGridView';
import PillToggle from '../components/cards/PillToggle';
import { getHighestRetailPrice, getColorName, getCardIdentifier } from '../utils/cardUtils';

export interface PageSizeOption extends OptionBase {
  label: string;
  value: string;
}

export const Inventory = () => {
  const { resolvedTheme } = useTheme();
  const { collectionCards, removeCardFromCollection, updateCardQuantity } = useCollection();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.List);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Handler for sort changes
  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting changes
  };
  
  // Filter cards based on search query before sorting
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return collectionCards;
    
    const query = searchQuery.toLowerCase().trim();
    return collectionCards.filter(card => 
      card.name.toLowerCase().includes(query) || 
      card.type?.toLowerCase().includes(query) || 
      card.setCode?.toLowerCase().includes(query)
    );
  }, [collectionCards, searchQuery]);
  
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
          const priceA = getHighestRetailPrice(a) || 0;
          const priceB = getHighestRetailPrice(b) || 0;
          comparison = priceA - priceB;
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [filteredCards, sortField, sortDirection]);
  
  // Calculate pagination
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
  
  const firstPage = () => {
    setCurrentPage(1);
  };
  
  const lastPage = () => {
    setCurrentPage(totalPages || 1);
  };
  
  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };
  
  // Handle changing card quantity
  const handleQuantityChange = (card: CollectionCardEntry, quantity: number) => {
    const cardIdentifier = getCardIdentifier(card);
    console.log('Updating quantity for card:', cardIdentifier, 'to', quantity);
    
    if (quantity <= 0) {
      // Pass the whole card object as the collection context expects
      removeCardFromCollection(card);
    } else {
      // Pass the whole card object as the collection context expects
      updateCardQuantity(card, quantity);
    }
  };
  
  // Prepare card data for the components - no need to transform since CollectionCardEntry already includes quantity
  const cardsForDisplay = currentCards;
  
  return (
    <Box bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'} color={resolvedTheme === 'dark' ? 'white' : 'gray.800'} borderRadius="lg" padding="6" boxShadow="sm" width="full">
      <Stack gap="6">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Inventory</Heading>
          <HStack gap={4}>
            <Box position="relative" maxW="250px">
              <Input
                placeholder="Search collection..."
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
        
        {collectionCards.length === 0 ? (
          <Text>Your collection is empty. Add cards from the Add Card page.</Text>
        ) : (
          <>
            {sortedAllCards.length === 0 ? (
              <Text>No cards match your search query.</Text>
            ) : viewMode === ViewMode.List ? (
              <CardListView
                cards={cardsForDisplay}
                onAddCard={(card, newQuantity) => {
                  // Find the original entry by comparing card identifiers (which include foil status)
                  const cardIdentifier = getCardIdentifier(card);
                  const originalEntry = collectionCards.find(
                    entry => getCardIdentifier(entry) === cardIdentifier
                  );
                  
                  if (originalEntry) {
                    handleQuantityChange(originalEntry, newQuantity);
                  }
                }}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                actionLabel="Update"
                showFoilOption={false}
              />
            ) : (
              <CardGridView 
                cards={cardsForDisplay} 
                onAddCard={(card, newQuantity) => {
                  // Find the original entry by comparing card identifiers (which include foil status)
                  const cardIdentifier = getCardIdentifier(card);
                  const originalEntry = collectionCards.find(
                    entry => getCardIdentifier(entry) === cardIdentifier
                  );
                  
                  if (originalEntry) {
                    handleQuantityChange(originalEntry, newQuantity);
                  }
                }}
                actionLabel="Update"
                showFoilOption={false}
              />
            )}
            
            <HStack justify="space-between" gap={4}>
              <HStack gap={2} align="center">
                <IconButton 
                  aria-label="First page" 
                  onClick={firstPage} 
                  disabled={currentPage === 1 || totalPages === 0}
                  size="sm"
                >
                  <FaFastBackward />
                </IconButton>
                <IconButton 
                  aria-label="Previous page" 
                  onClick={prevPage} 
                  disabled={currentPage === 1 || totalPages === 0}
                  size="sm"
                >
                  <FaChevronLeft />
                </IconButton>
                <Text>Page {currentPage} of {totalPages || 1}</Text>
                <IconButton 
                  aria-label="Next page" 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages || totalPages === 0}
                  size="sm"
                >
                  <FaChevronRight />
                </IconButton>
                <IconButton 
                  aria-label="Last page" 
                  onClick={lastPage} 
                  disabled={currentPage === totalPages || totalPages === 0}
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
                    setCurrentPage(1);
                  }}
                  size="sm"
                />
              </HStack>
            </HStack>
            
            <Text fontSize="sm">
              Showing {sortedAllCards.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, sortedAllCards.length)} of {sortedAllCards.length} cards
            </Text>
          </>
        )}
      </Stack>
    </Box>
  );
};
