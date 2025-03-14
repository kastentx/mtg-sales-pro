import { Box, Button, Heading, Stack, Text, VStack, HStack, Input } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { useCollection } from '../contexts/CollectionContext';
import { useCardData } from '../contexts/CardDataContext';
import { useState, useRef } from 'react';
import { toaster } from '@/components/ui/toaster';
import { CollectionCardEntry } from '@/contexts/CollectionContext';
import { getCardIdentifier } from '@/utils/cardUtils'; // Import the getCardIdentifier function

export const ImportExport = () => {
  const { resolvedTheme } = useTheme();
  const { collectionCards, clearCollection, addCardToCollection } = useCollection();
  const { fetchCardsByUuids } = useCardData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('collection');

  // Function to convert collection to CSV
  const collectionToCSV = () => {
    if (collectionCards.length === 0) {
      return '';
    }
    
    // Get all possible keys from all cards
    const allKeys = new Set<string>();
    collectionCards.forEach(card => {
      Object.keys(card).forEach(key => allKeys.add(key));
    });
    
    // Always include quantity and make sure it's at the end
    allKeys.delete('quantity');
    // Add cardIdentifier to the keys
    allKeys.add('cardIdentifier');
    const keys = [...allKeys].sort();
    keys.push('quantity');
    
    // CSV header
    const header = keys.join(',');
    
    // CSV rows
    const rows = collectionCards.map(card => {
      return keys.map(key => {
        // Generate card identifier if the key is cardIdentifier
        if (key === 'cardIdentifier') {
          return `"${getCardIdentifier(card)}"`;
        }
        
        // Use empty string for undefined values
        const value = card[key as keyof typeof card];
        // Escape commas within fields
        return value !== undefined ? `"${String(value).replace(/"/g, '""')}"` : '';
      }).join(',');
    });
    
    return header + '\n' + rows.join('\n');
  };

  // Function to handle export
  const handleExport = () => {
    if (collectionCards.length === 0) {
      toaster.create({
        title: 'No cards to export',
        description: 'Your collection is empty',
        type: 'warning',
      });
      return;
    }

    const csv = collectionToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toaster.create({
      title: 'Export successful',
      description: 'Your collection has been exported to CSV',
      type: 'success',
    });
  };

  // Updated function to parse CSV for IDs and quantities
  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }
    
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Check for identifiers - either cardIdentifier (preferred) or fall back to uuid
    const cardIdentifierIndex = headers.findIndex(h => h === 'cardIdentifier');
    const uuidIndex = headers.findIndex(h => h === 'uuid');
    
    if (cardIdentifierIndex === -1 && uuidIndex === -1) {
      throw new Error('CSV file must contain either a "cardIdentifier" or "uuid" column');
    }
    
    // Find quantity index (default to 1 if not found)
    const quantityIndex = headers.findIndex(h => h === 'quantity');
    
    // Extract card data from CSV
    const cardImportData: {uuid: string, quantity: number, isFoil: boolean}[] = [];
    
    lines.slice(1).filter(line => line.trim() !== '').forEach(line => {
      // Handle quoted fields with commas correctly
      const values: string[] = [];
      let inQuotes = false;
      let currentValue = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      values.push(currentValue); // Add the last value
      
      let uuid: string | undefined;
      let isFoil = false;
      
      // Get card identifier or uuid
      if (cardIdentifierIndex !== -1) {
        const identifier = values[cardIdentifierIndex]?.replace(/"/g, '');
        if (identifier) {
          // Parse the identifier to extract uuid and foil status
          const identifierParts = identifier.split('_');
          if (identifierParts.length >= 3) {
            uuid = identifierParts[0];
            isFoil = identifierParts[identifierParts.length - 1] === 'foil';
          }
        }
      } else if (uuidIndex !== -1) {
        // Fallback to just using uuid (with no foil information)
        uuid = values[uuidIndex]?.replace(/"/g, '');
      }
      
      if (uuid) {
        const quantity = quantityIndex !== -1 && values[quantityIndex] 
          ? parseInt(values[quantityIndex].replace(/"/g, ''), 10) 
          : 1;
        
        cardImportData.push({ uuid, quantity, isFoil });
      }
    });
    
    return cardImportData;
  };

  // Updated function to handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedCards = parseCSV(csvText);
        
        if (!parsedCards.length) {
          throw new Error('No valid cards found in the CSV file');
        }
        
        // Extract UUIDs to send to backend
        const uuids = [...new Set(parsedCards.map(card => card.uuid))];
        
        // Create a map using both UUID and foil status for unique identification
        const importDataByKey = new Map(
          parsedCards.map(card => [
            `${card.uuid}_${card.isFoil ? 'foil' : 'normal'}`, 
            { quantity: card.quantity, isFoil: card.isFoil }
          ])
        );
        
        // Fetch full card data from backend using the context function
        const cardData = await fetchCardsByUuids(uuids);
        
        if (!cardData || !Array.isArray(cardData)) {
          throw new Error('Invalid response from server');
        }
        
        // Clear existing collection before importing
        clearCollection();
        
        // Process each card from the backend
        for (const card of cardData) {
          const normalKey = `${card.uuid}_normal`;
          const foilKey = `${card.uuid}_foil`;
          
          // Check for normal version
          const normalData = importDataByKey.get(normalKey);
          if (normalData) {
            // Use the explicit isFoil=false parameter to ensure it's treated as non-foil
            addCardToCollection({...card}, normalData.quantity, false);
          }
          
          // Check for foil version
          const foilData = importDataByKey.get(foilKey);
          if (foilData) {
            // Use the explicit isFoil=true parameter to ensure it's treated as foil
            addCardToCollection({...card}, foilData.quantity, true);
          }
        }
        
        toaster.create({
          title: 'Import successful',
          description: `Imported ${parsedCards.length} cards to your collection`,
          type: 'success',
        });
      } catch (error) {
        toaster.create({
          title: 'Import failed',
          description: error instanceof Error ? error.message : 'Failed to parse CSV file',
          type: 'error',
        });
      }
    };
    
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box 
      bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'} 
      color={resolvedTheme === 'dark' ? 'white' : 'gray.800'} 
      borderRadius="lg" 
      padding="6" 
      boxShadow="sm" 
      width="full"
    >
      <Stack gap="6">
        <Heading size="lg">Import/Export Collection</Heading>
        <hr />
        
        <VStack align="start" gap="6">
          <Box width="full">
            <Heading size="md" mb="4">Export Collection</Heading>
            <Text mb="4">Export your card collection to a CSV file that you can save or share.</Text>
            <VStack align="start" gap={2}>
              <Text fontWeight="medium">File name</Text>
              <HStack width="full">
                <Input 
                  value={fileName} 
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="collection"
                  maxW="300px"
                />
                <Button 
                  colorScheme="blue"
                  onClick={handleExport}
                >
                  Export to CSV
                </Button>
              </HStack>
            </VStack>
          </Box>

          <Box width="full">
            <Heading size="md" mb="4">Import Collection</Heading>
            <Text mb="4">Import cards from a CSV file. This will replace your current collection.</Text>
            <Stack direction="row" gap={4}>
              <Input
                type="file"
                accept=".csv"
                onChange={handleImport}
                ref={fileInputRef}
                display="none"
                id="file-upload"
              />
              <Button
                colorScheme="green"
                variant="solid"
                cursor="pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                Select CSV File
              </Button>
            </Stack>
          </Box>
        </VStack>
      </Stack>
    </Box>
  );
};
