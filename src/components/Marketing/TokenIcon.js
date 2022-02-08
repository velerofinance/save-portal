import React from 'react';

import styled from 'styled-components';

import { ReactComponent as UsdvIcon } from 'images/oasis-tokens/usdv.svg';
import { ReactComponent as VlxIcon } from 'images/oasis-tokens/eth.svg';
import { ReactComponent as WagIcon } from 'images/oasis-tokens/knc.svg';

import { ReactComponent as DefaultIcon } from 'images/oasis-tokens/default.svg';
import { ReactComponent as UniPairStamp } from 'images/oasis-tokens/uni-pair-stamp.svg';

import { parseUniPair } from 'utils/ui';

const iconsByToken = {
  USDV: UsdvIcon,
  VLX: VlxIcon,
  WAG: WagIcon
};

const UniPairIconStyle = styled.div`
  display: inline-block;
  position: relative;

  .base,
  .quote {
    width: 66.6%;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .base {
    z-index: 2;
    left: 0;
  }

  .quote {
    z-index: 1;
    right: 0;
  }

  .stamp {
    position: absolute;
    top: -5%;
    right: -15%;
    z-index: 3;
  }
`;

const UniPairIcon = ({ pair, size }) => {
  const scaleUniStamp = 0.42;
  const BaseIcon = iconsByToken[pair[0]];
  const QuoteIcon = iconsByToken[pair[1]];

  return (
    <UniPairIconStyle style={{ height: `${size}px`, width: `${size}px` }}>
      <BaseIcon className="base" />
      <QuoteIcon className="quote" />
      <UniPairStamp
        className="stamp"
        width={size * scaleUniStamp}
        height={size * scaleUniStamp}
      />
    </UniPairIconStyle>
  );
};

const TokenIcon = ({ symbol, size = 70, ...props }) => {
  const uniPair = parseUniPair(symbol, Object.keys(iconsByToken));
  if (uniPair) {
    return <UniPairIcon pair={uniPair} size={size} />;
  }
  const Icon = iconsByToken[symbol.toUpperCase()] || DefaultIcon;

  return <Icon width={size} height={size} {...props} />;
};

export default TokenIcon;
