var LeagueFactory = artifacts.require("./LeagueFactory.sol");
// var League = artifacts.require("./League.sol");

module.exports = function (deployer) {
  deployer.deploy(LeagueFactory);
  // deployer.deploy(League);
};
