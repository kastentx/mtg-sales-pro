import React from 'react';
import { Box, Button, Heading, HStack, Image, Stack, Table, Text, Flex, Badge } from '@chakra-ui/react';
import { OptionBase, Select } from 'chakra-react-select';
import { useTheme } from 'next-themes';
import { useCardData } from '../contexts/CardDataContext';
import { useState, useMemo } from 'react';
import { CardSet } from '../types';

export interface PageSizeOption extends OptionBase {
  label: string;
  value: string;
}

export enum ImageVariant {
  Small = 'small',
  Normal = 'normal',
  Large = 'large',
  Png = 'png',
  BorderCrop = 'border_crop',
  ArtCrop = 'art_crop',
}

export const getSymbolUrl = (symbol: string) => {
  const symbolCode = symbol.slice(1, -1);


  return `https://svgs.scryfall.io/card-symbols/${symbolCode}.svg`
}

export const getImageUrl = (card: CardSet, variant: ImageVariant = ImageVariant.Normal) => {
  const filename = card.identifiers.scryfallId || '';
  const fileFace = 'front';
  const fileType = variant;
  const fileFormat = variant !== ImageVariant.Png ? 'jpg' : 'png';
  const dir1 = filename.slice(0, 1);
  const dir2 = filename.slice(1, 2);
  return `https://cards.scryfall.io/${fileType}/${fileFace}/${dir1}/${dir2}/${filename}.${fileFormat}`;
}


export const AddCard = () => {
  const { resolvedTheme } = useTheme();
  const { loadedSetData } = useCardData();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Track expanded row
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
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
  
  // Toggle expanded row
  const toggleExpandedCard = (cardId: string) => {
    setExpandedCardId(prevId => prevId === cardId ? null : cardId);
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
                    <Table.ColumnHeader width="87px" textAlign="center"></Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="left">Name</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="left">Set</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="left">Type</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="left">Rarity</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="left">Action</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {currentCards.map((card: CardSet) => (
                    <React.Fragment key={card.uuid}>
                      <Table.Row 
                        cursor="pointer"
                        _hover={{
                          bg: resolvedTheme === 'dark' ? 'gray.700' : 'gray.50'
                        }}
                        bg={expandedCardId === card.uuid 
                          ? (resolvedTheme === 'dark' ? 'gray.700' : 'gray.100') 
                          : 'transparent'
                        }
                        onClick={() => toggleExpandedCard(card.uuid)}
                      >
                        <Table.Cell style={{ overflow: 'visible' }} textAlign="center">
                          <Box 
                            position="relative" 
                            height="120px"
                            width="87px"  
                            overflow="visible"
                            zIndex="1"
                            _hover={{
                              zIndex: "100"
                            }}
                            onClick={(e) => e.stopPropagation()} // Prevent collapsible trigger
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
                        <Table.Cell><i className={`ss ss-3x ss-${card.setCode.toLocaleLowerCase()}`}></i></Table.Cell>
                        <Table.Cell>{card.type}</Table.Cell>
                        <Table.Cell>{card.rarity}</Table.Cell>
                        <Table.Cell>
                          <Button 
                            size="xs" 
                            colorScheme="blue"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent collapsible trigger
                              // Add card logic here
                            }}
                          >
                            Add
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                      {expandedCardId === card.uuid && (
                        <Table.Row>
                          <Table.Cell colSpan={6} p={0}>
                            <Box 
                              p={4} 
                              bg={resolvedTheme === 'dark' ? 'gray.700' : 'gray.50'}
                              borderBottomWidth="1px"
                            >
                              <Flex direction="row" gap={6}>
                                <Box flex="1">
                                  <Stack gap={2}>
                                    <Heading size="sm">Card Details</Heading>
                                    <Flex gap={2} wrap="wrap">
                                      {card.colors?.map((color, idx) => (
                                        <Badge key={idx} colorScheme={
                                          color === 'W' ? 'yellow' : 
                                          color === 'U' ? 'blue' : 
                                          color === 'B' ? 'purple' : 
                                          color === 'R' ? 'red' : 
                                          color === 'G' ? 'green' : 'gray'
                                        }>
                                          {color}
                                        </Badge>
                                      ))}
                                    </Flex>
                                    {card.manaCost && (
                                        <Flex align="center" gap={1}>
                                        <Text fontSize="sm" fontWeight="bold">Mana Cost:</Text>
                                        {card.manaCost.match(/{[^}]+}/g)?.map((symbol, idx) => (
                                          <Image 
                                          key={idx}
                                          src={getSymbolUrl(symbol)}
                                          alt={symbol}
                                          width="16px"
                                          height="16px"
                                          />
                                        ))}
                                        </Flex>
                                    )}
                                    {card.text && (
                                      <Text fontSize="sm">
                                      <strong>Text:</strong>{' '}
                                      {card.text.split(/({[^}]+})/g).map((segment, idx) => (
                                        segment.match(/^{[^}]+}$/) ? 
                                        <Image 
                                          key={idx}
                                          display="inline"
                                          src={getSymbolUrl(segment)}
                                          alt={segment}
                                          width="16px"
                                          height="16px"
                                          verticalAlign="middle"
                                        /> :
                                        <React.Fragment key={idx}>{segment}</React.Fragment>
                                      ))}
                                      </Text>
                                    )}
                                    {card.flavorText && (
                                      <Text fontSize="sm" fontStyle="italic">{card.flavorText}</Text>
                                    )}
                                  </Stack>
                                </Box>
                                <Box>
                                  <Stack gap={2}>
                                    <Heading size="sm">Collection Info</Heading>
                                    <Text fontSize="sm"><strong>Number:</strong> {card.number}</Text>
                                    {card.power && card.toughness && (
                                      <Text fontSize="sm"><strong>P/T:</strong> {card.power}/{card.toughness}</Text>
                                    )}
                                    {card.artist && (
                                      <Text fontSize="sm"><strong>Artist:</strong> {card.artist}</Text>
                                    )}
                                  </Stack>
                                </Box>
                              </Flex>
                            </Box>
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </React.Fragment>
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
