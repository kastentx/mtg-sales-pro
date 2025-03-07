import { Flex } from '@chakra-ui/react';
import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NavItemType } from '../../types';

interface LayoutProps {
  children: ReactNode;
  activeNav: string;
  setActiveNav: (id: string) => void;
  navItems: NavItemType[];
}

export const Layout = ({ children, activeNav, setActiveNav, navItems }: LayoutProps) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <Flex h="100vh" direction="column" width="100vw">
      <Header onToggleNav={() => setIsMobileNavOpen(!isMobileNavOpen)} />
      <Flex flex="1" overflow="hidden" position="relative" width="100%">
        <Sidebar
          isOpen={isMobileNavOpen}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          navItems={navItems}
        />
        {children}
      </Flex>
    </Flex>
  );
};
