import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import { useTheme } from 'next-themes';

export const AddCard = () => {
  const { resolvedTheme } = useTheme();
  
  return (
    <Box bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'} color={resolvedTheme === 'dark' ? 'white' : 'gray.800'} borderRadius="lg" padding="6" boxShadow="sm" width="full">
      <Stack gap="6">
        <Heading size="lg">Add Card</Heading>
        <hr />
        <Text>Card entry form will go here.</Text>
      </Stack>
    </Box>
  );
};
