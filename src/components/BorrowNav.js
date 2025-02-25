import React, { Fragment } from 'react';
import { Link, useCurrentRoute, useNavigation } from 'react-navi';
import styled from 'styled-components';

// import CDPList from 'components/CDPList';
import { Flex, Text } from '@makerdao/ui-components-core';
import { ReactComponent as BorrowIcon } from 'images/active-borrow-icon.svg';
import useLanguage from 'hooks/useLanguage';

// import CDPDropdown from './CDPDropdown';
import useCheckRoute from 'hooks/useCheckRoute';

const StyledBorrowIcon = styled(BorrowIcon)`
  path {
    stroke: ${props => props.textcolor};
    fill: ${props => props.textcolor};
  }
`;

const BorrowNav = ({ viewedAddress, account, mobile, ...props }) => {
  const navigation = useNavigation();
  const { url } = useCurrentRoute();
  const { lang } = useLanguage();
  const { isBorrow } = useCheckRoute();
  const selected = isBorrow;

  const address = account
    ? account.address
    : viewedAddress
    ? viewedAddress
    : null;

  const textColor =
    selected && account
      ? 'white'
      : !selected && account
      ? 'gray'
      : selected && !account
      ? 'black'
      : 'gray';
  return (
    <Fragment>
      {
        <Link href={`https://vaults.velero.finance/${url.search}`}>
          <Flex
            bg={!account && selected && 'grey.200'}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py="s"
            {...props}
          >
            <StyledBorrowIcon
              textcolor={textColor}
              selected={selected}
              connected={account}
            />
            <Text t="p6" fontWeight="bold" color={textColor}>
              {lang.navbar.borrow}
            </Text>
          </Flex>
        </Link>
      }
    </Fragment>
  );
};

export default BorrowNav;
