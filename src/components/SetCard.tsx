import { Box, Text } from "@chakra-ui/react";
import { Set } from "../types";


export const SetCard = ({ set }: { set: Set }) => {
    return (
        <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        p={4}
        m={4}
        w="sm"
        >
        <Box>
            <Text fontSize="xl" fontWeight="bold">
            {set.name}
            </Text>
            <Text>{set.code}</Text>
        </Box>
        <Box>
            <Text>{set.type}</Text>
            <Text>{set.releaseDate}</Text>
        </Box>
        </Box>
    );
    }
