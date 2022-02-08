import React from 'react';
import BigNumber from 'bignumber.js';
import { USDV } from '@makerdao/dai-plugin-mcd';
import { Text, Input, Grid, Button } from '@makerdao/ui-components-core';
import Info from './shared/Info';
import InfoContainer from './shared/InfoContainer';
import RatioDisplay, { RatioDisplayTypes } from 'components/RatioDisplay';
import useMaker from 'hooks/useMaker';
import useLanguage from 'hooks/useLanguage';
import useAnalytics from 'hooks/useAnalytics';
import useValidatedInput from 'hooks/useValidatedInput';
import { add, greaterThan } from 'utils/bignumber';
import {
  formatCollateralizationRatio,
  formatter,
  prettifyNumber
} from 'utils/ui';
import { decimalRules } from '../../styles/constants';
const { long } = decimalRules;

const Generate = ({ vault, reset }) => {
  const { trackBtnClick } = useAnalytics('Generate', 'Sidebar');
  const { lang } = useLanguage();
  const { maker } = useMaker();

  let {
    debtValue,
    usdvAvailable,
    vaultType,
    debtFloor,
    collateralAmount,
    liquidationRatio,
    collateralizationRatio: currentCollateralizationRatio,
    collateralDebtAvailable
  } = vault;
  BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });
  debtValue = debtValue.toBigNumber().decimalPlaces(18);
  collateralDebtAvailable = collateralDebtAvailable?.toBigNumber();

  const symbol = collateralAmount?.symbol;

  const dustLimitValidation = value =>
    greaterThan(debtFloor, add(value, debtValue));

  const debtCeilingValidation = value =>
    greaterThan(value, collateralDebtAvailable);

  const [amount, , onAmountChange, failureMessage] = useValidatedInput(
    '',
    {
      maxFloat: formatter(usdvAvailable),
      minFloat: 0,
      isFloat: true,
      custom: {
        dustLimit: dustLimitValidation,
        debtCeiling: debtCeilingValidation
      }
    },
    {
      maxFloat: () => lang.action_sidebar.cdp_below_threshold,
      dustLimit: () =>
        lang.formatString(
          lang.cdp_create.below_dust_limit,
          formatter(debtFloor)
        ),
      debtCeiling: () =>
        lang.formatString(
          lang.action_sidebar.generate_threshold,
          formatter(collateralDebtAvailable)
        )
    }
  );

  const amountToGenerate =
    amount && !BigNumber(amount).isNegative()
      ? BigNumber(amount)
      : BigNumber(0);

  const undercollateralized = usdvAvailable.lt(amountToGenerate);

  const generate = () => {
    maker.service('mcd:cdpManager').draw(vault.id, vaultType, USDV(amount));
    reset();
  };

  const liquidationPrice = vault.calculateLiquidationPrice({
    debtValue: vault?.debtValue.plus(amountToGenerate)
  });

  const collateralizationRatio = vault.calculateCollateralizationRatio({
    debtValue: vault?.debtValue.plus(amountToGenerate)
  });

  return (
    <Grid gridRowGap="m">
      <Grid gridRowGap="s">
        <Text.h4 color="darkLavender">
          {lang.action_sidebar.generate_title}
        </Text.h4>
        <Text.p t="body">{lang.action_sidebar.generate_description}</Text.p>
        <Input
          type="number"
          value={amount}
          min="0"
          onChange={onAmountChange}
          placeholder="0.00 USDV"
          failureMessage={failureMessage}
          data-testid="generate-input"
        />
        <RatioDisplay
          type={RatioDisplayTypes.CARD}
          ratio={collateralizationRatio}
          ilkLiqRatio={formatter(liquidationRatio, { percentage: true })}
          text={lang.action_sidebar.generate_warning}
          onlyWarnings={true}
          show={amount !== '' && amount > 0 && !undercollateralized}
          textAlign="center"
        />
      </Grid>
      <Grid gridTemplateColumns="1fr 1fr" gridColumnGap="s">
        <Button
          disabled={!amount || failureMessage}
          onClick={() => {
            trackBtnClick('Confirm', {
              amount,
              fathom: { id: `${symbol}VaultGenerate`, amount }
            });
            generate();
          }}
        >
          {lang.actions.generate}
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
          title={lang.action_sidebar.maximum_available_to_generate}
          body={`${formatter(usdvAvailable, { precision: long })} USDV`}
        />
        <Info
          title={lang.action_sidebar.new_liquidation_price}
          body={`${prettifyNumber(liquidationPrice, false, null, false)} USD`}
        />
        <Info
          title={lang.action_sidebar.new_collateralization_ratio}
          body={
            <RatioDisplay
              type={RatioDisplayTypes.TEXT}
              ratio={formatter(collateralizationRatio, {
                infinity: currentCollateralizationRatio
              })}
              ilkLiqRatio={formatter(liquidationRatio, { percentage: true })}
              text={formatCollateralizationRatio(collateralizationRatio)}
            />
          }
        />
      </InfoContainer>
    </Grid>
  );
};
export default Generate;
