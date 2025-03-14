import { Box, Heading, Text, Stack, Button, Flex } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { useSetNames } from '../hooks/useSetNames';
import { Select, OptionBase } from "chakra-react-select";
import { useCardData } from '../contexts/CardDataContext';
import { API_CONFIG } from '../config/api';
import { SetCard } from '@/components/SetCard';
import { SetList, CardSet } from '../types';

export interface SetOption extends OptionBase {
  label: string;
  value: string;
  code: string;
  // TODO: add keyRuneCode and icon here
}

export function Browser() {
  const { resolvedTheme } = useTheme();
  const { sets, isLoading } = useSetNames();
  const { selectedSets, setSelectedSets, loadedSetData, setLoadedSetData, setLoadedCardData } = useCardData();

  const setOptions: SetOption[] = sets.map((set) => ({
    value: set.name,
    label: set.name,
    code: set.code,
  }));

  const handleChange = (newValue: unknown) => {
    setSelectedSets(newValue as SetOption[]);
  };

  const loadSets = () => {
    const selectedSetCodes = selectedSets.map((set) => set.code);
    // send a post request to the backend to load the selected sets
    fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sets}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ setCodes: selectedSetCodes }),
    })
      .then((response) => response.json())
      .then((data) => {
        const setData = data as SetList[];
        // update the card data context with the new data
        setLoadedSetData(setData);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    loadCards();
  };

  const loadCards = () => {
    const selectedSetCodes = selectedSets.map((set) => set.code);
    // send a post request to the backend to load the selected sets
    fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.cards}/set-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ setCodes: selectedSetCodes }),
    })
      .then((response) => response.json())
      .then((data) => {
        setLoadedCardData(data as CardSet[]);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <Box>
      <Box bg={resolvedTheme === 'dark' ? 'gray.800' : 'white'} color={resolvedTheme === 'dark' ? 'white' : 'gray.800'} borderRadius="lg" padding="6" boxShadow="sm" width="full">
        <Stack gap="6">
          <Heading size="lg">Card Browser</Heading>
          <hr />
          <Stack gap="4">
            <Text>Browse and search for Magic: The Gathering cards by set.</Text>

            {/* TODO: add a 'Show all' toggle (default off) to limit the number of sets in menu */}
            <Select<SetOption, true>
              isMulti
              options={setOptions}
              value={selectedSets}
              onChange={handleChange}
              placeholder="Select a set"
              variant="outline"
            />
            {/* add a load sets button here*/}
            <Button color="white" onClick={loadSets}>Load Sets</Button>
          </Stack>
        </Stack>
      </Box>

      {/* iterate over all loadedSets and display a SetCard for each */}
      <Heading size="md" mt={6}>
        Loaded Sets
      </Heading>
      <hr />
      <Flex flexWrap="wrap" justifyContent="center" mt={4}>
        {/* TODO: improve these, maybe add a close button to remove */}
        {loadedSetData.map((set: SetList) => (
          <SetCard key={set.code} set={set} />
        ))}
      </Flex>
    </Box>
  );
}
