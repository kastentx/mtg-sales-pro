import { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  Button,
  Icon,
  IconButton
} from '@chakra-ui/react';
import { FiDatabase, FiPlusCircle, FiFileText, FiMenu, FiTrendingUp } from 'react-icons/fi';

// Define the type for navigation items
interface NavItemType {
  id: string;
  label: string;
  icon: React.ComponentType;
}

// Define props for the NavItem component
interface NavItemProps {
  item: NavItemType;
}

function App() {
  const [activeNav, setActiveNav] = useState('add-card');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems: NavItemType[] = [
    { id: 'inventory', label: 'Inventory', icon: FiDatabase },
    { id: 'add-card', label: 'Add Card', icon: FiPlusCircle },
    { id: 'market-data', label: 'Market Data', icon: FiTrendingUp },
    { id: 'import-export', label: 'Import/Export', icon: FiFileText },
  ];

  // Navigation item component
  const NavItem = ({ item }: NavItemProps) => (
    <Button 
      variant="ghost"
      justifyContent="flex-start"
      width="full"
      padding="4"
      borderRadius="md"
      bg={activeNav === item.id ? 'blue.50' : 'transparent'}
      borderLeftWidth={activeNav === item.id ? '4px' : '0px'}
      borderLeftColor="blue.500"
      color={activeNav === item.id ? 'blue.600' : undefined}
      _hover={{ bg: 'gray.100' }}
      onClick={() => setActiveNav(item.id)}
    >
      <Icon boxSize="5" as={item.icon} /> {item.label}
    </Button>
  );

  return (
    <Flex h="100vh" direction="column" width="100vw">
      {/* Header */}
      <Flex 
        as="header"
        bg="blue.600" 
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
            bg="blue.700"
            color="white"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          >
            <FiMenu />
          </IconButton>
          <Heading size="md">MTG Sales Pro</Heading>
        </Flex>
        <Stack direction="row" gap="4">
          {/* Header actions will go here */}
        </Stack>
      </Flex>

      {/* Main content area with sidebar */}
      <Flex 
        flex="1" 
        overflow="hidden" 
        position="relative"
        width="100%"
      >
        {/* Sidebar */}
        <Box
          as="aside"
          bg="white"
          width={{ base: 'full', lg: '280px' }}
          position={{ base: 'absolute', lg: 'relative' }}
          h="full"
          display={{ base: isMobileNavOpen ? 'block' : 'none', lg: 'block' }}
          borderRightWidth="1px"
          borderRightColor="gray.200"
          zIndex="2"
          overflowY="auto"
          flexShrink="0"
        >
          <Stack gap="1" padding="4">
            {navItems.map(item => (
              <NavItem key={item.id} item={item} />
            ))}
          </Stack>
        </Box>

        {/* Page content - ensure it grows to fill available space */}
        <Box 
          flex="1"
          p={{ base: 4, md: 8 }}
          bg="gray.50"
          overflowY="auto"
          width="100%"
          minWidth="0"
        >
          {activeNav === 'inventory' && (
            <Box bg="white" borderRadius="lg" padding="6" boxShadow="sm" width="full">
              <Stack gap="6">
                <Heading size="lg">Inventory</Heading>
                <hr />
                <Text>Your card inventory will be displayed here.</Text>
              </Stack>
            </Box>
          )}

          {activeNav === 'add-card' && (
            <Box bg="white" borderRadius="lg" padding="6" boxShadow="sm" width="full">
              <Stack gap="6">
                <Heading size="lg">Add Card</Heading>
                <hr />
                <Text>Card entry form will go here.</Text>
              </Stack>
            </Box>
          )}
          
          {activeNav === 'market-data' && (
            <Box bg="white" borderRadius="lg" padding="6" boxShadow="sm" width="full">
              <Stack gap="6">
                <Heading size="lg">Market Data</Heading>
                <hr />
                <Stack gap="4">
                  <Text>Download, parse, and refresh market data for your cards.</Text>
                  <Box borderWidth="1px" borderRadius="md" padding="4" bg="gray.50">
                    <Stack gap="4">
                      <Heading size="md">Data Source</Heading>
                      <Text>Status: No data downloaded</Text>
                      <Button colorScheme="blue">Download Latest Data</Button>
                    </Stack>
                  </Box>
                  <Box borderWidth="1px" borderRadius="md" padding="4" bg="gray.50">
                    <Stack gap="4">
                      <Heading size="md">Refresh Prices</Heading>
                      <Text>Last updated: Never</Text>
                      <Button colorScheme="green" disabled={true}>Refresh Prices</Button>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          )}

          {activeNav === 'import-export' && (
            <Box bg="white" borderRadius="lg" padding="6" boxShadow="sm" width="full">
              <Stack gap="6">
                <Heading size="lg">Import/Export</Heading>
                <hr />
                <Text>Import and export tools will be placed here.</Text>
              </Stack>
            </Box>
          )}
        </Box>
      </Flex>
    </Flex>
  );
}

export default App;
