import { Box, Text } from "@chakra-ui/react";
import { SetList } from "../types";


export const SetCard = ({ set }: { set: SetList }) => {
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
            <Text>
                {/* refactor this and make the symbol bigger/to the side */}
                {<i className={`ss ss-${set.keyruneCode.toLocaleLowerCase()} ss-2x`} />}
            </Text>
        </Box>
        <Box>
            <Text>Type: {set.type}</Text>
            <Text>Release Date: {set.releaseDate}</Text>
        </Box>
        </Box>
    );
    }
