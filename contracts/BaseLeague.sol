pragma solidity 0.6.6;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract BaseLeague {
    using SafeMath for uint256;

    struct Team {
        address payable payoutAddress;
        uint256 amountWonInWei;
        uint256 amountPaidInWei;
    }

    mapping(uint256 => Team) public teams;
    uint256 public maxTeams;
    uint256 public currentTeams;
    uint256[] public teamIds;

    address internal factoryAddress;
    address public commish;
    uint256 public yahooLeagueId;
    uint256 public minBuyInWei;

    constructor(
        address _commish,
        uint256 _yahooLeagueId,
        uint256 _minBuyInWei,
        uint256 _maxTeams
    ) public {
        commish = _commish;
        yahooLeagueId = _yahooLeagueId;
        minBuyInWei = _minBuyInWei;
        factoryAddress = msg.sender;
        maxTeams = _maxTeams;
        currentTeams = 0;
    }

    function addTeam(uint256 _teamId) public payable enoughBuyIn {
        require(
            !isValidAddress(teams[_teamId].payoutAddress),
            "This user already exists"
        );
        require(teamIds.length < maxTeams, "Max team limit reached");

        Team memory team = Team({
            payoutAddress: msg.sender,
            amountPaidInWei: msg.value,
            amountWonInWei: 0
        });

        teams[_teamId] = team;
        teamIds.push(_teamId);
        currentTeams++;
    }

    event TeamInfo(
        uint256 teamId,
        uint256 amountWonInWei,
        uint256 amountPaidInWei
    );

    function getAllTeams() public {
        uint256 index = 0;
        while (index < currentTeams) {
            emit TeamInfo(
                teamIds[index],
                teams[teamIds[index]].amountWonInWei,
                teams[teamIds[index]].amountPaidInWei
            );
            index++;
        }
    }

    modifier onlyCommish() {
        require(msg.sender == commish, "Not the commish");
        _;
    }

    modifier enoughBuyIn() {
        require(msg.value >= minBuyInWei, "Not enough wei");
        _;
    }

    modifier isFactoryContract() {
        require(msg.sender == factoryAddress, "Not factory contract");
        _;
    }

    modifier validAddress(address _addr) {
        require(isValidAddress(_addr), "Not valid address");
        _;
    }

    function isValidAddress(address _addr) internal pure returns (bool) {
        return (_addr != address(0));
    }

    function calculatePercentage(uint256 _total, uint256 _percent)
        public
        pure
        returns (uint256)
    {
        uint256 mult = _total.mul(_percent);
        uint256 answer = mult.div(10000);
        return answer;
    }

    function withdrawAllMoney(address payable _to) public onlyCommish {
        _to.transfer(address(this).balance);
    }
}
