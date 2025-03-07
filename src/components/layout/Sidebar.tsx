import { Box, Button, Flex, Icon, Stack } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { LuMoon, LuSun } from 'react-icons/lu';
import { NavItemType } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  activeNav: string;
  setActiveNav: (id: string) => void;
  navItems: NavItemType[];
}

export const Sidebar = ({ isOpen, activeNav, setActiveNav, navItems }: SidebarProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Box
      as="aside"
      bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'}
      width={{ base: 'full', lg: '280px' }}
      position={{ base: 'absolute', lg: 'relative' }}
      h="full"
      display={{ base: isOpen ? 'block' : 'none', lg: 'block' }}
      borderRightWidth="1px"
      borderRightColor={resolvedTheme === 'dark' ? 'gray.700' : 'gray.200'}
      zIndex="2"
      overflowY="auto"
      flexShrink="0"
    >
      <Flex direction="column" height="full" padding="4">
        <Stack gap="1">
          {navItems.map(item => (
            <NavItem key={item.id} item={item} isActive={activeNav === item.id} onClick={() => setActiveNav(item.id)} />
          ))}
        </Stack>
        <Button
          variant="ghost"
          justifyContent="flex-start"
          width="full"
          padding="4"
          borderRadius="md"
          onClick={toggleTheme}
          marginTop="auto"
          bg={resolvedTheme === 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'}
          color={resolvedTheme === 'dark' ? 'gray.300' : 'gray.700'}
          _hover={{
            bg: resolvedTheme === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200'
          }}
        >
          <Icon 
            boxSize="5" 
            as={resolvedTheme === 'dark' ? LuSun : LuMoon} 
            mr="2"
          />
          {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </Flex>
    </Box>
  );
};

const NavItem = ({ item, isActive, onClick }: { item: NavItemType; isActive: boolean; onClick: () => void }) => {
  const { resolvedTheme } = useTheme();
  
  return (
    <Button 
      variant="ghost"
      justifyContent="flex-start"
      width="full"
      padding="4"
      borderRadius="md"
      bg={isActive ? (resolvedTheme === 'dark' ? 'blue.900' : 'blue.50') : 'transparent'}
      borderLeftWidth={isActive ? '4px' : '0px'}
      borderLeftColor="blue.500"
      color={isActive ? (resolvedTheme === 'dark' ? 'blue.200' : 'blue.600') : undefined}
      _hover={{ bg: resolvedTheme === 'dark' ? 'whiteAlpha.200' : 'gray.100' }}
      onClick={onClick}
    >
      <Icon boxSize="5" as={item.icon} mr="2" /> {item.label}
    </Button>
  );
};
