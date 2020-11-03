const LeagueFactory = artifacts.require("./LeagueFactory.sol");
const seasonJSON = require("../artifacts/SeasonLeague.json");
const weeklyJSON = require("../artifacts/WeeklyLeague.json");

const { expect, BN } = require("./setupTests");

contract("LeagueFactory", (accounts) => {
  const [initialAcct, secondAcct] = accounts;
  let leagueFactory;

  let seasonLeague;
  let seasonLeagueAddress;

  let weeklyLeague;
  let weeklyLeagueAddress;

  const seasonYahooId = 1234567;
  const weeklyYahooId = 7654321;

  const seasonMinBuyIn = web3.utils.toWei("2", "ether");
  const weeklyMinBuyIn = web3.utils.toWei("4", "ether");

  const weeklyTotalWeeks = 14;
  const maxNumTeams = 12;

  const percents = [6167, 3000, 833, 0];

  beforeEach(async () => {
    leagueFactory = await LeagueFactory.deployed();
  });

  it("should keep track of season league contract addresses", async () => {
    await leagueFactory.createSeasonLeague(
      seasonYahooId,
      seasonMinBuyIn,
      maxNumTeams,
      percents
    );

    seasonLeagueAddress = await leagueFactory.seasonLeagues(seasonYahooId);

    seasonLeague = await new web3.eth.Contract(
      seasonJSON.abi,
      seasonLeagueAddress
    );

    const response = await seasonLeague.methods.yahooLeagueId().call();
    expect(response.toString()).to.eq(seasonYahooId.toString());
  });

  it("should not allow you to make a season league without four percents", async () => {
    try {
      await leagueFactory.createSeasonLeague(
        seasonYahooId,
        seasonMinBuyIn,
        maxNumTeams,
        [1, 2, 3]
      );
      expect.fail("This should fail and not make it here");
    } catch (error) {
      expect(1).to.eq(1);
    }
  });

  it("should not allow you to make a season league if percents are under 10000", async () => {
    try {
      await leagueFactory.createSeasonLeague(
        seasonYahooId,
        seasonMinBuyIn,
        maxNumTeams,
        [9000, 500, 499, 0]
      );
      expect.fail("This should fail and not make it here");
    } catch (error) {
      expect(1).to.eq(1);
    }
  });

  it("should not allow you to make a season league if percents are over 10000", async () => {
    try {
      await leagueFactory.createSeasonLeague(
        seasonYahooId,
        seasonMinBuyIn,
        maxNumTeams,
        [9000, 500, 500, 1]
      );
      expect.fail("This should fail and not make it here");
    } catch (error) {
      expect(1).to.eq(1);
    }
  });

  it("should keep track of weekly leagues contract addresses", async () => {
    await leagueFactory.createWeeklyLeague(
      weeklyYahooId,
      weeklyMinBuyIn,
      weeklyTotalWeeks,
      maxNumTeams,
      { from: secondAcct }
    );

    weeklyLeagueAddress = await leagueFactory.weeklyLeagues(weeklyYahooId);
    weeklyLeague = await new web3.eth.Contract(
      weeklyJSON.abi,
      weeklyLeagueAddress
    );

    const response = await weeklyLeague.methods.yahooLeagueId().call();
    expect(response.toString()).to.eq(weeklyYahooId.toString());
  });
});
