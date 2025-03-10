import { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { FiDatabase, FiPlusCircle, FiFileText, FiTrendingUp, FiSearch } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from './components/layout/Layout';
import { Inventory } from './pages/Inventory';
import { AddCard } from './pages/AddCard';
import { MarketData } from './pages/MarketData';
import { ImportExport } from './pages/ImportExport';
import { Browser } from './pages/Browser';
import { NavItemType } from './types';

function App() {
  const [activeNav, setActiveNav] = useState('add-card');
  const { resolvedTheme } = useTheme();

  const navItems: NavItemType[] = [
    { id: 'inventory', label: 'Inventory', icon: FiDatabase },
    { id: 'add-card', label: 'Add Card', icon: FiPlusCircle },
    { id: 'browser', label: 'Browser', icon: FiSearch },
    { id: 'market-data', label: 'Market Data', icon: FiTrendingUp },
    { id: 'import-export', label: 'Import/Export', icon: FiFileText },
  ];

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav} navItems={navItems}>
      <Toaster />
      <Box 
        flex="1"
        p={{ base: 4, md: 8 }}
        bg={resolvedTheme === 'dark' ? 'gray.900' : 'gray.50'}
        color={resolvedTheme === 'dark' ? 'white' : 'gray.800'}
        overflowY="auto"
        width="100%"
        minWidth="0"
      >
        {activeNav === 'inventory' && <Inventory />}
        {activeNav === 'add-card' && <AddCard />}
        {activeNav === 'browser' && <Browser />}
        {activeNav === 'market-data' && <MarketData />}
        {activeNav === 'import-export' && <ImportExport />}
      </Box>
    </Layout>
  );
}

export default App;
