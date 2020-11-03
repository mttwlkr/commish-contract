const BaseLeague = artifacts.require("./BaseLeague.sol");

const { expect, BN } = require("./setupTests");

contract("Base League", (accounts) => {
  const [initialAcct, secondAcct, thirdAcct] = accounts;
  let baseLeague;
  const yahooLeagueId = 23456789;
  const yahooTeamId = 9876543;
  let minBuyInWei = web3.utils.toWei("3", "ether");
  const maxNumTeams = 2;

  beforeEach(async () => {
    baseLeague = await BaseLeague.new(
      initialAcct,
      yahooLeagueId,
      minBuyInWei,
      maxNumTeams
    );
  });

  it("should calculatePercent correctly", async () => {
    // two decimals!! 30% is 3000;
    let percentTwoPlaces = 3000;
    const totalPotBN = new BN(web3.utils.toWei("10", "ether"));
    const percentTwoPlacesBN = new BN(percentTwoPlaces);

    const cpResult = await baseLeague.calculatePercentage(
      totalPotBN.toString(),
      percentTwoPlacesBN.toString()
    );
    const decimal = percentTwoPlaces / 10000;
    const expected = totalPotBN * decimal;
    expect(cpResult.toString()).to.eq(expected.toString());
  });

  it("the creator of the league is the commisioner of the league", async () => {
    const commish = await baseLeague.commish();
    expect(commish).to.eq(initialAcct);
  });

  it("should not allow an account to add a team if they are short wei", async () => {
    try {
      await baseLeague.addTeam(yahooTeamId, {
        from: thirdAcct,
        value: web3.utils.toWei("0.5", "ether"),
      });
      expect.fail("This should fail and not make it here");
    } catch (error) {
      expect(error.reason).to.eq("Not enough wei");
    }
  });

  it("should not allow the same yahoo team id to submit twice", async () => {
    await baseLeague.addTeam(123, {
      from: initialAcct,
      value: minBuyInWei,
    });

    try {
      await baseLeague.addTeam(123, {
        from: secondAcct,
        value: minBuyInWei,
      });
      expect.fail("This should fail and not make it here");
    } catch (error) {
      expect(error.reason).to.eq("This user already exists");
    }
  });

  it("should not allow more teams than the max to enter", async () => {
    await baseLeague.addTeam(123545, {
      from: initialAcct,
      value: minBuyInWei,
    });

    await baseLeague.addTeam(23456, {
      from: secondAcct,
      value: minBuyInWei,
    });

    try {
      await baseLeague.addTeam(34567, {
        from: thirdAcct,
        value: minBuyInWei,
      });
      expect.fail("This should fail and not make it here");
    } catch (error) {
      expect(error.reason).to.eq("Max team limit reached");
    }
  });

  it("should allow another account to add a team", async () => {
    await baseLeague.addTeam(yahooTeamId, {
      from: thirdAcct,
      value: minBuyInWei,
    });
    const teamFromMapping = await baseLeague.teams(yahooTeamId);
    expect(teamFromMapping.payoutAddress).to.eq(thirdAcct);
  });

  it("should increment currentTeams on successful addTeam", async () => {
    await baseLeague.addTeam(yahooTeamId, {
      from: secondAcct,
      value: minBuyInWei,
    });

    const currentNum = await baseLeague.currentTeams();
    expect(currentNum.toString()).to.eq("1");
  });

  it("should let the commish withdraw all funds", async () => {
    const beforeBalance = await web3.eth.getBalance(initialAcct);

    await baseLeague.addTeam(yahooTeamId, {
      from: thirdAcct,
      value: minBuyInWei,
    });

    await baseLeague.withdrawAllMoney(initialAcct, {
      from: initialAcct,
    });

    const afterBalance = await web3.eth.getBalance(initialAcct);

    const beforeETH = web3.utils.fromWei(beforeBalance);
    const afterETH = web3.utils.fromWei(afterBalance);
    const diff = afterETH - beforeETH;
    expect(diff).to.be.above(0.98);
  });

  it("should not let anyone besides the commish withdraw funds", async () => {
    try {
      await baseLeague.withdrawAllMoney(secondAcct, {
        from: secondAcct,
      });
    } catch (error) {
      expect(error.reason).to.eq("Not the commish");
    }
  });

  it("should get all the team info", async () => {
    const secondTeamId = 66666666;

    await baseLeague.addTeam(yahooTeamId, {
      from: thirdAcct,
      value: minBuyInWei,
    });

    await baseLeague.addTeam(secondTeamId, {
      from: secondAcct,
      value: minBuyInWei,
    });

    const result = await baseLeague.getAllTeams();

    const events =
      result &&
      result.logs.map((log) => ({
        teamId: log.args.teamId.toString(),
        amountPaidInWei: log.args.amountPaidInWei.toString(),
        amountWonInWei: log.args.amountWonInWei.toString(),
      }));

    expect(events[0].teamId).to.eq(new BN(yahooTeamId).toString());
    expect(events[0].amountPaidInWei.toString()).to.eq(
      new BN(minBuyInWei).toString()
    );

    expect(events[1].teamId).to.eq(new BN(secondTeamId).toString());
    expect(events[1].amountPaidInWei.toString()).to.eq(
      new BN(minBuyInWei).toString()
    );
  });
});
