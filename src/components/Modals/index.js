import React from 'react';
import { Box } from '@makerdao/ui-components-core';
import DSRDeposit from 'components/DSRDeposit';
import LedgerType from 'components/LedgerType';
import HardwareAccountSelect from 'components/HardwareAccountSelect';
import templates from './templates';

const modals = {
  dsrdeposit: ({ onClose, hideOnboarding }) => (
    <Box
      bg="lightGrey"
      minHeight="100vh"
      p="m"
      onClick={e => e.stopPropagation()}
    >
      <DSRDeposit onClose={onClose} hideOnboarding={hideOnboarding} />
    </Box>
  ),

  ledgertype: args => <LedgerType {...args} />,

  hardwareaccountselect: args => <HardwareAccountSelect {...args} />
};

export { templates };
export default modals;
