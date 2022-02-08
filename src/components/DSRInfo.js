import React, { useReducer, useEffect, useState, useRef } from 'react';
import BigNumber from 'bignumber.js';

import TextMono from 'components/TextMono';
import { Flex, Text, Box } from '@makerdao/ui-components-core';
import useLanguage from 'hooks/useLanguage';
import usePrevious from 'hooks/usePrevious';
import useMaker from 'hooks/useMaker';

import { InfoContainerRow, CdpViewCard } from './CDPDisplay/subcomponents';
import { TextBlock } from 'components/Typography';
import { formatter } from 'utils/ui';
// import { watch } from 'hooks/useObservable';
// import useWalletBalances from 'hooks/useWalletBalances';
import useWalletBalances from '../hooks/useWalletBalances';

const FF_DYNAMIC_DECIMALS = false;
function Ticker({ amount, increment, decimals, ...props }) {
  const [counter, setCounter] = useState(amount);
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      if (deltaTime > 0) {
        setCounter(prevCount => deltaTime * increment + prevCount);
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <TextMono {...props}>
      {counter ? counter.toFixed(decimals) : (0).toFixed(decimals)}
    </TextMono>
  );
}

const initialState = {
  balance: BigNumber(0),
  earnings: BigNumber(0),
  amountChange: BigNumber(0),
  decimalsToShow: 4,
  rawEarnings: BigNumber(0),
  amountChangeMillisecond: BigNumber(0.000001),
  fetchedEarnings: false,
  fetchingEarnings: false,
  initialised: false,
  earningsDispatched: false,
  totalUsdvLockedAmountDelta: BigNumber(0),
  tickerInterest: BigNumber(0),
  tickerStartTime: 0,
  cleanedState: false
};

