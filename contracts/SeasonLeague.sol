pragma solidity 0.6.6;

import "./BaseLeague.sol";

contract SeasonLeague is BaseLeague {
    struct Award {
        uint256 percent;
    }

    mapping(uint256 => Award) public awards;
    uint256 public numAwards = 0;
    bool public isSeasonDone = false;

    constructor(
        address _commish,
        uint256 _yahooLeagueId,
        uint256 _minBuyInWei,
        uint256 _maxTeams
    ) public BaseLeague(_commish, _yahooLeagueId, _minBuyInWei, _maxTeams) {}

    function addSeasonDetails(uint256[] memory _percents)
        public
        isFactoryContract
    {
        uint8 i = 0;
        // the loop is cheaper on gas...
        while (i < _percents.length) {
            Award memory award = Award({percent: _percents[i]});
            awards[i + 1] = award;
            if (_percents[i] > 0) {
                numAwards++;
            }
            i++;
        }
    }

    function payOutSeason(uint256[] memory _winners) public onlyCommish {
        // checks
        require(_winners.length == 4, "Must have four winners");
        // require valid payout address?

        // require(
        //     isValidAddress(teams[_winners[0]].payoutAddress),
        //     "First place is not a valid user"
        // );

        // effects
        uint256 amountToPay = address(this).balance;
        uint256 firstAmount = calculatePercentage(
            amountToPay,
            awards[1].percent
        );
        uint256 secondAmount = calculatePercentage(
            amountToPay,
            awards[2].percent
        );
        uint256 thirdAmount = calculatePercentage(
            amountToPay,
            awards[3].percent
        );
        uint256 fourthAmount = calculatePercentage(
            amountToPay,
            awards[4].percent
        );

        teams[_winners[0]].amountWonInWei = teams[_winners[0]]
            .amountWonInWei
            .add(firstAmount);

        teams[_winners[1]].amountWonInWei = teams[_winners[1]]
            .amountWonInWei
            .add(secondAmount);

        teams[_winners[2]].amountWonInWei = teams[_winners[2]]
            .amountWonInWei
            .add(thirdAmount);

        teams[_winners[3]].amountWonInWei = teams[_winners[3]]
            .amountWonInWei
            .add(fourthAmount);

        isSeasonDone = true;

        // interacts
        teams[_winners[0]].payoutAddress.transfer(firstAmount);
        teams[_winners[1]].payoutAddress.transfer(secondAmount);
        teams[_winners[2]].payoutAddress.transfer(thirdAmount);
        teams[_winners[3]].payoutAddress.transfer(fourthAmount);
    }
}
