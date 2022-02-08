import React, { useEffect, useState } from 'react';
import assert from 'assert';
import { waitFor, fireEvent } from '@testing-library/react';
import { USDV, VLX } from '@makerdao/dai-plugin-mcd';
import { mineBlocks, TestAccountProvider } from '@makerdao/test-helpers';

import DSRDeposit from '../DSRDeposit';
import lang from '../../languages';
import { renderWithAccount } from '../../../test/helpers/render';
import { instantiateMaker } from '../../maker';
import { prettifyNumber } from '../../utils/ui';
import useMaker from 'hooks/useMaker';

jest.mock('mixpanel-browser', () => ({
  init: jest.fn(),
  track: jest.fn()
}));

jest.mock('react-navi', () => ({
  useCurrentRoute: () => ({ url: { pathname: '/test' } })
}));

const { click, change } = fireEvent;

const AMOUNT = 180.1234567;
const ILK = 'VLX-A';
let maker;
let web3;
let noProxyAcct;

beforeAll(async () => {
  // Generate Dai & send to an account with no proxy
  maker = await instantiateMaker({ network: 'testnet' });
  await await maker
    .service('mcd:cdpManager')
    .openLockAndDraw(ILK, VLX(5), USDV(AMOUNT));

  TestAccountProvider.setIndex(345);
  noProxyAcct = TestAccountProvider.nextAccount();
  const token = maker.getToken(USDV.symbol);
  await token.transfer(noProxyAcct.address, AMOUNT);
});

const RenderNoProxyAccount = () => {
  const hideOnboarding = jest.fn();
  const [changedAccount, setAccountChanged] = useState(false);
  const { maker } = useMaker();
  web3 = maker.service('web3');

  const changeAccount = async () => {
    const accountService = maker.service('accounts');
    await accountService.addAccount('noproxy', {
      type: 'privateKey',
      key: noProxyAcct.key
    });
    accountService.useAccount('noproxy');
    setAccountChanged(true);
  };

  useEffect(() => {
    changeAccount();
  }, []);

  return changedAccount ? (
    <DSRDeposit hideOnboarding={hideOnboarding} />
  ) : (
    <div />
  );
};

test('the whole DSR Deposit flow', async () => {
  const {
    getAllByText,
    getByRole,
    getByText,
    findByText,
    getAllByRole,
    findAllByTestId
  } = await renderWithAccount(<RenderNoProxyAccount />);

  await findByText(lang.dsr_deposit.open_vault);
  // Open onboarding
  click(getByText('Setup'));

  // Click setup proxy
  const [proxyBtn, allowanceBtn] = getAllByRole('button');
  click(proxyBtn);
  // Must wait for proxy to be confirmed
  await mineBlocks(web3, 20);
  await findByText('Confirmed with 10 confirmations');

  // First checkmark is proxy, but need to set allowance for Dai
  await waitFor(() => getByText('checkmark.svg'));
  click(allowanceBtn);
  await waitFor(() => assert(getAllByText('checkmark.svg').length === 2));

  // Allowance is now set, continue to DepositCreate step
  click(getByText(lang.actions.continue));

  // UI Formats the amount
  await waitFor(() => getByText(`${prettifyNumber(AMOUNT)} DAI`));
  getByText(lang.dsr_deposit.deposit_form_title);

  const input = (await findAllByTestId('dsrdeposit-onboarding-input'))[2];
  expect(input.value).toBe('');
  change(input, { target: { value: AMOUNT + 1 } });
  await waitFor(() =>
    getByText(
      lang.formatString(lang.action_sidebar.insufficient_balance, 'DAI')
    )
  );

  // Test setmax button
  fireEvent.click(getByText(lang.set_max));
  expect(input.value).toBe(AMOUNT.toString());

  // Continue and move to confirmation step
  click(getByText(lang.actions.continue));

  getByText(lang.save.deposit_amount);
  getByText(`${prettifyNumber(AMOUNT)} DAI`);

  // Agree to terms to enable deposit button
  click(getByRole('checkbox'));

  const depositButton = getByText(lang.actions.deposit);
  await waitFor(() => assert(!depositButton.disabled));

  click(depositButton);

  await waitFor(() =>
    getByText(
      /The estimated time is [0-9]+ seconds. You can safely leave this page./
    )
  );
  await mineBlocks(web3);
  // The message changes after confirmation
  await waitFor(() => getByText('You can safely leave this page.'));
}, 15000);
