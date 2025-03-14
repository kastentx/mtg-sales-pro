import React, { useState, useEffect } from 'react';
import { Box, Button, Text, Flex, Icon, Heading, Image, Input, IconButton, Stack, Table, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';
import { FaDollarSign, FaPlus, FaMinus, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import { SortField, SortDirection, CardSet, CollectionCardEntry } from '../../types';
import { 
  getImageUrl, 
  getSymbolUrl, 
  getHighestRetailPrice,
  getLowestRetailPrice, 
  hasBuylistPrice,
  formatPrice, 
  getColorName,
  getCardIdentifier,
} from '../../utils/cardUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { CardListViewProps } from '../shared/interfaces';

// Define shimmer animation for foil cards using Chakra UI's animation system
const config = defineConfig({
  theme: {
    keyframes: {
      shimmer: {
        '0%': { backgroundPosition: '-300px 0' },
        '50%': { backgroundPosition: '300px 0', filter: 'hue-rotate(45deg) saturate(1.5)' },
        '100%': { backgroundPosition: '-300px 0' }
      },
      cardShimmer: {
        '0%': { 
          backgroundPosition: '-200% 0',
          filter: 'brightness(1) contrast(1) saturate(1)'
        },
        '50%': { 
          backgroundPosition: '200% 0',
          filter: 'brightness(1.2) contrast(1.1) saturate(1.3) hue-rotate(15deg)' 
        },
        '100%': { 
          backgroundPosition: '-200% 0',
          filter: 'brightness(1) contrast(1) saturate(1)' 
        }
      },
    },
    tokens: {
      animations: {
        shimmer: {
          value: 'shimmer 4s infinite linear'
        },
        cardShimmer: {
          value: 'cardShimmer 6s infinite ease-in-out'
        }
      },
    },
  },
});

const foilAnimations = createSystem(defaultConfig, config);

// Helper component for sortable headers
const SortableHeader: React.FC<{ 
  field: SortField, 
  children: React.ReactNode,
  sortField?: SortField,
  sortDirection?: SortDirection,
  onSortChange?: (field: SortField, direction: SortDirection) => void
}> = ({ field, children, sortField, sortDirection, onSortChange }) => {
  const handleClick = () => {
    if (!onSortChange) return;
    
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new sort field
      onSortChange(field, 'asc');
    }
  };

  return (
    <Flex onClick={handleClick} align="center" cursor="pointer">
      {children}
      <Box ml={1}>
        {sortField === field ? (
          sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
        ) : (
          <FaSort opacity={0.4} />
        )}
      </Box>
    </Flex>
  );
};

const CardListView: React.FC<CardListViewProps> = ({ 
  cards, 
  onAddCard, 
  sortField,
  sortDirection,
  onSortChange,
  actionLabel = "Add",
  showFoilOption = true,
  foilCardIds = new Set(),
  onToggleFoil = () => {}
}) => {
  const { resolvedTheme } = useTheme();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
  // Initialize quantities with values from cards prop
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  // Track original quantities for comparison
  const [originalQuantities, setOriginalQuantities] = useState<Record<string, number>>({});
  
  // Update quantities state when cards prop changes or when card has quantity property
  useEffect(() => {
    const newQuantities: Record<string, number> = {};
    const newOriginalQuantities: Record<string, number> = {};
    
    cards.forEach(card => {
      // Handle both CardSet and CollectionCardEntry types
      const quantity = 'quantity' in card ? (card.quantity || 0) : 0;
      const cardId = getCardIdentifier(card);
      
      newQuantities[cardId] = quantity;
      newOriginalQuantities[cardId] = quantity;
    });
    
    setQuantities(newQuantities);
    setOriginalQuantities(newOriginalQuantities);
  }, [cards]);

  // Toggle expanded state for a card
  const toggleExpandedCard = (card: CardSet | CollectionCardEntry) => {
    const cardId = getCardIdentifier(card);
    setExpandedCardId(prevId => prevId === cardId ? null : cardId);
  };

  // Handle quantity change for a card
  const handleQuantityChange = (card: CardSet | CollectionCardEntry, value: string) => {
    const cardId = getCardIdentifier(card);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setQuantities(prev => ({ ...prev, [cardId]: numValue }));
    }
  };

  // Increment quantity
  const incrementQuantity = (card: CardSet | CollectionCardEntry, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent collapsible trigger
    const cardId = getCardIdentifier(card);
    const currentQty = quantities[cardId] || 0;
    setQuantities(prev => ({ ...prev, [cardId]: currentQty + 1 }));
  };

  // Decrement quantity
  const decrementQuantity = (card: CardSet | CollectionCardEntry, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent collapsible trigger
    const cardId = getCardIdentifier(card);
    const currentQty = quantities[cardId] || 0;
    if (currentQty > 0) {
      setQuantities(prev => ({ ...prev, [cardId]: currentQty - 1 }));
    }
  };

  // Helper function to check if foil pricing is available for a card
  const hasFoilPricing = (card: CardSet | CollectionCardEntry): boolean => {
    return !!(card.pricing?.retail?.foil && 
      Object.values(card.pricing.retail.foil).some(price => price !== undefined));
  };

  // Helper function to check if only foil pricing is available for a card
  const hasOnlyFoilPricing = (card: CardSet | CollectionCardEntry): boolean => {
    const hasFoil = hasFoilPricing(card);
    const hasNormal = !!(card.pricing?.retail?.normal && 
      Object.values(card.pricing.retail.normal).some(price => price !== undefined));
    
    return hasFoil && !hasNormal;
  };

  // Toggle foil state for a card - now using the parent's callback
  const handleFoilChange = (card: CardSet | CollectionCardEntry, checked: boolean) => {
    // Call the parent's callback to update foil state
    onToggleFoil(card.uuid, checked);
  };

  // Add card with quantity and foil state
  const handleAddCard = (card: CardSet | CollectionCardEntry, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent collapsible trigger
    const cardId = getCardIdentifier(card);
    const quantity = quantities[cardId] || 0;
    const isFoil = foilCardIds.has(card.uuid); // Use the foilCardIds prop
    onAddCard(card, quantity, isFoil);
    
    // Don't reset quantity after adding - the parent component will control this
  };

  // Check if quantity has changed from original
  const hasQuantityChanged = (card: CardSet | CollectionCardEntry): boolean => {
    const cardId = getCardIdentifier(card);
    return quantities[cardId] !== originalQuantities[cardId];
  };

  return (
    <Box overflowX="auto" width="100%">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader textAlign="left" minWidth="400px">
              <SortableHeader field="name" sortField={sortField} sortDirection={sortDirection} onSortChange={onSortChange}>Name</SortableHeader>
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign="left" minWidth="100px">
              <SortableHeader field="set" sortField={sortField} sortDirection={sortDirection} onSortChange={onSortChange}>Set</SortableHeader>
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign="left" minWidth="100px">
              <SortableHeader field="color" sortField={sortField} sortDirection={sortDirection} onSortChange={onSortChange}>Color</SortableHeader>
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign="left" minWidth="250px">
              <SortableHeader field="type" sortField={sortField} sortDirection={sortDirection} onSortChange={onSortChange}>Type</SortableHeader>
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign="left" minWidth="200px">
              <SortableHeader field="price" sortField={sortField} sortDirection={sortDirection} onSortChange={onSortChange}>Price Range</SortableHeader>
            </Table.ColumnHeader>
            {showFoilOption && (
              <Table.ColumnHeader textAlign="center" width="100px">Foil</Table.ColumnHeader>
            )}
            <Table.ColumnHeader textAlign="center" width="150px">Qty</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {cards.map((card: CardSet | CollectionCardEntry) => {
            // Use foilCardIds prop to determine if card is foil
            const isFoil = foilCardIds.has(card.uuid) || ('isFoil' in card && card.isFoil) || false;
            const cardId = getCardIdentifier(card);
            const canBeFoil = hasFoilPricing(card);
            const isFoilOnly = hasOnlyFoilPricing(card);
            return (
            <React.Fragment key={cardId}>
              <Table.Row 
                cursor="pointer"
                _hover={{
                  bg: resolvedTheme === 'dark' ? 'gray.700' : 'gray.50'
                }}
                bg={isFoil 
                  ? (resolvedTheme === 'dark' 
                    ? 'linear-gradient(to right, rgba(66, 153, 225, 0.05), rgba(183, 148, 244, 0.1), rgba(66, 153, 225, 0.05))' 
                    : 'linear-gradient(to right, rgba(226, 232, 240, 0.8), rgba(237, 242, 247, 0.9), rgba(226, 232, 240, 0.8))'
                    )
                  : (expandedCardId === cardId
                    ? (resolvedTheme === 'dark' ? 'gray.700' : 'gray.100') 
                    : 'transparent')
                }
                onClick={() => toggleExpandedCard(card)}
                position="relative"
                overflow="hidden"
                _after={isFoil ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: resolvedTheme === 'dark'
                    ? 'linear-gradient(to right, transparent, rgba(137, 207, 240, 0.1), rgba(183, 148, 244, 0.1), rgba(137, 207, 240, 0.1), transparent)'
                    : 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3), transparent)',
                  backgroundSize: '200% 100%',
                  backgroundRepeat: 'no-repeat',
                  animation: 'shimmer 4s infinite linear',
                  pointerEvents: 'none',
                  zIndex: 1
                } : undefined}
              >
                <Table.Cell>
                  <Flex align="center" gap={3}>
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
                        width="100%"
                        objectFit="contain"
                        transition="transform 0.2s"
                        _hover={{
                          transform: expandedCardId === card.uuid ? "none" : "scale(2.5)",
                          boxShadow: expandedCardId === card.uuid ? "none" : "xl",
                          zIndex: "100"
                        }}
                        style={{
                          transformOrigin: "25% center",
                          ...(isFoil && {
                            border: '1px solid',
                            borderColor: 'rgba(183, 148, 244, 0.7)',
                            boxShadow: resolvedTheme === 'dark'
                              ? '0 0 15px rgba(137, 207, 240, 0.3)'
                              : '0 0 15px rgba(183, 148, 244, 0.4)',
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: `linear-gradient(
                                135deg, 
                                transparent 0%, 
                                rgba(255, 255, 255, 0.4) 25%, 
                                rgba(255, 192, 203, 0.2) 30%, 
                                rgba(137, 207, 240, 0.3) 48%, 
                                rgba(144, 238, 144, 0.2) 55%, 
                                rgba(255, 215, 0, 0.3) 75%, 
                                transparent 100%
                              )`,
                              backgroundSize: '400% 100%',
                              borderRadius: '7px',
                              mixBlendMode: 'soft-light',
                              zIndex: 3,
                              animation: 'cardShimmer 6s infinite ease-in-out',
                              pointerEvents: 'none',
                            },
                            filter: resolvedTheme === 'dark'
                              ? 'contrast(1.05) brightness(1.1)'
                              : 'contrast(1.05) saturate(1.05)'
                          })
                        }}
                      />
                    </Box>
                    <Text fontSize="lg" fontWeight="medium">
                      {card.name}
                      {isFoil && <Text as="span" fontSize="sm" color="gray.500" fontWeight="normal" ml={1}>(Foil)</Text>}
                    </Text>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Flex direction="column" gap={1}>
                    <Flex align="center" gap={2}>
                      <Box 
                        className={`ss ss-grad ss-2x ss-${card.setCode.toLocaleLowerCase()} ss-${card.rarity}`}
                        style={{
                          filter: "drop-shadow(0px 0px 2px rgba(0,0,0,0.8))",
                        }}
                      />
                      <Text fontSize="md">{card.setCode.toUpperCase()}</Text>
                    </Flex>
                    <Text fontSize="xs" color="gray.500">{card.rarity}</Text>
                  </Flex>
                </Table.Cell>
                <Table.Cell fontSize="sm">{getColorName(card.colors)}</Table.Cell>
                <Table.Cell fontSize="md">{card.type}</Table.Cell>
                <Table.Cell fontSize="lg">
                  <Flex align="center" gap={1}>
                    {formatPrice(getLowestRetailPrice(card, isFoil))} - {formatPrice(getHighestRetailPrice(card, isFoil))}
                    {hasBuylistPrice(card, isFoil) && (
                      <Tooltip content="Has buylist price">
                        <span>
                          <Icon as={FaDollarSign} color="green.500" ml={1} />
                        </span>
                      </Tooltip>
                    )}
                  </Flex>
                </Table.Cell>
                {showFoilOption && (
                  <Table.Cell>
                    <Flex justify="center">
                      <Checkbox 
                        checked={foilCardIds.has(card.uuid) || ('isFoil' in card && card.isFoil) || isFoilOnly}
                        onCheckedChange={(e) => {
                          handleFoilChange(card, !!e.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={!canBeFoil || isFoilOnly}
                      />
                    </Flex>
                  </Table.Cell>
                )}
                <Table.Cell>
                  <Flex direction="column" alignItems="center" gap={1}>
                    <Flex alignItems="center">
                      <IconButton
                        aria-label="Decrease quantity"
                        size="xs"
                        variant="outline"
                        onClick={(e) => decrementQuantity(card, e)}
                        disabled={(quantities[cardId] || 0) <= 0}
                      >
                        <FaMinus />
                      </IconButton>
                      <Input
                        size="xs"
                        width="40px"
                        textAlign="center"
                        value={quantities[cardId] || 0}
                        onChange={(e) => handleQuantityChange(card, e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent collapsible trigger
                        mx={1}
                      />
                      <IconButton
                        aria-label="Increase quantity"
                        size="xs"
                        variant="outline"
                        onClick={(e) => incrementQuantity(card, e)}
                      >
                        <FaPlus />
                      </IconButton>
                    </Flex>
                    <Button
                      size="xs"
                      color={resolvedTheme === 'dark' ? 'white' : 'gray.800'}
                      width="110px"
                      onClick={(e) => handleAddCard(card, e)}
                      disabled={
                        (actionLabel === "Add" && (quantities[cardId] || 0) <= 0) || 
                        (actionLabel === "Update" && !hasQuantityChanged(card))
                      }
                    >
                      {actionLabel}
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
              {expandedCardId === cardId && (
                <Table.Row>
                  <Table.Cell colSpan={showFoilOption ? 9 : 8} p={0}>
                    <Box 
                      p={4} 
                      bg={resolvedTheme === 'dark' ? 'gray.700' : 'gray.50'}
                      borderBottomWidth="1px"
                      width="100%"
                    >
                      <Flex direction="row" gap={6}>
                        {/* Full-height card image with hover/magnify effect */}
                        <Box 
                          position="relative" 
                          width="200px" 
                          minWidth="200px" 
                          height="280px" 
                          overflow="visible"
                          zIndex="1"
                          _hover={{
                            zIndex: "100"
                          }}
                        >
                          <Image 
                            src={getImageUrl(card)} 
                            borderRadius="10px" 
                            height="100%" 
                            width="100%"
                            objectFit="contain"
                            boxShadow="md"
                            transition="transform 0.3s"
                            _hover={{
                              transform: "scale(2)",
                              boxShadow: "xl",
                              zIndex: "100"
                            }}
                            style={{
                              transformOrigin: "left center"
                            }}
                          />
                        </Box>
                        
                        {/* Card details (middle) */}
                        <Box flex="1">
                          <Stack gap={3}>
                            {card.manaCost && (
                              <Flex align="center" gap={2}>
                                <Text fontSize="md" fontWeight="bold">Mana Cost:</Text>
                                <Flex align="center">
                                  {card.manaCost.match(/{[^}]+}/g)?.map((symbol, idx) => (
                                    <Image 
                                      key={idx}
                                      src={getSymbolUrl(symbol)}
                                      alt={symbol}
                                      width="20px"
                                      height="20px"
                                    />
                                  ))}
                                </Flex>
                              </Flex>
                            )}
                            {card.power && card.toughness && (
                              <Text fontSize="md"><strong>P/T:</strong> {card.power}/{card.toughness}</Text>
                            )}
                            {card.text && (
                              <Box mt={1}>
                                <Text fontSize="md" fontWeight="bold" mb={1}>Card Text:</Text>
                                <Text fontSize="md" pl={2}>
                                  {card.text.split(/({[^}]+})/g).map((segment, idx) => {
                                    if (segment.match(/^{[^}]+}$/)) {
                                      return (
                                        <Image 
                                          key={idx}
                                          display="inline"
                                          src={getSymbolUrl(segment)}
                                          alt={segment}
                                          width="16px"
                                          height="16px"
                                          verticalAlign="middle"
                                        />
                                      );
                                    } else {
                                      // Process text segment to handle newlines
                                      return (
                                        <Box as="span" key={idx}>
                                          {segment.replace(/\\n/g, '\n').split('\n').map((line, lineIdx, array) => (
                                            <React.Fragment key={`line-${lineIdx}`}>
                                              {line}
                                              {lineIdx < array.length - 1 && <Box as="br" />}
                                            </React.Fragment>
                                          ))}
                                        </Box>
                                      );
                                    }
                                  })}
                                </Text>
                              </Box>
                            )}
                            {card.flavorText && (
                              <Text fontSize="md" fontStyle="italic" color="gray.500" mt={1}>
                                {card.flavorText}
                              </Text>
                            )}
                            {card.artist && (
                              <Text fontSize="md" mt={1}><strong>Artist:</strong> {card.artist}</Text>
                            )}
                          </Stack>
                        </Box>
                        
                        {/* Pricing information (right side) */}
                        <Box width="250px" minWidth="250px">
                          <Stack gap={4}>
                            {/* Retail prices */}
                            {((isFoil && card.pricing?.retail?.foil) || (!isFoil && card.pricing?.retail?.normal)) && (
                              <Box>
                                <Heading as="h5" size="sm" mb={2}>
                                  Retail Prices {isFoil && <Text as="span" fontSize="md" color="gray.500" fontWeight="normal" ml={1}>(Foil)</Text>}
                                </Heading>
                                <Stack gap={2}>
                                  {isFoil && card.pricing?.retail?.foil ? (
                                    <>
                                      {card.pricing.retail.foil.tcgplayer !== undefined && (
                                        <Flex justify="space-between">
                                          <Text fontWeight="bold">TCGPlayer:</Text>
                                          <Text fontSize="lg">{formatPrice(card.pricing.retail.foil.tcgplayer)}</Text>
                                        </Flex>
                                      )}
                                      {card.pricing.retail.foil.cardkingdom !== undefined && (
                                        <Flex justify="space-between">
                                          <Text fontWeight="bold">Card Kingdom:</Text>
                                          <Text fontSize="lg">{formatPrice(card.pricing.retail.foil.cardkingdom)}</Text>
                                        </Flex>
                                      )}
                                      {card.pricing.retail.foil.cardsphere !== undefined && (
                                        <Flex justify="space-between">
                                          <Text fontWeight="bold">Card Sphere:</Text>
                                          <Text fontSize="lg">{formatPrice(card.pricing.retail.foil.cardsphere)}</Text>
                                        </Flex>
                                      )}
                                      {card.pricing.retail.foil.cardmarket !== undefined && (
                                        <Flex justify="space-between">
                                          <Text fontWeight="bold">Card Market:</Text>
                                          <Text fontSize="lg">{formatPrice(card.pricing.retail.foil.cardmarket)}</Text>
                                        </Flex>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {card.pricing?.retail?.normal?.tcgplayer !== undefined && (
                                        <Flex justify="space-between">
                                          <Text fontWeight="bold">TCGPlayer:</Text>
                                          <Text fontSize="lg">{formatPrice(card.pricing.retail.normal.tcgplayer)}</Text>
                                        </Flex>
                                      )}
                                      {card.pricing?.retail?.normal?.cardkingdom !== undefined && (
                                        <Flex justify="space-between">
                                          <Text fontWeight="bold">Card Kingdom:</Text>
                                          <Text fontSize="lg">{formatPrice(card.pricing.retail.normal.cardkingdom)}</Text>
                                        </Flex>
                                      )}
                                      {card.pricing?.retail?.normal?.cardsphere !== undefined && (
                                        <Flex justify="space-between">
                                          <Text fontWeight="bold">Card Sphere:</Text>
                                          <Text fontSize="lg">{formatPrice(card.pricing.retail.normal.cardsphere)}</Text>
                                        </Flex>
                                      )}
                                      {card.pricing?.retail?.normal?.cardmarket !== undefined && (
                                        <Flex justify="space-between">
                                          <Text fontWeight="bold">Card Market:</Text>
                                          <Text fontSize="lg">{formatPrice(card.pricing.retail.normal.cardmarket)}</Text>
                                        </Flex>
                                      )}
                                    </>
                                  )}
                                </Stack>
                              </Box>
                            )}
                            
                            {/* Buylist prices */}
                            {((isFoil && card.pricing?.buylist?.foil) || (!isFoil && card.pricing?.buylist?.normal)) && (
                              <Box>
                                <Heading as="h5" size="sm" mb={2} color="green.500">
                                  <Flex align="center" gap={1}>
                                    <Icon as={FaDollarSign} /> Buylist Prices {isFoil && <Text as="span" color="blue.300">(Foil)</Text>}
                                  </Flex>
                                </Heading>
                                <Stack gap={2}>
                                  {isFoil && card.pricing?.buylist?.foil ? (
                                    <>
                                      {card.pricing.buylist.foil.cardkingdom !== undefined && (
                                        <Flex justify="space-between">
                                          <Text fontWeight="bold">Card Kingdom:</Text>
                                          <Text fontSize="lg" color="green.500">{formatPrice(card.pricing.buylist.foil.cardkingdom)}</Text>
                                        </Flex>
                                      )}
                                      {/* Add other foil buylist sources as they become available */}
                                    </>
                                  ) : (
                                    <>
                                      {card.pricing?.buylist?.normal?.cardkingdom !== undefined && (
                                        <Flex justify="space-between">
                                          <Text fontWeight="bold">Card Kingdom:</Text>
                                          <Text fontSize="lg" color="green.500">{formatPrice(card.pricing.buylist.normal.cardkingdom)}</Text>
                                        </Flex>
                                      )}
                                      {/* Add other normal buylist sources as they become available */}
                                    </>
                                  )}
                                </Stack>
                              </Box>
                            )}
                            {/* Add foil option in expanded view if showFoilOption is true */}
                            {showFoilOption && (
                              <Box mt={3} textAlign="center">
                                <Checkbox
                                  size="md"
                                  checked={foilCardIds.has(card.uuid) || ('isFoil' in card && card.isFoil) || isFoilOnly}
                                  onCheckedChange={(e) => {
                                    handleFoilChange(card, !!e.checked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  disabled={!canBeFoil || isFoilOnly}
                                >
                                  <Text fontWeight="bold">
                                    Foil {!canBeFoil && "(N/A)"}
                                    {isFoilOnly && "(Only)"}
                                  </Text>
                                </Checkbox>
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      </Flex>
                    </Box>
                  </Table.Cell>
                </Table.Row>
              )}
            </React.Fragment>
          )})}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default CardListView;
