# Oasis Borrow/Save

![Build Workflow](https://github.com/OasisDex/mcd-cdp-portal//actions/workflows/aws-prod.yml/badge.svg)


## The official Velero dapp for managing Vaults and generating Usdv

### Prerequisites

Have installed:

- [Git](https://git-scm.com/downloads)
- [Node](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/lang/en/docs/install/)

### Installation

1. `git clone https://github.com/velerofinance/save-portal.git`

2. `cd mcd-cdp-portal && yarn`

### Running Oasis

- `yarn start`
- Go to http://localhost:3000

For hardware wallet support:

- `HTTPS=true yarn start`
- Go to https://localhost:3000

### Developing with a local testchain

1. Clone either [dai.js](https://github.com/makerdao/dai.js) or the [testchain](https://github.com/makerdao/testchain) repo

2. Start the testchain
   1. If using dai.js, run `yarn && yarn testchain`
   2. If using the testchain repo directly, run `scripts/launch`

3) Navigate to `http://localhost:3000?network=testnet&simplePriceFeeds=1`
