import React, { useCallback } from 'react';
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
import { safeToFixed } from '../../utils/ui';

const DsrDeposit = ({ savings, reset }) => {
  const { trackBtnClick } = useAnalytics('Deposit', 'Sidebar');
  const { lang } = useLanguage();
  const { maker } = useMaker();

  const { symbol } = USDV;
  const displaySymbol = 'USDV';

  const { usdvLockedInDsr } = savings;
  const { USDV: usdvBalance } = useWalletBalances();
  const { hasAllowance, hasSufficientAllowance } = useTokenAllowance(symbol);

  const [
    depositAmount,
    setDepositAmount,
    onDepositAmountChange,
    depositAmountErrors
  ] = useValidatedInput(
    '',
    {
      isFloat: true,
      minFloat: 0.0,
      maxFloat: usdvBalance && usdvBalance.toNumber(),
      custom: {
        allowanceInvalid: value => !hasSufficientAllowance(value)
      }
    },
    {
      maxFloat: () =>
        lang.formatString(lang.action_sidebar.insufficient_balance, 'USDV'),
      allowanceInvalid: () =>
        lang.formatString(lang.action_sidebar.invalid_allowance, 'USDV')
    }
  );

  const setDepositMax = useCallback(() => {
    if (usdvBalance && !usdvBalance.eq(0)) {
      setDepositAmount(usdvBalance.toString());
    } else {
      setDepositAmount('');
    }
  }, [usdvBalance, setDepositAmount]);

  const deposit = () => {
    maker.service('mcd:savings').join(USDV(depositAmount));
    reset();
  };

  const valid = depositAmount && !depositAmountErrors && hasAllowance;

  return (
    <Grid gridRowGap="m">
      <Grid gridRowGap="s">
        <Text color="darkLavender" t="h4">
          {lang.formatString(lang.action_sidebar.deposit_title, displaySymbol)}
        </Text>
        <p>
          <Text t="body">
            {lang.formatString(
              lang.action_sidebar.deposit_description,
              displaySymbol
            )}
          </Text>
        </p>
        <Input
          disabled={!hasAllowance}
          type="number"
          min="0"
          placeholder="0 USDV"
          value={depositAmount}
          onChange={onDepositAmountChange}
          error={depositAmountErrors}
          failureMessage={depositAmountErrors}
          after={
            <SetMax
              onClick={() => {
                setDepositMax();
                trackBtnClick('SetMax', {
                  amount: depositAmount,
                  setMax: true
                });
              }}
            />
          }
          data-testid="dsrdeposit-input"
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
              amount: depositAmount,
              fathom: { id: 'saveDeposit', amount: depositAmount }
            });
            deposit();
          }}
          data-testid={'deposit-button'}
        >
          {lang.actions.deposit}
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
          body={`${safeToFixed(usdvLockedInDsr.toNumber(), 7)} ${displaySymbol}`}
        />
      </InfoContainer>
    </Grid>
  );
};
export default DsrDeposit;
