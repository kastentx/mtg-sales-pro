import { Box, Heading, Stack, Text, Circle, HStack, IconButton } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { useBackendStatus } from '../contexts/BackendStatusContext';
import { FiRefreshCw } from 'react-icons/fi';

export const MarketData = () => {
  const { resolvedTheme } = useTheme();
  const { isConnected, checkStatus } = useBackendStatus();

  return (
    <Box bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'} color={resolvedTheme === 'dark' ? 'white' : 'gray.800'} borderRadius="lg" padding="6" boxShadow="sm" width="full">
      <Stack gap="6">
        <HStack justify="space-between">
          <Heading size="lg">Market Data</Heading>
          <HStack gap={2}>
            <Circle size="10px" bg={isConnected ? 'green.500' : 'red.500'} />
            <Text fontSize="sm">{isConnected ? 'Connected' : 'Disconnected'}</Text>
            <IconButton
              aria-label="Refresh connection status"
              size="sm"
              onClick={() => checkStatus()}
            >
              <FiRefreshCw />
            </IconButton>
          </HStack>
        </HStack>
        <hr />
        <Stack gap="4">
          <Text>View and analyze market data for your cards.</Text>
          <Box borderWidth="1px" borderRadius="md" padding="4" bg={resolvedTheme === 'dark' ? 'gray.700' : 'gray.50'}>
            <Stack gap="4">
              <Heading size="md">Market Analysis</Heading>
              <Text>Market data features coming soon...</Text>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
