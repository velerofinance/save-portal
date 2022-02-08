import React, { useMemo } from 'react';
import SidebarFeeds from 'components/SidebarFeeds';
import SidebarSystem from 'components/SidebarSystem';
import SidebarDetails from 'components/SidebarDetails';
import { Box, Grid } from '@makerdao/ui-components-core';
import useCdpTypes from 'hooks/useCdpTypes';
import { watch } from 'hooks/useObservable';
import useCheckRoute from 'hooks/useCheckRoute';

const SidebarGlobalPanel = () => {
  const { cdpTypesList } = useCdpTypes();
  const prices = watch.collateralTypesPrices(cdpTypesList);
  const totalUsdvSupply = watch.totalUsdvSupply();
  const totalVaultsCreated = watch.vaultsCreated();
  const totalUsdvLockedInDsr = watch.totalUsdvLockedInDsr();
  const annualUsdvSavingsRate = watch.annualUsdvSavingsRate();
  const systemCollateralization = watch.systemCollateralization(cdpTypesList);

  const { isBorrow, isSave } = useCheckRoute();

  return useMemo(() => {
    return (
      <Box>
        <Grid gridRowGap="s">
          {isBorrow && <SidebarFeeds feeds={prices} />}
          {isBorrow && (
            <SidebarSystem
              system={{
                totalUsdvSupply,
                totalVaultsCreated,
                systemCollateralization
              }}
            />
          )}
          {isSave && (
            <SidebarDetails
              system={{
                totalUsdvSupply,
                totalUsdvLockedInDsr,
                annualUsdvSavingsRate
              }}
            />
          )}
        </Grid>
      </Box>
    );
  }, [
    isBorrow,
    isSave,
    prices,
    totalUsdvSupply,
    totalVaultsCreated,
    totalUsdvLockedInDsr,
    annualUsdvSavingsRate,
    systemCollateralization
  ]);
};

export default SidebarGlobalPanel;
