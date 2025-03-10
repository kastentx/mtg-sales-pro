import { Box, Heading, Text, Stack } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { useSetNames } from '../hooks/useSetNames';
import { Select, OptionBase } from "chakra-react-select";
import { useCardData } from '../contexts/CardDataContext';

export interface SetOption extends OptionBase {
  label: string;
  value: string;
  code: string;
}

export function Browser() {
  const { resolvedTheme } = useTheme();
  const { sets, isLoading } = useSetNames();
  const { selectedSets, setSelectedSets } = useCardData();

  const setOptions: SetOption[] = sets.map((set) => ({
    value: set.name,
    label: set.name,
    code: set.code,
  }));

  const handleChange = (newValue: unknown) => {
    setSelectedSets(newValue as SetOption[]);
  };

  return (
    <Box bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'} color={resolvedTheme === 'dark' ? 'white' : 'gray.800'} borderRadius="lg" padding="6" boxShadow="sm" width="full">
      <Stack gap="6">
        <Heading size="lg">Card Browser</Heading>
        <hr />
        <Stack gap="4">
          <Text>Browse and search for Magic: The Gathering cards.</Text>

          <Select<SetOption, true>
            isMulti
            options={setOptions}
            value={selectedSets}
            onChange={handleChange}
            placeholder="Select a set"
            variant="outline"
          />

        </Stack>
      </Stack>
    </Box>
  );
}
