import React from 'react';
import { Box, Flex, Text } from '@makerdao/ui-components-core';

const Subheader = () => {
  return (
    <Box borderTop="default" p="s">
      <Flex
        maxWidth="1090px"
        m="0 auto"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text t="h5">Savings Usdv</Text>
      </Flex>
    </Box>
  );
};

export default Subheader;
