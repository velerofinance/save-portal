import { watch } from 'hooks/useObservable';
import BigNumber from 'bignumber.js';

const initialState = {
  proxyAddress: undefined,
  annualUsdvSavingsRate: BigNumber(0),
  usdvSavingsRate: BigNumber(1),
  dateEarningsLastAccrued: Date.now(),
  usdvLockedInDsr: BigNumber(0),
  fetchedSavings: false,
  savingsRateAccumulator: undefined,
  savingsUsdv: BigNumber(0)
};

function useSavings(address) {
  const savings = watch.savings(address);
  return savings === undefined
    ? initialState
    : {
        fetchedSavings: true,
        ...savings,
        usdvLockedInDsr: savings?.usdvLockedInDsr?.toBigNumber()
      };
}

export default useSavings;
