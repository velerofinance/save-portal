import React, { useState, useCallback } from 'react';
import { Text, Input, Grid, Button } from '@makerdao/ui-components-core';
import Info from './shared/Info';
import InfoContainer from './shared/InfoContainer';
import useMaker from 'hooks/useMaker';
import useTokenAllowance from 'hooks/useTokenAllowance';
import useWalletBalances from 'hooks/useWalletBalances';
import useValidatedInput from 'hooks/useValidatedInput';
import useLanguage from 'hooks/useLanguage';
import useAnalytics from 'hooks/useAnalytics';
import ProxyAllowanceToggle from 'components/ProxyAllowanceToggle';
import { USDV } from '@makerdao/dai-plugin-mcd';
import SetMax from 'components/SetMax';
import { BigNumber } from 'bignumber.js';
import { safeToFixed } from '../../utils/ui';

const DsrWithdraw = ({ savings, reset }) => {
  const { trackBtnClick } = useAnalytics('Withdraw', 'Sidebar');
  const { lang } = useLanguage();
  const { maker } = useMaker();

  const displaySymbol = USDV.symbol;

  const { usdvLockedInDsr } = savings;
  const { USDV: usdvBalance } = useWalletBalances();
  const { hasAllowance, hasSufficientAllowance } = useTokenAllowance(
    USDV.symbol
  );
  const [withdrawMaxFlag, setWithdrawMaxFlag] = useState(false);

  const [
    withdrawAmount,
    setWithdrawAmount,
    onWithdrawAmountChange,
    withdrawAmountErrors
  ] = useValidatedInput(
    '',
    {
      isFloat: true,
      minFloat: 0.0,
      maxFloat: usdvLockedInDsr && usdvLockedInDsr.toNumber(),
      custom: {
        allowanceInvalid: value => !hasSufficientAllowance(value)
      }
    },
    {
      maxFloat: () =>
        lang.formatString(
          lang.action_sidebar.insufficient_balance,
          displaySymbol
        ),
      allowanceInvalid: () =>
        lang.formatString(lang.action_sidebar.invalid_allowance, displaySymbol)
    }
  );

  const setWithdrawMax = useCallback(() => {
    if (usdvLockedInDsr && !usdvLockedInDsr.eq(0)) {
      setWithdrawAmount(usdvLockedInDsr.toFixed(18).replace(/\.?0+$/, ''));
      setWithdrawMaxFlag(true);
    } else {
      setWithdrawAmount('');
    }
  }, [usdvLockedInDsr, setWithdrawAmount]);

  const withdraw = () => {
    if (withdrawMaxFlag || new BigNumber(withdrawAmount).eq(usdvLockedInDsr)) {
      maker.service('mcd:savings').exitAll();
    } else {
      maker.service('mcd:savings').exit(USDV(withdrawAmount));
    }
    reset();
  };

  const valid = withdrawAmount && !withdrawAmountErrors && hasAllowance;

  return (
    <Grid gridRowGap="m">
      <Grid gridRowGap="s">
        <Text.h4 color="darkLavender">
          {lang.formatString(lang.action_sidebar.withdraw_title, displaySymbol)}
        </Text.h4>
        <Text.p t="body">
          {lang.formatString(
            lang.action_sidebar.withdraw_description,
            displaySymbol
          )}
        </Text.p>
        <Input
          disabled={!hasAllowance}
          type="number"
          min="0"
          placeholder="0 USDV"
          value={withdrawAmount}
          onChange={e => {
            if (withdrawMaxFlag) setWithdrawMaxFlag(false);
            onWithdrawAmountChange(e);
          }}
          error={withdrawAmountErrors}
          failureMessage={withdrawAmountErrors}
          after={
            <SetMax
              onClick={() => {
                setWithdrawMax();
                trackBtnClick('SetMax', {
                  amount: withdrawAmount,
                  setMax: true
                });
              }}
            />
          }
          data-testid="dsrwithdraw-input"
        />
      </Grid>
      <ProxyAllowanceToggle
        token="USDV"
        onlyShowAllowance={true}
        trackBtnClick={trackBtnClick}
      />
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap="s">
        <Button
          disabled={!valid}
          onClick={() => {
            trackBtnClick('Confirm', {
              amount: withdrawAmount,
              fathom: { id: 'saveWithdraw', amount: withdrawAmount }
            });
            withdraw();
          }}
          data-testid={'withdraw-button'}
        >
          {lang.actions.withdraw}
        </Button>
        <Button
          variant="secondary-outline"
          onClick={() => {
            trackBtnClick('Cancel');
            reset();
          }}
        >
          {lang.cancel}
        </Button>
      </Grid>
      <InfoContainer>
        <Info
          title={lang.action_sidebar.usdv_balance}
          body={`${safeToFixed(usdvBalance, 7)} ${displaySymbol}`}
        />
        <Info
          title={lang.action_sidebar.locked_dsr}
          body={`${safeToFixed(
            usdvLockedInDsr.toNumber(),
            7
          )} ${displaySymbol}`}
        />
      </InfoContainer>
    </Grid>
  );
};
export default DsrWithdraw;
