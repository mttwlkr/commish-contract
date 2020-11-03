const LeagueFactory = artifacts.require("./LeagueFactory.sol");
const weeklyJSON = require("../artifacts/WeeklyLeague.json");

const { expect, BN } = require("./setupTests");

contract("Weekly League", (accounts) => {
  const [initialAcct, secondAcct, thirdAcct, fourthAcct] = accounts;
  let leagueFactory;

  let weeklyLeague;
  let weeklyLeagueAddress;

  const weeklyYahooId = 7654321;

  const weeklyMinBuyIn = web3.utils.toWei("1", "ether");

  const weeklyTotalWeeks = 14;
  const maxNumTeams = 10;

  beforeEach(async () => {
    leagueFactory = await LeagueFactory.deployed();

    await leagueFactory.createWeeklyLeague(
      weeklyYahooId,
      weeklyMinBuyIn,
      weeklyTotalWeeks,
      maxNumTeams,
      { from: initialAcct }
    );

    weeklyLeagueAddress = await leagueFactory.weeklyLeagues(weeklyYahooId);
    weeklyLeague = await new web3.eth.Contract(
      weeklyJSON.abi,
      weeklyLeagueAddress
    );
  });

  it("The account that creates the league is the commish", async () => {
    const maybeTheCommish = await weeklyLeague.methods.commish().call();
    expect(maybeTheCommish).to.eq(initialAcct);
  });

  it("The league factory contract is not the league owner", async () => {
    expect(weeklyLeagueAddress).to.not.eq(leagueFactory.address);
    expect(weeklyLeague._address).to.not.eq(leagueFactory.address);
    expect(weeklyLeagueAddress).to.eq(weeklyLeague._address);
  });

  it("Contract has the correct min buy in", async () => {
    const response = await weeklyLeague.methods.minBuyInWei().call();
    const minBuyInBN = new BN(weeklyMinBuyIn);
    const resBN = new BN(response);
    expect(minBuyInBN.toString()).to.eq(resBN.toString());
  });

  it("Contract has the correct id", async () => {
    const response = await weeklyLeague.methods.yahooLeagueId().call();
    expect(response.toString()).to.eq(weeklyYahooId.toString());
  });

  it("Contract has the correct number of weeks", async () => {
    const response = await weeklyLeague.methods.totalWeeks().call();
    expect(response.toString()).to.eq(weeklyTotalWeeks.toString());
  });

  it("Non-Commish accounts cannot call addWeeklyDetails", async () => {
    try {
      await weeklyLeague.methods.addWeeklyDetails(weeklyTotalWeeks).call();
      expect.fail("This should fail and not make it here");
    } catch (error) {
      // The error message does not show here
    }
  });

  it("Should always start at week 1", async () => {
    const response = await weeklyLeague.methods.currentWeek().call();
    expect(response.toString()).to.eq("1");
  });

  it("Non-Commish cannot edit total weeks", async () => {
    try {
      await weeklyLeague.methods.editTotalWeeks(6).send({
        from: secondAcct,
        gas: "1000000",
      });
      expect.fail("This should fail and not make it here");
    } catch (error) {
      expect(1).to.eq(1);
    }
  });

  it("Commish can edit total weeks", async () => {
    const newWeeks = 4;

    try {
      await weeklyLeague.methods.editTotalWeeks(newWeeks).send({
        from: initialAcct,
        gas: "1000000",
      });
    } catch (error) {
      console.error(error);
    }

    const res = await weeklyLeague.methods.totalWeeks().call();
    expect(res.toString()).to.eq(newWeeks.toString());
  });

  it("Cant have more than 17 total weeks", async () => {
    try {
      await weeklyLeague.methods.editTotalWeeks(18).send({
        from: initialAcct,
        gas: "1000000",
      });

      expect.fail("This should fail and not make it here");
    } catch (error) {
      expect(1).to.eq(1);
    }
    const res = await weeklyLeague.methods.totalWeeks().call();
    expect(res.toString()).to.eq(weeklyTotalWeeks.toString());
  });

  it("Cant have negative total weeks", async () => {
    try {
      await weeklyLeague.methods.editTotalWeeks(-1).send({
        from: initialAcct,
        gas: "1000000",
      });
      expect.fail("This should fail and not make it here");
    } catch (error) {
      expect(1).to.eq(1);
    }
    const res = await weeklyLeague.methods.totalWeeks().call();
    expect(res.toString()).to.eq(weeklyTotalWeeks.toString());
  });

  it("Non-Commish cannot invoke payOutWeek", async () => {
    try {
      await weeklyLeague.methods.payOutWeek(12345).send({
        from: secondAcct,
        gas: "1000000",
      });
    } catch (error) {
      expect(1).to.eq(1);
    }
  });

  it("wont let payout go to an address not in teams mapping", async () => {
    const secondTeamId = 12345;
    const thirdTeamId = 54321;

    await weeklyLeague.methods.addTeam(secondTeamId).send({
      from: secondAcct,
      gas: "1000000",
      value: weeklyMinBuyIn,
    });

    await weeklyLeague.methods.addTeam(thirdTeamId).send({
      from: thirdAcct,
      gas: "1000000",
      value: weeklyMinBuyIn,
    });

    try {
      await weeklyLeague.methods.payOutWeek(fourthAcct).send({
        from: initialAcct,
        gas: "1000000",
      });
      expect.fail("This should fail and not make it here");
    } catch (error) {
      expect(1).to.eq(1);
    }
  });

  it("Payout week increments amountWonInWei, current week, and transfers wei", async () => {
    const secondTeamId = 29384756;
    const thirdTeamId = 65748392;

    await weeklyLeague.methods.addTeam(secondTeamId).send({
      from: secondAcct,
      gas: "1000000",
      value: weeklyMinBuyIn,
    });

    const secondAcctBefore = await web3.eth.getBalance(secondAcct);
    const beforeBN = new BN(secondAcctBefore);

    await weeklyLeague.methods.addTeam(thirdTeamId).send({
      from: thirdAcct,
      gas: "1000000",
      value: weeklyMinBuyIn,
    });

    await weeklyLeague.methods.payOutWeek(secondTeamId).send({
      from: initialAcct,
      gas: "1000000",
    });

    // week has incremented
    const week = await weeklyLeague.methods.currentWeek().call();
    expect(week.toString()).to.eq("2");

    // ***** ESTIMATE ROUGH WEEKLY PAYOUT ***** //
    // 2 accounts in x 4 ETH ea
    // 8 ETH / 15 weeks => SLIGHTLY greater than 0.5 ether or "500000000000000000" wei
    const tenthOfEther = new BN("100000000000000000");

    // secondAcct.ammountWonInWei incremented
    const secondTeam = await weeklyLeague.methods.teams(secondTeamId).call();
    const secAmountWonBN = new BN(secondTeam.amountWonInWei);
    // console.log("diff is 0.04 eth:", secAmountWonBN - tenthOfEther);

    expect(secAmountWonBN).to.be.a.bignumber.that.is.greaterThan(tenthOfEther);

    // secondAcct.amount
    const secondAcctAfter = await web3.eth.getBalance(secondAcct);
    const afterBN = new BN(secondAcctAfter);
    expect(afterBN.sub(beforeBN)).to.be.a.bignumber.that.is.greaterThan(
      tenthOfEther
    );
  });

  it("Cant set totalWeeks to less than current week", async () => {
    const secondTeamId = 12345;
    const thirdTeamId = 54321;

    await weeklyLeague.methods.addTeam(secondTeamId).send({
      from: secondAcct,
      gas: "1000000",
      value: weeklyMinBuyIn,
    });

    await weeklyLeague.methods.addTeam(thirdTeamId).send({
      from: thirdAcct,
      gas: "1000000",
      value: weeklyMinBuyIn,
    });

    await weeklyLeague.methods.payOutWeek(secondTeamId).send({
      from: initialAcct,
      gas: "1000000",
    });

    try {
      await weeklyLeague.methods.editTotalWeeks(1).send({
        from: initialAcct,
        gas: "1000000",
      });
      expect.fail("This should fail and not make it here");
    } catch (error) {
      // console.error(error);
    }

    const res = await weeklyLeague.methods.currentWeek().call();
    expect(res.toString()).to.eq("2");
  });
});