function DSRInfo({ isMobile, savings }) {
  const { lang } = useLanguage();
  const { maker } = useMaker();
  const cancelled = useRef(false);
  const balances = useWalletBalances();

  console.log(balances);

  initialState.balance = balances['DSR'];

  useEffect(() => {
    return () => (cancelled.current = true);
  }, []);

  const {
    proxyAddress,
    annualUsdvSavingsRate,
    usdvSavingsRate,
    dateEarningsLastAccrued,
    usdvLockedInDsr,
    savingsRateAccumulator,
    savingsUsdv
  } = savings;

  const [
    {
      balance,
      earnings,
      amountChange,
      decimalsToShow,
      rawEarnings,
      fetchedEarnings,
      fetchingEarnings,
      earningsDispatched,
      totalUsdvLockedAmountDelta,
      tickerInterest,
      tickerStartTime,
      initialised,
      cleanedState
    },
    dispatch
  ] = useReducer((state, data) => ({ ...state, ...data }), initialState);

  const decimals =
    !isMobile && FF_DYNAMIC_DECIMALS
      ? amountChange.times(100).e * -1
      : usdvLockedInDsr.eq(0)
      ? 4
      : usdvLockedInDsr.lt(1000)
      ? 8
      : usdvLockedInDsr.lt(100000)
      ? 6
      : 4;

  const fetchEarnings = async () => {
    const etd = await maker
      .service('mcd:savings')
      .getEarningsToDate(proxyAddress);
    if (cancelled.current) return;
    dispatch({
      fetchingEarnings: false,
      fetchedEarnings: true,
      rawEarnings: etd.toBigNumber()
    });
  };

  const usdvBalance = savingsUsdv.times(savingsRateAccumulator);
  const prevUsdvLocked = usePrevious(usdvBalance);
  const rawEarningsString = rawEarnings.toString();

  const prevSavingsUsdv = usePrevious(savingsUsdv);
  const savingsUsdvChanged =
    prevSavingsUsdv !== undefined &&
    prevSavingsUsdv.toString() !== savingsUsdv.toString();

  const prevSavingsRateAccumulator = usePrevious(savingsRateAccumulator);
  const savingsRateAccChanged =
    prevSavingsRateAccumulator !== undefined &&
    prevSavingsRateAccumulator.toString() !== savingsRateAccumulator.toString();

  useEffect(() => {
    if (cleanedState) {
      if (proxyAddress && !fetchedEarnings && !fetchingEarnings) {
        fetchEarnings(proxyAddress);
        dispatch({
          fetchingEarnings: true
        });
      }

      if (
        savingsRateAccChanged ||
        savingsUsdvChanged ||
        (fetchedEarnings && !earningsDispatched)
      ) {
        const amountChangePerSecond = usdvSavingsRate
          .minus(1)
          .times(usdvLockedInDsr);

        const secondsSinceDrip =
          Math.floor(Date.now() / 1000) -
          dateEarningsLastAccrued.getTime() / 1000;

        const accruedInterestSinceDrip = usdvLockedInDsr.gt(0)
          ? amountChangePerSecond.times(secondsSinceDrip)
          : BigNumber(0);

        const amountChangePerMillisecond = amountChangePerSecond.div(1000);
        const usdvLockedAmountDelta =
          !savingsUsdvChanged && savingsRateAccChanged
            ? usdvBalance.minus(prevUsdvLocked)
            : BigNumber(0);

        if (fetchedEarnings && initialised) {
          if (!earningsDispatched) {
            const timeSinceTickerStart = Date.now() - tickerStartTime;
            const interestSinceTickerStart =
              timeSinceTickerStart > 2500
                ? amountChangePerSecond.times(timeSinceTickerStart / 1000)
                : BigNumber(0);

            dispatch({
              balance: usdvBalance.plus(accruedInterestSinceDrip),
              amountChange: amountChangePerMillisecond,
              decimalsToShow: decimals,
              earningsDispatched: true,
              totalUsdvLockedAmountDelta: totalUsdvLockedAmountDelta.plus(
                usdvLockedAmountDelta
              ),
              tickerInterest: interestSinceTickerStart,
              earnings: rawEarnings
                .plus(accruedInterestSinceDrip)
                .plus(usdvLockedAmountDelta)
                .plus(totalUsdvLockedAmountDelta)
                .plus(interestSinceTickerStart)
            });
          } else {
            dispatch({
              balance: usdvBalance.plus(accruedInterestSinceDrip),
              amountChange: amountChangePerMillisecond,
              decimalsToShow: decimals,
              totalUsdvLockedAmountDelta: totalUsdvLockedAmountDelta.plus(
                usdvLockedAmountDelta
              ),
              earnings: rawEarnings
                .plus(accruedInterestSinceDrip)
                .plus(usdvLockedAmountDelta)
                .plus(totalUsdvLockedAmountDelta)
                .plus(tickerInterest)
            });
          }
        } else {
          dispatch({
            balance: usdvBalance.plus(accruedInterestSinceDrip),
            amountChange: amountChangePerMillisecond,
            decimalsToShow: decimals,
            tickerStartTime: Date.now(),
            initialised: true
          });
        }
      }
    } else {
      // state must be reset on account switch
      cancelled.current = false;
      dispatch({
        ...initialState,
        cleanedState: true
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    savingsRateAccChanged,
    savingsUsdvChanged,
    rawEarningsString,
    fetchedEarnings,
    initialised,
    cleanedState
  ]);

  return (
    <CdpViewCard title={lang.save.usdv_locked_dsr}>
      <Flex alignItems="flex-end" mt="s" mb="xs">
        <Ticker
          key={`${proxyAddress}.${balance.toString()}.${amountChange}.${decimalsToShow}`}
          amount={balance.toNumber()}
          increment={amountChange.toNumber()}
          decimals={decimalsToShow}
          t="h2"
        />
        <Box>
          <Text.h4 mb=".175rem" ml="s">
            USDV
          </Text.h4>
        </Box>
      </Flex>
      <InfoContainerRow
        title={
          <TextBlock fontSize="l">{lang.save.savings_earned_to_date}</TextBlock>
        }
        value={
          <>
            {earningsDispatched ? (
              <Ticker
                key={`${proxyAddress}.${earnings.toString()}.${amountChange}.${decimalsToShow}`}
                amount={earnings.toNumber()}
                increment={amountChange.toNumber()}
                decimals={decimalsToShow}
                t="body"
              />
            ) : (
              <TextMono t="body">{(0).toFixed(decimalsToShow)}</TextMono>
            )}
            <Text ml="xs">USDV</Text>
          </>
        }
      />
      <InfoContainerRow
        title={lang.save.usdv_savings_rate}
        value={
          annualUsdvSavingsRate ? (
            <TextMono>
              {formatter(annualUsdvSavingsRate, {
                rounding: BigNumber.ROUND_HALF_UP
              })}
              %
            </TextMono>
          ) : (
            '--'
          )
        }
      />
    </CdpViewCard>
  );
}

export default DSRInfo;
