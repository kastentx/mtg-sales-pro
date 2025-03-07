import { Flex, Heading, Stack, IconButton } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { useTheme } from 'next-themes';

interface HeaderProps {
  onToggleNav: () => void;
}

export const Header = ({ onToggleNav }: HeaderProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Flex 
      as="header"
      bg={resolvedTheme === 'dark' ? 'gray.800' : 'blue.600'}
      color="white"
      padding="4"
      align="center"
      justify="space-between"
      boxShadow="md"
      width="100%"
    >
      <Flex align="center" gap="4">
        <IconButton
          display={{ base: 'flex', lg: 'none' }}
          aria-label="Menu"
          variant="ghost" 
          bg={resolvedTheme === 'dark' ? 'gray.700' : 'blue.700'}
          color="white"
          onClick={onToggleNav}
        >
          <FiMenu />
        </IconButton>
        <Heading size="md">MTG Sales Pro</Heading>
      </Flex>
      <Stack direction="row" gap="4">
        {/* Header actions will go here */}
      </Stack>
    </Flex>
  );
};
