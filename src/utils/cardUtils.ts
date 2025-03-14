import { CardSet, CollectionCardEntry } from '../types';

export enum ImageVariant {
  Small = 'small',
  Normal = 'normal',
  Large = 'large',
  Png = 'png',
  BorderCrop = 'border_crop',
  ArtCrop = 'art_crop',
}

/**
 * Converts a mana symbol notation to a Scryfall SVG URL
 */
export const getSymbolUrl = (symbol: string): string => {
  // Remove curly braces and ensure the symbol is properly formatted for the URL
  const cleanSymbol = symbol
    .replace('{', '')
    .replace('/', '')
    .replace('}', '')
  return `https://svgs.scryfall.io/card-symbols/${cleanSymbol}.svg`;
};

/**
 * Gets the image URL for a card
 */
export const getImageUrl = (card: CardSet, variant: ImageVariant = ImageVariant.Normal): string => {
  return `https://api.scryfall.com/cards/${card.setCode}/${card.number}?format=image`;
};

/**
 * Gets the highest retail price for a card
 */
export const getHighestRetailPrice = (card: CardSet, isFoil: boolean = false) => {
  const prices = isFoil && card.pricing?.retail?.foil
    ? card.pricing.retail.foil
    : card.pricing?.retail?.normal;
  
  if (!prices) return null;
  
  const values = Object.values(prices).filter(price => price !== undefined && price > 0);
  if (values.length === 0) return null;
  
  return Math.max(...values);
};

/**
 * Gets the lowest retail price for a card
 */
export const getLowestRetailPrice = (card: CardSet, isFoil: boolean = false) => {
  const prices = isFoil && card.pricing?.retail?.foil
    ? card.pricing.retail.foil
    : card.pricing?.retail?.normal;
  
  if (!prices) return null;
  
  const values = Object.values(prices).filter(price => price !== undefined && price > 0);
  if (values.length === 0) return null;
  
  return Math.min(...values);
};

/**
 * Checks if a card has any buylist prices
 */
export const hasBuylistPrice = (card: CardSet, isFoil: boolean = false) => {
  const buylist = isFoil && card.pricing?.buylist?.foil
    ? card.pricing.buylist.foil
    : card.pricing?.buylist?.normal;
  
  if (!buylist) return false;
  
  return Object.values(buylist).some(price => price !== undefined && price > 0);
};

/**
 * Formats a price value for display
 */
export const formatPrice = (price: number | null) => {
  if (price === null) return '-';
  return `$${price.toFixed(2)}`;
};

/**
 * Gets a readable color name from color codes
 */
export const getColorName = (colors: string | string[] | undefined): string => {
  if (!colors) return 'Colorless';
  
  // Handle array of colors
  if (Array.isArray(colors)) {
    if (colors.length === 0) return 'Colorless';
    if (colors.length > 1) return 'Multicolored';
    
    // Single color in array
    const color = colors[0].toUpperCase();
    return mapColorToName(color);
  }
  
  // Handle string of colors (comma-separated or single)
  if (typeof colors === 'string') {
    if (!colors.trim()) return 'Colorless';
    
    const colorArray = colors.split(',').map(c => c.trim());
    if (colorArray.length > 1) return 'Multicolored';
    
    // Single color as string
    return mapColorToName(colorArray[0]);
  }
  
  return 'Colorless';
};

/**
 * Maps a color code to its name
 */
export const mapColorToName = (color: string): string => {
  switch (color.toUpperCase()) {
    case 'W': return 'White';
    case 'U': return 'Blue';
    case 'B': return 'Black';
    case 'R': return 'Red';
    case 'G': return 'Green';
    default: return color || 'Colorless';
  }
};

/**
 * Generates a unique identifier for a card including foil status
 */
export const getCardIdentifier = (card: CardSet | CollectionCardEntry, isFoil?: boolean): string => {
  // Use the card's own foil status if it's a CollectionCardEntry and isFoil isn't provided
  const foilStatus = 
    isFoil !== undefined ? isFoil : 
    ('isFoil' in card ? !!card.isFoil : false);
    
  return `${card.uuid}_${card.setCode}_${foilStatus ? 'foil' : 'normal'}`;
};

/**
 * Determines the Chakra color scheme based on card color
 */
export const getCardColorScheme = (colors: string | string[] | undefined) => {
  const colorName = getColorName(colors);
  switch (colorName) {
    case 'White': return 'yellow';
    case 'Blue': return 'blue';
    case 'Black': return 'gray';
    case 'Red': return 'red';
    case 'Green': return 'green';
    case 'Multicolored': return 'purple';
    default: return 'gray';
  }
};

/**
 * Gets a formatted display name for pricing providers
 */
export const getProviderDisplayName = (provider: string): string => {
  switch (provider) {
    case 'tcgplayer': return 'TCGPlayer';
    case 'cardkingdom': return 'Card Kingdom';
    case 'cardsphere': return 'Card Sphere';
    case 'cardmarket': return 'Card Market';
    default: return provider;
  }
};
