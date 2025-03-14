import React from 'react';
import { Button, HStack } from '@chakra-ui/react';

export enum ViewMode {
  List = 'list',
  Grid = 'grid'
}

interface PillToggleProps {
  activeView: ViewMode;
  onChange: (view: ViewMode) => void;
}

const PillToggle: React.FC<PillToggleProps> = ({ activeView, onChange }) => {
  return (
    <HStack 
      gap={0} 
      borderWidth="1px" 
      borderRadius="full" 
      overflow="hidden"
      boxShadow="sm"
    >
      <Button
        size="sm"
        borderRadius="full"
        borderRightRadius={0}
        colorScheme={activeView === ViewMode.List ? 'blue' : 'gray'}
        variant={activeView === ViewMode.List ? 'solid' : 'ghost'}
        onClick={() => onChange(ViewMode.List)}
        px={4}
      >
        <span role="img" aria-label="list" style={{ marginRight: '8px' }}>📋</span>
        List
      </Button>
      <Button
        size="sm"
        borderRadius="full"
        borderLeftRadius={0}
        colorScheme={activeView === ViewMode.Grid ? 'blue' : 'gray'}
        variant={activeView === ViewMode.Grid ? 'solid' : 'ghost'}
        onClick={() => onChange(ViewMode.Grid)}
        px={4}
      >
        <span role="img" aria-label="grid" style={{ marginRight: '8px' }}>📱</span>
        Grid
      </Button>
    </HStack>
  );
};

export default PillToggle;
