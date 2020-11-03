pragma solidity 0.6.6;

import "./SeasonLeague.sol";
import "./WeeklyLeague.sol";

contract LeagueFactory {
    mapping(uint256 => address) public seasonLeagues;
    mapping(uint256 => address) public weeklyLeagues;

    function createSeasonLeague(
        uint256 _yahooLeagueId,
        uint256 _minBuyInWei,
        uint256 _teamLimit,
        uint256[] memory _percents
    ) public {
        require(_percents.length == 4, "Must have 4 percents");
        uint256 totalPercents = _percents[0] +
            (_percents[1]) +
            (_percents[2]) +
            (_percents[3]);

        require(totalPercents == 10000, "Does not equal 100%");

        SeasonLeague league = new SeasonLeague(
            msg.sender,
            _yahooLeagueId,
            _minBuyInWei,
            _teamLimit
        );
        seasonLeagues[_yahooLeagueId] = address(league);
        league.addSeasonDetails(_percents);
    }

    function createWeeklyLeague(
        uint256 _yahooLeagueId,
        uint256 _minBuyInWei,
        uint8 _totalWeeks,
        uint256 _teamLimit
    ) public {
        WeeklyLeague league = new WeeklyLeague(
            msg.sender,
            _yahooLeagueId,
            _minBuyInWei,
            _teamLimit
        );
        weeklyLeagues[_yahooLeagueId] = address(league);
        league.addWeeklyDetails(_totalWeeks);
    }
}
