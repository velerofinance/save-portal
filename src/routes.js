import React, { useEffect } from 'react';
import { route, mount, withView, compose, redirect } from 'navi';
import { View } from 'react-navi';

import Navbar from 'components/Navbar';
import DashboardLayout from 'layouts/DashboardLayout';
import Save from 'pages/Save';
import SaveOverview from 'pages/SaveOverview';
import modals, { templates } from 'components/Modals';
import { ModalProvider } from 'providers/ModalProvider';
import { SidebarProvider } from 'providers/SidebarProvider';
import { ToggleProvider } from 'providers/ToggleProvider';
import MakerProvider from 'providers/MakerProvider';
import VaultsProvider from 'providers/VaultsProvider';
import TransactionManagerProvider from 'providers/TransactionManagerProvider';
import NotificationProvider from 'providers/NotificationProvider';
import config from 'references/config';
import MobileNav from 'components/MobileNav';
import { userSnapInit } from 'utils/analytics';

const { networkNames, defaultNetwork } = config;

const dappProvidersView = async request => {
  const {
    network = networkNames[defaultNetwork],
    testchainId,
    backendEnv
  } = request.query;
  const { viewedAddress } = request.params;

  return (
    <MakerProvider
      network={network}
      testchainId={testchainId}
      backendEnv={backendEnv}
      viewedAddress={viewedAddress}
    >
      <RouteEffects network={network} />
      <TransactionManagerProvider>
        <NotificationProvider>
          <VaultsProvider viewedAddress={viewedAddress}>
            <ToggleProvider>
              <ModalProvider modals={modals} templates={templates}>
                <SidebarProvider>
                  <View />
                </SidebarProvider>
              </ModalProvider>
            </ToggleProvider>
          </VaultsProvider>
        </NotificationProvider>
      </TransactionManagerProvider>
    </MakerProvider>
  );
};

const withDashboardLayout = childMatcher =>
  compose(
    withView(dappProvidersView),
    withView(request => {
      const { viewedAddress, cdpId } = request.params;
      return (
        <DashboardLayout
          mobileNav={<MobileNav viewedAddress={viewedAddress} cdpId={cdpId} />}
          navbar={<Navbar viewedAddress={viewedAddress} />}
        >
          <View />
        </DashboardLayout>
      );
    }),
    childMatcher
  );

export default mount({
  // basename ought to be set to '/borrow' and router will construct
  // these routes as basename+route

  '/': redirect(request => `./save${request.search}`),

  '/save': compose(
    withView(dappProvidersView),
    withView(() => <SaveOverview />)
  ),

  '/save/owner/:viewedAddress': withDashboardLayout(
    route(request => {
      const { viewedAddress } = request.params;
      return {
        title: 'Save',
        view: <Save viewedAddress={viewedAddress} />
      };
    })
  )

  // '/trade': withView(() => <TradeLanding />)
});

function RouteEffects({ network }) {
  useEffect(() => {
    if (network !== 'mainnet' && window.location.hostname !== 'localhost')
      userSnapInit();
  }, [network]);
  return null;
}
