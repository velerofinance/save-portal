import Maker from '@makerdao/dai';
import McdPlugin, {
  VLX,
  WAG,
  USDV,
  USD,
  defaultCdpTypes
} from '@makerdao/dai-plugin-mcd';
import trezorPlugin from '@makerdao/dai-plugin-trezor-web';
import ledgerPlugin from '@makerdao/dai-plugin-ledger-web';
import walletLinkPlugin from '@makerdao/dai-plugin-walletlink';
import mewconnectPlugin from '@myetherwallet/dai-plugin-mewconnect';
import walletConnectPlugin from '@makerdao/dai-plugin-walletconnect';
import dcentPlugin from 'dai-plugin-dcent-web';
import portisPlugin from '@makerdao/dai-plugin-portis';
import configPlugin from '@makerdao/dai-plugin-config';
import networkConfig from './references/config';
import { networkNameToId } from './utils/network';
import { getQueryParamByName } from './utils/dev';

import velasAddresses from './references/contracts/velas.json';
import velastestnetAddresses from './references/contracts/velastestnet.json';

let _maker;

const otherNetworksOverrides = [
  { network: 'velas', contracts: velasAddresses },
  { network: 'velastestnet', contracts: velastestnetAddresses }
].reduce((acc, { network, contracts }) => {
  for (const [contractName, contractAddress] of Object.entries(contracts)) {
    if (!acc[contractName]) acc[contractName] = {};
    acc[contractName][network] = contractAddress;
  }
  return acc;
}, {});

export function getMaker() {
  if (_maker === undefined) throw new Error('Maker has not been instatiated');
  return _maker;
}

export async function instantiateMaker({
  rpcUrl,
  network,
  testchainId,
  backendEnv
}) {
  const addressOverrides = ['velastestnet', 'velas'].some(
    networkName => networkName === network
  )
    ? otherNetworksOverrides
    : {};

  const mcdPluginConfig = {
    defaultCdpTypes,
    prefetch: false,
    addressOverrides
  };
  const walletLinkPluginConfig = {
    rpcUrl: networkConfig.rpcUrls[networkNameToId(network)]
  };

  const config = {
    log: false,
    plugins: [
      trezorPlugin,
      ledgerPlugin,
      [walletLinkPlugin, walletLinkPluginConfig],
      mewconnectPlugin,
      walletConnectPlugin,
      dcentPlugin,
      portisPlugin,
      [McdPlugin, mcdPluginConfig]
    ],
    smartContract: {
      addressOverrides
    },
    provider: {
      url: rpcUrl,
      type: 'HTTP'
    },
    web3: {
      pollingInterval: network === 'testnet' ? 100 : null
    },
    gas: {
      apiKey: '3e722dd73e76ba3d2eb7507e316727db8a71d1fbc960ed1018e999a53f75'
    },
    multicall: true
  };

  // Use the config plugin, if we have a testchainConfigId
  if (testchainId) {
    delete config.provider;
    config.plugins.push([configPlugin, { testchainId, backendEnv }]);
  } else if (!rpcUrl) {
    if (config.provider.type === 'HTTP')
      rpcUrl = networkConfig.rpcUrls[networkNameToId(network)];
    else if (config.provider.type === 'WEBSOCKET')
      rpcUrl = networkConfig.wsRpcUrls[networkNameToId(network)];
    else throw new Error(`Unsupported provider type: ${config.provider.type}`);
    if (!rpcUrl) throw new Error(`Unsupported network: ${network}`);
    config.provider.url = rpcUrl;
  }

  const maker = await Maker.create('http', config);

  // for debugging
  window.maker = maker;

  return maker;
}

export { USD, USDV, VLX, WAG };
