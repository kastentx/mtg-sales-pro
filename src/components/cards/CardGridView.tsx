import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, Button, Text, Flex, Icon, SimpleGrid, Card as CardNamespace, 
  Stack, Image, Badge, IconButton, Input 
} from '@chakra-ui/react';
import { FaDollarSign, FaPlus, FaMinus, FaTimes } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { CardDisplayProps } from '../shared/interfaces';
import { 
  getImageUrl, 
  getSymbolUrl, 
  getHighestRetailPrice, 
  getLowestRetailPrice, 
  hasBuylistPrice, 
  formatPrice, 
  getColorName,
  getCardIdentifier,
  getCardColorScheme,
  getProviderDisplayName
} from '../../utils/cardUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { CardSet, CollectionCardEntry } from '../../types';

const CardGridView: React.FC<CardDisplayProps> = ({ 
  cards, 
  onAddCard, 
  actionLabel = "Add",
  showFoilOption = true,
  foilCardIds = new Set(),
  onToggleFoil = () => {}
}) => {
  const { resolvedTheme } = useTheme();
  const [selectedCard, setSelectedCard] = useState<CardSet | CollectionCardEntry | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
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

  // Handle card click in grid view
  const handleCardClick = (card: CardSet | CollectionCardEntry) => {
    setSelectedCard(card);
    const cardId = getCardIdentifier(card);
    setOpenPopoverId(openPopoverId === cardId ? null : cardId);
  };

  // Close the popover
  const closePopover = () => {
    setOpenPopoverId(null);
  };

  // Handle clicks outside the popover to close it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openPopoverId && popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        closePopover();
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openPopoverId]);

  // Handle quantity change for a card
  const handleQuantityChange = (card: CardSet | CollectionCardEntry, value: string) => {
    const numValue = parseInt(value, 10);
    const cardId = getCardIdentifier(card);
    
    if (!isNaN(numValue) && numValue >= 0) {
      setQuantities(prev => ({ ...prev, [cardId]: numValue }));
    }
  };

  // Increment quantity
  const incrementQuantity = (card: CardSet | CollectionCardEntry, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent popover trigger
    const cardId = getCardIdentifier(card);
    const currentQty = quantities[cardId] || 0;
    setQuantities(prev => ({ ...prev, [cardId]: currentQty + 1 }));
  };

  // Decrement quantity
  const decrementQuantity = (card: CardSet | CollectionCardEntry, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent popover trigger
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
    e.stopPropagation(); // Prevent popover trigger
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
    <SimpleGrid 
      columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
      gap={5}
      width="100%"
      justifyItems="center"
      position="relative"
    >
      {cards.map((card) => {
        const cardId = getCardIdentifier(card);
        // Use foilCardIds prop to determine if card is foil
        const isFoil = foilCardIds.has(card.uuid) || ('isFoil' in card && card.isFoil) || false;
        const canBeFoil = hasFoilPricing(card);
        const isFoilOnly = hasOnlyFoilPricing(card);
        return (
        <Box 
          key={cardId}
          position="relative" 
          width="250px"
          height="450px"
          maxWidth="100%"
        >
          <CardNamespace.Root 
            overflow="hidden" 
            cursor="pointer"
            transition="transform 0.2s"
            _hover={{ transform: "translateY(-4px)", boxShadow: "md" }}
            onClick={() => handleCardClick(card)}
            height="100%"
            width="100%"
            display="flex"
            flexDirection="column"
            border="1px solid"
            borderColor={isFoil 
              ? (resolvedTheme === 'dark' ? 'rgba(137, 207, 240, 0.5)' : 'rgba(183, 148, 244, 0.7)') 
              : (resolvedTheme === 'dark' ? 'gray.700' : 'gray.200')
            }
            borderRadius="md"
            position="relative"
            _before={isFoil ? {
              content: '""',
              position: 'absolute',
              top: '0',
              left: '0',
              width: '200%',
              height: '100%',
              backgroundImage: resolvedTheme === 'dark'
                ? 'linear-gradient(to right, transparent, rgba(137, 207, 240, 0.1), rgba(183, 148, 244, 0.1), rgba(137, 207, 240, 0.1), transparent)'
                : 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3), transparent)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '50% 100%',
              animation: "shimmer 4s infinite linear",
              zIndex: '1',
              pointerEvents: 'none',
            } : undefined}
            boxShadow={isFoil ? (resolvedTheme === 'dark' ? '0 0 15px rgba(137, 207, 240, 0.3)' : '0 0 15px rgba(183, 148, 244, 0.4)') : 'none'}
          >
            <Box 
              position="relative"
              width="100%"
              height="280px"
              overflow="hidden"
              bg={resolvedTheme === 'dark' ? 'gray.900' : 'gray.50'}
            >
              <Image 
                src={getImageUrl(card)}
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                p={1}
                objectFit="contain"
                objectPosition="center"
                loading="lazy"
                style={isFoil ? {
                  border: '1px solid',
                  borderColor: 'rgba(183, 148, 244, 0.7)',
                  boxShadow: resolvedTheme === 'dark'
                    ? '0 0 15px rgba(137, 207, 240, 0.3)'
                    : '0 0 15px rgba(183, 148, 244, 0.4)',
                  position: 'relative',
                  filter: resolvedTheme === 'dark'
                    ? 'contrast(1.05) brightness(1.1)'
                    : 'contrast(1.05) saturate(1.05)'
                } : {}}
                _before={isFoil ? {
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
                } : {}}
              />
            </Box>
            <CardNamespace.Body py={2} px={3} borderTopWidth="1px" flexGrow={1}>
              <Stack gap={1} width="100%">
                <Flex justify="space-between" align="center">
                  <Text 
                    fontSize="md" 
                    fontWeight="semibold" 
                    overflow="hidden" 
                    textOverflow="ellipsis" 
                    whiteSpace="nowrap"
                    maxWidth="calc(100% - 24px)"
                  >
                    {card.name}
                    {isFoil && <Text as="span" fontSize="xs" color="gray.500" fontWeight="normal" ml={1}>(Foil)</Text>}
                  </Text>
                  <Flex direction="column" alignItems="center" justifyContent="center">
                    <Box 
                      className={`ss ss-grad ss-2x ss-${card.setCode.toLocaleLowerCase()} ss-${card.rarity}`}
                      style={{
                        filter: "drop-shadow(0px 0px 2px rgba(0,0,0,0.8))",
                        WebkitBackfaceVisibility: "hidden",
                        MozBackfaceVisibility: "hidden",
                        backfaceVisibility: "hidden"
                      }}
                    />
                  </Flex>
                </Flex>
                <Flex justify="space-between" align="center" mt={0}>
                  <Text fontSize="xs" color="gray.500">
                    {card.number} · {getColorName(card.colors)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">{card.rarity}</Text>
                </Flex>
                <Flex align="center" gap={1} mt={1}>
                  <Text fontSize="xs" whiteSpace="nowrap" fontWeight="medium">
                    {formatPrice(getLowestRetailPrice(card, isFoil))} - {formatPrice(getHighestRetailPrice(card, isFoil))}
                  </Text>
                  {hasBuylistPrice(card, isFoil) && (
                    <Icon as={FaDollarSign} color="green.500" ml={1} />
                  )}
                </Flex>
                <Box mt={2}>
                  <Flex alignItems="center" mb={2}>
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
                      onClick={(e) => e.stopPropagation()} // Prevent popover trigger
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
                  {showFoilOption && (
                    <Flex mb={2} alignItems="center">
                      <Checkbox 
                        size="sm" 
                        checked={foilCardIds.has(card.uuid) || ('isFoil' in card && card.isFoil) || isFoilOnly}
                        onCheckedChange={(e) => {
                          handleFoilChange(card, !!e.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={!canBeFoil || isFoilOnly}
                      >
                        Foil {!canBeFoil && "(N/A)"}
                        {isFoilOnly && "(Only)"}
                      </Checkbox>
                    </Flex>
                  )}
                  <Button 
                    size="xs" 
                    color="white"
                    onClick={(e) => handleAddCard(card, e)}
                    width="100%"
                    disabled={
                      (actionLabel === "Add" && (quantities[cardId] || 0) <= 0) || 
                      (actionLabel === "Update" && !hasQuantityChanged(card))
                    }
                  >
                    {actionLabel}
                  </Button>
                </Box>
              </Stack>
            </CardNamespace.Body>
          </CardNamespace.Root>

          {/* Separate popover from card to fix positioning */}
          {openPopoverId === cardId && (
            <Box
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              zIndex={1000}
              display="flex"
              justifyContent="center"
              alignItems="center"
              onClick={(e) => {
                // Close when clicking the overlay
                if (e.target === e.currentTarget) {
                  closePopover();
                }
              }}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(3px)'
              }}
            >
              <Box
                ref={popoverRef}
                bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'}
                color={resolvedTheme === 'dark' ? 'white' : 'gray.800'}
                width="550px" // Increased width from 500px to 550px
                maxWidth="95vw"
                maxHeight="95vh" // Increased from 90vh to 95vh
                overflowY="auto"
                overflowX="hidden" // Add this to prevent horizontal scroll
                boxShadow="xl"
                border={isFoil 
                  ? `1px solid ${resolvedTheme === 'dark' ? 'rgba(137, 207, 240, 0.5)' : 'rgba(183, 148, 244, 0.7)'}` 
                  : `1px solid ${resolvedTheme === 'dark' ? '#4A5568' : '#E2E8F0'}`
                }
                borderRadius="md"
                position="relative"
                style={{
                  WebkitBackfaceVisibility: "hidden",
                  MozBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden"
                }}
                _before={isFoil ? {
                  content: '""',
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0', // Use left/right instead of width
                  bottom: '0', // Use top/bottom instead of height
                  backgroundImage: resolvedTheme === 'dark'
                    ? 'linear-gradient(to right, transparent, rgba(137, 207, 240, 0.1), rgba(183, 148, 244, 0.1), rgba(137, 207, 240, 0.1), transparent)'
                    : 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3), transparent)',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '200% 100%', // Background is twice the width but element is contained
                  animation: "shimmer 4s infinite linear",
                  zIndex: '1',
                  pointerEvents: 'none',
                } : undefined}
              >
                {/* Close button - moved to top-left */}
                <IconButton
                  aria-label="Close popover"
                  color="grey"
                  size="sm"
                  position="absolute"
                  left={2}
                  top={3}
                  zIndex={2}
                  onClick={closePopover}
                  bg="transparent"
                  _hover={{
                    bg: resolvedTheme === 'dark' ? 'gray.700' : 'gray.100'
                  }}
                >
                    <FaTimes />
                </IconButton>
                
                <Box
                  fontWeight="bold" 
                  borderBottomWidth="1px" 
                  p={4} 
                  ml={3}
                  pl={10} // Added left padding to make space for close button
                  fontSize="xl"
                  position="relative"
                  bg={resolvedTheme === 'dark' ? 'gray.900' : 'gray.50'}
                >
                  {card.name}
                  {isFoil && <Text as="span" fontSize="lg" color="gray.500" fontWeight="normal" ml={1}>(Foil)</Text>}
                  <Flex 
                    position="absolute" 
                    right={4} // Adjusted position since close button moved to left
                    top="50%" 
                    transform="translateY(-50%)" 
                    alignItems="center"
                  >
                    <Box 
                      className={`ss ss-grad ss-3x ss-${card.setCode.toLocaleLowerCase()} ss-${card.rarity}`}
                      style={{
                        filter: "drop-shadow(0px 0px 2px rgba(0,0,0,0.8))",
                        transform: "scale(1.1)",
                        WebkitBackfaceVisibility: "hidden",
                        MozBackfaceVisibility: "hidden",
                        backfaceVisibility: "hidden"
                      }}
                    />
                  </Flex>
                </Box>
                
                <Box p={4}>
                  <Flex direction="column" gap={4}>
                    <Flex gap={6} flexWrap={{base: "wrap", md: "nowrap"}}>
                      {/* Left side - Image - Made larger with no hover effect */}
                      <Box 
                        width={{base: "100%", md: "250px"}} // Increased from 200px to 250px
                        minWidth={{base: "100%", md: "250px"}} // Increased from 200px to 250px
                        height={{base: "350px", md: "350px"}} // Increased from 280px to 350px
                        position="relative"
                        display="flex"
                        justifyContent="center"
                        mb={{base: 4, md: 0}}
                      >
                        <Image 
                          src={getImageUrl(card)} 
                          borderRadius="13px" 
                          height="100%" 
                          width="100%"
                          objectFit="contain"
                          boxShadow="md"
                          style={isFoil ? {
                            border: '1px solid',
                            borderColor: 'rgba(183, 148, 244, 0.7)',
                            boxShadow: resolvedTheme === 'dark'
                              ? '0 0 15px rgba(137, 207, 240, 0.3)'
                              : '0 0 15px rgba(183, 148, 244, 0.4)',
                            position: 'relative',
                            filter: resolvedTheme === 'dark'
                              ? 'contrast(1.05) brightness(1.1)'
                              : 'contrast(1.05) saturate(1.05)'
                          } : {}}
                          _before={isFoil ? {
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
                            borderRadius: '13px',
                            mixBlendMode: 'soft-light',
                            zIndex: 3,
                            animation: 'cardShimmer 6s infinite ease-in-out',
                            pointerEvents: 'none',
                          } : {}}
                        />
                      </Box>
                      
                      {/* Right side - Card details */}
                      <Stack flex="1" gap={3} width={{base: "100%", md: "auto"}}>
                        <Flex gap={2} wrap="wrap">
                          <Text fontSize="md" fontWeight="bold">Colors:</Text>
                          <Badge fontSize="sm" colorScheme={getCardColorScheme(card.colors)}>
                            {getColorName(card.colors)}
                          </Badge>
                        </Flex>
                        
                        {card.manaCost && (
                          <Flex align="center" gap={1} flexWrap="wrap">
                            <Text fontSize="md" fontWeight="bold" marginRight={1}>Mana Cost:</Text>
                            <Box display="flex" alignItems="center" flexWrap="wrap">
                              {card.manaCost.match(/{[^}]+}/g)?.map((symbol, idx) => (
                                <Image 
                                  key={idx}
                                  src={getSymbolUrl(symbol)}
                                  alt={symbol}
                                  width="20px"
                                  height="20px"
                                />
                              ))}
                            </Box>
                          </Flex>
                        )}
                        
                        <Text fontSize="md"><strong>Type:</strong> {card.type}</Text>
                        
                        {card.power && card.toughness && (
                          <Text fontSize="md"><strong>P/T:</strong> {card.power}/{card.toughness}</Text>
                        )}
                        
                        {card.text && (
                          <Box>
                            <Text fontSize="md" fontWeight="bold" mb={1}>Card Text:</Text>
                            <Box 
                              pl={2} 
                              py={2}
                              fontSize="md"
                              borderLeftWidth="2px"
                              borderColor={resolvedTheme === 'dark' ? 'blue.700' : 'blue.200'}
                            >
                              {card.text.split(/({[^}]+})/g).map((segment, idx) => {
                                if (segment.match(/^{[^}]+}$/)) {
                                  return (
                                    <Image 
                                      key={idx}
                                      display="inline-block"
                                      src={getSymbolUrl(segment)}
                                      alt={segment}
                                      width="18px"
                                      height="18px"
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
                            </Box>
                          </Box>
                        )}
                        
                        {card.flavorText && (
                          <Text 
                            fontSize="md" 
                            fontStyle="italic" 
                            pt={1} 
                            color={resolvedTheme === 'dark' ? 'gray.300' : 'gray.600'}
                          >
                            {card.flavorText}
                          </Text>
                        )}
                        
                        <Stack gap={1} mt={2}>
                          <Text fontSize="md"><strong>Set:</strong> {card.setCode.toUpperCase()}</Text>
                          <Text fontSize="md"><strong>Rarity:</strong> {card.rarity}</Text>
                          <Text fontSize="md"><strong>Number:</strong> {card.number}</Text>
                          {card.artist && (
                            <Text fontSize="md"><strong>Artist:</strong> {card.artist}</Text>
                          )}
                        </Stack>
                      </Stack>
                    </Flex>
                    
                    {/* Pricing information - Bottom section */}
                    <Box 
                      mt={4} 
                      pt={4}
                      borderTopWidth="1px" 
                      borderColor={resolvedTheme === 'dark' ? 'gray.700' : 'gray.200'}
                    >
                      <Flex gap={4} justifyContent="space-between" flexWrap={{base: "wrap", md: "nowrap"}}>
                        {/* Retail Prices */}
                        {((isFoil && card.pricing?.retail?.foil && Object.keys(card.pricing.retail.foil).length > 0) ||
                          (!isFoil && card.pricing?.retail?.normal && Object.keys(card.pricing.retail.normal).length > 0)) && (
                          <Box flex="1" width={{base: "100%", md: "auto"}}>
                            <Text fontSize="md" fontWeight="bold" mb={2}>
                              Retail Prices{isFoil ? ' (Foil)' : ''}:
                            </Text>
                            <Stack gap={2}>
                              {isFoil && card.pricing?.retail?.foil ? (
                                Object.entries(card.pricing.retail.foil).map(([provider, price], idx) => (
                                  price !== undefined && (
                                    <Flex key={idx} justify="space-between">
                                      <Text fontSize="md">
                                        <strong>{getProviderDisplayName(provider)}:</strong>
                                      </Text>
                                      <Text fontSize="md" fontWeight="medium">{formatPrice(price)}</Text>
                                    </Flex>
                                  )
                                ))
                              ) : (
                                card.pricing?.retail?.normal && Object.entries(card.pricing.retail.normal).map(([provider, price], idx) => (
                                  price !== undefined && (
                                    <Flex key={idx} justify="space-between">
                                      <Text fontSize="md">
                                        <strong>{getProviderDisplayName(provider)}:</strong>
                                      </Text>
                                      <Text fontSize="md" fontWeight="medium">{formatPrice(price)}</Text>
                                    </Flex>
                                  )
                                ))
                              )}
                            </Stack>
                          </Box>
                        )}
                        
                        {/* Buylist Prices */}
                        {((isFoil && card.pricing?.buylist?.foil && Object.keys(card.pricing.buylist.foil).length > 0) ||
                          (!isFoil && card.pricing?.buylist?.normal && Object.keys(card.pricing.buylist.normal).length > 0)) && (
                          <Box 
                            flex="1"
                            p={3}
                            borderRadius="md"
                            bg={resolvedTheme === 'dark' ? 'gray.700' : 'green.50'}
                            borderColor={resolvedTheme === 'dark' ? 'green.500' : 'green.200'}
                            borderWidth="1px"
                            width={{base: "100%", md: "auto"}}
                            mt={{base: 2, md: 0}}
                          >
                            <Text fontSize="md" fontWeight="bold" mb={2} color="green.500">
                              <Flex align="center" gap={1}>
                                <Icon as={FaDollarSign} /> Buylist Prices{isFoil ? ' (Foil)' : ''}
                              </Flex>
                            </Text>
                            <Stack gap={2}>
                              {isFoil && card.pricing?.buylist?.foil ? (
                                Object.entries(card.pricing.buylist.foil).map(([provider, price], idx) => (
                                  price !== undefined && (
                                    <Flex key={idx} justify="space-between">
                                      <Text fontSize="md">
                                        <strong>{getProviderDisplayName(provider)}:</strong>
                                      </Text>
                                      <Text fontSize="md" fontWeight="medium" color="green.500">{formatPrice(price)}</Text>
                                    </Flex>
                                  )
                                ))
                              ) : (
                                card.pricing?.buylist?.normal && Object.entries(card.pricing.buylist.normal).map(([provider, price], idx) => (
                                  price !== undefined && (
                                    <Flex key={idx} justify="space-between">
                                      <Text fontSize="md">
                                        <strong>{getProviderDisplayName(provider)}:</strong>
                                      </Text>
                                      <Text fontSize="md" fontWeight="medium" color="green.500">{formatPrice(price)}</Text>
                                    </Flex>
                                  )
                                ))
                              )}
                            </Stack>
                          </Box>
                        )}
                      </Flex>
                      
                      {/* Add to collection button */}
                      <Flex mt={6} gap={3} alignItems="center" justifyContent="flex-end">
                        <Flex alignItems="center">
                          <IconButton
                            aria-label="Decrease quantity"
                            size="sm"
                            variant="outline"
                            onClick={(e) => decrementQuantity(card, e)}
                            disabled={(quantities[cardId] || 0) <= 0}
                          >
                            <FaMinus />
                        </IconButton>
                          <Input
                            size="sm"
                            width="50px"
                            textAlign="center"
                            value={quantities[cardId] || 0}
                            onChange={(e) => handleQuantityChange(card, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            mx={2}
                          />
                          <IconButton
                            aria-label="Increase quantity"
                            size="sm"
                            variant="outline"
                            onClick={(e) => incrementQuantity(card, e)}
                          >
                            <FaPlus />
                        </IconButton>
                        </Flex>
                        {showFoilOption && (
                          <Checkbox 
                            size="md" 
                            checked={foilCardIds.has(card.uuid) || ('isFoil' in card && card.isFoil) || isFoilOnly}
                            onCheckedChange={(e) => {
                              handleFoilChange(card, !!e.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={!canBeFoil || isFoilOnly}
                            mr={2}
                          >
                            Foil {!canBeFoil && "(N/A)"}
                            {isFoilOnly && "(Only)"}
                          </Checkbox>
                        )}
                        <Button 
                          color="white"
                          size="md" 
                          onClick={(e) => handleAddCard(card, e)}
                          disabled={
                            (actionLabel === "Add" && (quantities[cardId] || 0) <= 0) || 
                            (actionLabel === "Update" && !hasQuantityChanged(card))
                          }
                          minWidth="150px"
                        >
                          {actionLabel}
                        </Button>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )})}
    </SimpleGrid>
  );
};

export default CardGridView;
