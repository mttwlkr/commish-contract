# Welcome to Commish-Contracts

## Commish Overview

After being apart of a multinational, Fantasy Football league, I realized a problem; the timely and efficient collection and distribution of dues internationally. \$50 buy-in? After currency conversion and fees, the pot is short. And that is if the money even clears, we had an international check take four months to be cashed. Enter Commish. Regardless of country, all dues are collected/paid in Ether within minutes. Contracts are set up by league Id and can have two options, Season or Weekly.

Season leagues can be winner-take-all or custom percentage payouts up to 4 places. When the season is done, simply enter the ID's of the winners.

Weekly leagues keep track of the total number of weeks to play and divvy up a weekly payout (probably for most-points-scored). Simply put in the ID of that week's winner, they are paid one week's percentage of the pot. The week and amount is taken care of.

### Future todo list

- Better loading UI for waiting on blockchain events.
- Build a scrapper or API that automatically selects the winner(s) when Yahoo announces the winners

## Installation

### `git clone git@github.com:mttwlkr/commish-contracts.git`

Install all dependencies

### `npm install`

## Truffle

Make sure you have [Truffle](https://www.trufflesuite.com/truffle) installed!

## Ganache

Make sure you have [Ganache](https://www.trufflesuite.com/ganache) installed!

## Remix

[Remix](https://www.trufflesuite.com/ganache) is a helpful tool for faster development without having to write a client, set up a local blockchain or connect to a test chain. You can also interact with a contract running on a local chain from the browser.

## Metamask

If you're going to use the client, make sure you have [Metamask](https://www.trufflesuite.com/ganache) installed!

## Client interaction

This project originated as a [truffle box](https://www.trufflesuite.com/boxes) monorepo. I split the client/contract repos apart.

[Here is the React client](https://github.com/mttwlkr/commish-client) to interact with these contracts.

## Artifacts

In order for any client to interact with a smart contract, it needs a JSON version of the contract's ABI, Truffle calls these `Artifacts`. When you run `truffle migrate` Contract ABI's are generated and put into the `artifacts` directory in this repo. They are also added to the [commish-client](https://github.com/mttwlkr/commish-client) repo in the `src/contracts` directory. If you're planning to clone the client, make sure the path to this directory is correct. If you're not using the client and only want to test the contracts, the second `contracts_build_directory` property on `line 10` can be commented out in `truffle-config.js`

## Tests

Before running tests or a development environment, make sure Ganache is running.

The `truffle-config.js` default for development on your local host is set to `port: 7545` and `network_id: 5777`. Update these settings in the truffle config as well as Ganache.

In the root directory, run migrations...

### `truffle migrate`

Then you can run:

### `truffle test`

This Launches the test runner<br  />

See the section about [running tests](https://www.trufflesuite.com/docs/truffle/testing/testing-your-contracts) for more information.

## Deploying via Provider / .env

In order to deploy contracts to remote block chains (main net or test chains such as Ropsten, Rinkeby, Gorli, etc), you must use a provider. Truffle's HD Wallet Provider is included as a dependency. However, you must create a `.env` file to store your `MNEMONIC` - which is the account that will be used to deploy your contracts to whatever chain you specify in the `truffle-config.js`.

## TLDR

### Running Tests

`Start Ganache`
`truffle migrate`
`truffle test`

### Using Client

`Start Ganache`
Reset Metamask accounts (reset nonce)
`truffle console` (while in console)

- `web3.eth.sendTransaction({ from: accounts[0], to:"your-metamask-account", value: web3.utils.toWei("however-much-ether-you-want", "ether") })` (send Ganache ether to your Metamask accounts)
- `migrate --reset`
