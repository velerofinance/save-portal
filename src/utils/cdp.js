import { greaterThan } from './bignumber';
import ilkList from '../references/ilkList';
import assert from 'assert';
import BigNumber from 'bignumber.js';

export function cdpParamsAreValid(
  { gemsToLock, usdvToDraw },
  userGemBalance,
  debtFloor,
  usdvAvailable
) {
  // must not open empty cdp or cdp with no usdv value
  if (!gemsToLock || !usdvToDraw) return false; // we technically can do this, but TODO figure out if we should
  // must lock collateral in order to draw usdv
  if (!!usdvToDraw && !gemsToLock) return false;
  // must be positive
  if (parseFloat(usdvToDraw) < 0 || parseFloat(gemsToLock) < 0) return false;
  // must have enough tokens
  if (greaterThan(gemsToLock, userGemBalance)) return false;
  // must open a cdp above the liquidation threshold
  if (greaterThan(usdvToDraw, usdvAvailable)) return false;
  // must draw more usdv than the dust limit
  if (greaterThan(debtFloor, usdvToDraw)) return false;
  return true;
}

export function getCurrency(cdp) {
  const ilkName = cdp.ilk.name || cdp.ilk;
  const ilk = ilkList.find(i => i.key === ilkName);
  assert(ilk && ilk.currency, `could not find currency for ${ilkName}`);
  return ilk.currency;
}

export function getMaxUsdvAvailable({ collateralDebtAvailable }) {
  const collateralDebtAvailableBN = collateralDebtAvailable?.toBigNumber();

  return collateralDebtAvailableBN?.lt(0)
    ? BigNumber(0)
    : collateralDebtAvailableBN;
}
