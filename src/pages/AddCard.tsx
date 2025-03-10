import { Box, Button, Heading, HStack, Image, Stack, Table, Text } from '@chakra-ui/react';
import { OptionBase, Select } from 'chakra-react-select';
import { useTheme } from 'next-themes';
import { useCardData } from '../contexts/CardDataContext';
import { useState, useMemo } from 'react';
import { CardSet } from '../types';

export interface PageSizeOption extends OptionBase {
  label: string;
  value: string;
}

export const getImageUrl = (card: CardSet) => {
  const filename = card.identifiers.scryfallId || '';
  const fileFace = 'front';
  const fileType = 'small';
  const fileFormat = 'jpg';
  const dir1 = filename.slice(0, 1);
  const dir2 = filename.slice(1, 2);
  return `https://cards.scryfall.io/${fileType}/${fileFace}/${dir1}/${dir2}/${filename}.${fileFormat}`;
}


export const AddCard = () => {
  const { resolvedTheme } = useTheme();
  const { loadedSetData } = useCardData();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Extract all cards from loaded sets
  const allCards = useMemo(() => {
    return loadedSetData.flatMap(set => set.cards || []);
  }, [loadedSetData]);
  
  // Calculate pagination
  const totalPages = Math.ceil(allCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCards = allCards.slice(startIndex, endIndex);
  
  // Page navigation
  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  return (
    <Box bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'} color={resolvedTheme === 'dark' ? 'white' : 'gray.800'} borderRadius="lg" padding="6" boxShadow="sm" width="full">
      <Stack gap="6">
        <Heading size="lg">Add Card</Heading>
        <hr />
        
        {loadedSetData.length === 0 ? (
          <Text>No sets loaded. Please select sets in the browser to view cards.</Text>
        ) : (
          <>
            <Box overflowX="auto" overflow="visible">
              <Table.Root variant="line" size="sm" style={{ overflow: 'visible' }}>
                <Table.Header>
                  <Table.Row>
                    {/* add a thumbnail image to each row */}
                    <Table.ColumnHeader></Table.ColumnHeader>
                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Set</Table.ColumnHeader>
                    <Table.ColumnHeader>Type</Table.ColumnHeader>
                    <Table.ColumnHeader>Rarity</Table.ColumnHeader>
                    <Table.ColumnHeader>Action</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {currentCards.map((card: CardSet) => (
                    <Table.Row key={card.uuid}>
                          <Table.Cell style={{ overflow: 'visible' }}>
                          <Box 
                            position="relative" 
                            height="120px"
                            width="87px"  
                            overflow="visible"
                            zIndex="1"
                            _hover={{
                              zIndex: "100"
                            }}
                          >
                            <Image 
                            src={getImageUrl(card)} 
                            borderRadius="7px" 
                            height="120px" 
                            transition="transform 0.2s"
                            _hover={{
                              transform: "scale(2.5)",
                              boxShadow: "xl",
                              zIndex: "100"
                            }}
                            style={{
                              transformOrigin: "25% center"
                            }}
                            />
                          </Box>
                        </Table.Cell>
                      <Table.Cell>{card.name}</Table.Cell>
                      <Table.Cell>{card.setCode}</Table.Cell>
                      <Table.Cell>{card.type}</Table.Cell>
                      <Table.Cell>{card.rarity}</Table.Cell>
                      <Table.Cell>
                        <Button size="xs" colorScheme="blue">
                          Add
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
            
            <HStack justify="space-between">
              <HStack>
                <Text>Page {currentPage} of {totalPages}</Text>
                <Button onClick={prevPage} disabled={currentPage === 1} size="sm">Previous</Button>
                <Button onClick={nextPage} disabled={currentPage === totalPages} size="sm">Next</Button>
              </HStack>
              
              <HStack>
                <Text>Cards per page:</Text>
                <Select 
                  options={[
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                    { value: 20, label: '20' },
                    { value: 50, label: '50' }
                  ]}
                  value={{ value: itemsPerPage, label: itemsPerPage.toString() }}
                  onChange={(e) => {
                    setItemsPerPage(e?.value || 10);
                    setCurrentPage(1); // Reset to first page when changing page size
                  }}
                  size="sm"
                />
              </HStack>
            </HStack>
            
            <Text fontSize="sm">
              Showing {startIndex + 1} - {Math.min(endIndex, allCards.length)} of {allCards.length} cards
            </Text>
          </>
        )}
      </Stack>
    </Box>
  );
};
