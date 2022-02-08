import {
  VLX,
  WAG
} from '@makerdao/dai-plugin-mcd';

export default [
  {
    slug: 'vlx-a', // URL param
    symbol: 'VLX-A', // how it's displayed in the UI
    key: 'VLX-A', // the actual ilk name used in the vat
    gem: 'VLX', // the actual asset that's being locked
    currency: VLX, // the associated dai.js currency type
    networks: ['velas', 'velastestnet']
  },
  {
    slug: 'wag-b',
    symbol: 'WAG-B',
    key: 'WAG-B',
    gem: 'WAG',
    currency: WAG,
    networks: ['velas',]
  },
 ];
