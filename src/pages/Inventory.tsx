import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import { useTheme } from 'next-themes';

export const Inventory = () => {
  const { resolvedTheme } = useTheme();
  
  return (
    <Box bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'} color={resolvedTheme === 'dark' ? 'white' : 'gray.800'} borderRadius="lg" padding="6" boxShadow="sm" width="full">
      <Stack gap="6">
        <Heading size="lg">Inventory</Heading>
        <hr />
        <Text>Your card inventory will be displayed here.</Text>
      </Stack>
    </Box>
  );
};
