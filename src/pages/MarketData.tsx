import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { useTheme } from 'next-themes';

export const MarketData = () => {
  const { resolvedTheme } = useTheme();
  
  return (
    <Box bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'} color={resolvedTheme === 'dark' ? 'white' : 'gray.800'} borderRadius="lg" padding="6" boxShadow="sm" width="full">
      <Stack gap="6">
        <Heading size="lg">Market Data</Heading>
        <hr />
        <Stack gap="4">
          <Text>Download, parse, and refresh market data for your cards.</Text>
          <Box borderWidth="1px" borderRadius="md" padding="4" bg={resolvedTheme === 'dark' ? 'gray.700' : 'gray.50'}>
            <Stack gap="4">
              <Heading size="md">Data Source</Heading>
              <Text>Status: No data downloaded</Text>
              <Button colorScheme="blue">Download Latest Data</Button>
            </Stack>
          </Box>
          <Box borderWidth="1px" borderRadius="md" padding="4" bg={resolvedTheme === 'dark' ? 'gray.700' : 'gray.50'}>
            <Stack gap="4">
              <Heading size="md">Refresh Prices</Heading>
              <Text>Last updated: Never</Text>
              <Button colorScheme="green" isDisabled>Refresh Prices</Button>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
