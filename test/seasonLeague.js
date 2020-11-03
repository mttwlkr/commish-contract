const LeagueFactory = artifacts.require("./LeagueFactory.sol");
const seasonJSON = require("../artifacts/SeasonLeague.json");

const { expect, BN } = require("./setupTests");

contract("Season League", (accounts) => {
  const [initialAcct, secondAcct, thirdAcct, fourthAcct] = accounts;

  let seasonLeague;
  let seasonLeagueAddress;
  const seasonYahooId = 1234567;
  const seasonMinBuyIn = web3.utils.toWei("2", "ether");
  const maxNumTeams = 6;
  let percents = [6167, 3000, 833, 0];

  beforeEach(async () => {
    leagueFactory = await LeagueFactory.deployed();

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
  });

  it("The account that creates the league is the commish", async () => {
    const maybeTheCommish = await seasonLeague.methods.commish().call();
    expect(maybeTheCommish).to.eq(initialAcct);
  });

  it("NumAwards variable only tracks percentages above zero", async () => {
    const numAwards = await seasonLeague.methods.numAwards().call();
    expect(numAwards).to.eq("3");
  });

  it("The league factory contract is not the league owner", async () => {
    expect(seasonLeagueAddress).to.not.eq(leagueFactory.address);
    expect(seasonLeague._address).to.not.eq(leagueFactory.address);
    expect(seasonLeagueAddress).to.eq(seasonLeague._address);
  });

  it("Has the correct min buy in", async () => {
    const response = await seasonLeague.methods.minBuyInWei().call();
    const minBuyInBN = new BN(seasonMinBuyIn);
    const resBN = new BN(response);
    expect(minBuyInBN.toString()).to.eq(resBN.toString());
  });

  it("Has the correct id", async () => {
    const response = await seasonLeague.methods.yahooLeagueId().call();
    expect(response.toString()).to.eq(seasonYahooId.toString());
  });

  it("wont let the same id finish in multiple places", async () => {
    await seasonLeague.methods
      .addTeam(initialAcct)
      .send({ from: initialAcct, value: seasonMinBuyIn, gas: "1000000" });

    try {
      await seasonLeague.methods
        .payOutSeason(initialAcct, initialAcct, initialAcct)
        .send({
          from: initialAcct,
          gas: "1000000",
        });

      expect.fail("This should fail and not make it here");
    } catch (error) {
      expect(1).to.eq(1);
    }
  });

  it("Pays out the correct prize money with three teams", async () => {
    const teamOne = "420420";
    const teamTwo = "696969";
    const teamThree = "111111";
    const teamFour = "999999";

    const isOverBefore = await seasonLeague.methods.isSeasonDone().call();
    expect(isOverBefore).to.eq(false);

    await seasonLeague.methods
      .addTeam(teamOne)
      .send({ from: initialAcct, value: seasonMinBuyIn, gas: "1000000" });

    await seasonLeague.methods
      .addTeam(teamTwo)
      .send({ from: secondAcct, value: seasonMinBuyIn, gas: "1000000" });

    await seasonLeague.methods
      .addTeam(teamThree)
      .send({ from: thirdAcct, value: seasonMinBuyIn, gas: "1000000" });

    await seasonLeague.methods
      .addTeam(teamFour)
      .send({ from: fourthAcct, value: seasonMinBuyIn, gas: "1000000" });

    const oneBalBefore = await web3.eth.getBalance(initialAcct);
    const twoBalBefore = await web3.eth.getBalance(secondAcct);
    const threeBalBefore = await web3.eth.getBalance(thirdAcct);
    const fourBalBefore = await web3.eth.getBalance(fourthAcct);

    const totalPotBefore = await web3.eth.getBalance(
      seasonLeague.options.address
    );

    await seasonLeague.methods
      .payOutSeason([teamOne, teamTwo, teamThree, 0])
      .send({
        from: initialAcct,
        gas: "1000000",
      });

    //  initial Account wins
    const oneBalAfter = await web3.eth.getBalance(initialAcct);
    const firstPlacePercentOfPot =
      (oneBalAfter - oneBalBefore) / totalPotBefore;
    expect(firstPlacePercentOfPot).to.be.above((percents[0] - 100) / 10000);

    // secondAcct must get second place
    const twoBalAfter = await web3.eth.getBalance(secondAcct);
    const secondPercentOfPot = (twoBalAfter - twoBalBefore) / totalPotBefore;
    expect(secondPercentOfPot).to.be.above((percents[1] - 100) / 10000);

    // thirdAcct gets third
    const threeBalAfter = await web3.eth.getBalance(thirdAcct);
    const thirdPercentOfPotWon =
      (threeBalAfter - threeBalBefore) / totalPotBefore;
    expect(thirdPercentOfPotWon).to.be.above((percents[2] - 100) / 10000);

    // // fourthAcct gets nothing
    const fourBalAfter = await web3.eth.getBalance(fourthAcct);
    expect(fourBalBefore).to.eq(fourBalAfter);

    const isOverAfter = await seasonLeague.methods.isSeasonDone().call();
    expect(isOverAfter).to.eq(true);
  });
});
