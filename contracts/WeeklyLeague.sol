pragma solidity 0.6.6;

import "./BaseLeague.sol";

import "@openzeppelin/contracts/math/SafeMath.sol";

contract WeeklyLeague is BaseLeague {
    using SafeMath for uint256;

    uint256 public totalWeeks;
    uint256 public currentWeek;

    constructor(
        address _commish,
        uint256 _yahooLeagueId,
        uint256 _minBuyInWei,
        uint256 _maxTeams
    ) public BaseLeague(_commish, _yahooLeagueId, _minBuyInWei, _maxTeams) {}

    // this function will be called by contract factory, so internal?
    function addWeeklyDetails(uint256 _totalWeeks) public isFactoryContract {
        totalWeeks = _totalWeeks;
        currentWeek = 1;
    }

    function editTotalWeeks(uint256 _totalWeeks) public onlyCommish {
        require(
            _totalWeeks >= currentWeek,
            "Total weeks cant be less than current week"
        );
        require(_totalWeeks <= 17, "There are max 17 weeks in the NFL season");
        require(
            _totalWeeks >= 1,
            "There is more than zero weeks in the NFL season"
        );

        totalWeeks = _totalWeeks;
    }

    function payOutWeek(uint256 _winningTeamId) public onlyCommish {
        require(
            isValidAddress(teams[_winningTeamId].payoutAddress),
            "Not a valid user"
        );
        // checks

        // we want to leave enough for the last week...
        uint256 totalWeeksIncludingLastWeek = totalWeeks.add(1);
        uint256 weeksLeft = totalWeeksIncludingLastWeek.sub(currentWeek);
        uint256 amountToPay = address(this).balance.div(weeksLeft);

        // effects

        uint256 newAmountWon = teams[_winningTeamId].amountWonInWei.add(
            amountToPay
        );

        teams[_winningTeamId].amountWonInWei = newAmountWon;
        currentWeek = currentWeek.add(1);

        // interacts
        teams[_winningTeamId].payoutAddress.transfer(amountToPay);
    }
}
