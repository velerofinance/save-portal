import React from 'react';
import useLanguage from 'hooks/useLanguage';
import { Text, Box, Card, CardBody, Flex } from '@makerdao/ui-components-core';
import { prettifyNumber, formatter } from 'utils/ui';
import BigNumber from 'bignumber.js';

const SidebarDetails = ({ system, savings }) => {
  const { lang } = useLanguage();

  const TOTAL_USDV_SUPPLY = ({ system }) => [
    lang.sidebar.save_details.total_usdv_supply,
    prettifyNumber(system.totalUsdvSupply)
  ];

  const TOTAL_SAVINGS_USDV = ({ system }) => [
    lang.sidebar.save_details.total_savings_usdv,
    prettifyNumber(system.totalUsdvLockedInDsr)
  ];

  const USDV_SAVINGS_RATE = ({ system }) => [
    lang.sidebar.save_details.usdv_savings_rate,
    system.annualUsdvSavingsRate
      ? formatter(system.annualUsdvSavingsRate, {
          rounding: BigNumber.ROUND_HALF_UP
        }) + '%'
      : ''
  ];

  const params = [TOTAL_USDV_SUPPLY, TOTAL_SAVINGS_USDV, USDV_SAVINGS_RATE].map(
    f => f({ system, savings })
  );

  return (
    <Card css={'overflow:hidden;'} pt="2xs">
      <Box p="s" pb="0" mb="xs">
        <Text t="h4">{lang.sidebar.save_details.title}</Text>
      </Box>
      <CardBody mt="xs">
        {params.map(([param, value], idx) => (
          <Flex
            key={`details_${param}`}
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            py="xs"
            px="s"
            bg={idx % 2 ? 'coolGrey.100' : 'white'}
          >
            <Text color="steel" fontWeight="semibold" t="smallCaps">
              {param}
            </Text>
            <Text fontSize="1.4rem" color="darkPurple">
              {value}
            </Text>
          </Flex>
        ))}
      </CardBody>
    </Card>
  );
};

export default SidebarDetails;
