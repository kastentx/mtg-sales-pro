import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import { useTheme } from 'next-themes';

export const ImportExport = () => {
  const { resolvedTheme } = useTheme();
  
  return (
    <Box bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'} color={resolvedTheme === 'dark' ? 'white' : 'gray.800'} borderRadius="lg" padding="6" boxShadow="sm" width="full">
      <Stack gap="6">
        <Heading size="lg">Import/Export</Heading>
        <hr />
        <Text>Import and export tools will be placed here.</Text>
      </Stack>
    </Box>
  );
};
