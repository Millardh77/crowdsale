//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Token.sol";

contract Crowdsale {
    address public owner;
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;
    uint256 public mincontributionAmount = 10;
    uint256 public maxcontributionAmount = 10000;
    uint256 public timeDeployed;
    uint256 public allowBuyingAfter = 0;


    mapping(uint256 => _Whitelist) public whiteLists;
    mapping(address => uint256) public whiteListed;

    uint256 public whiteListCount = 0;

    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);
    struct _Whitelist {
        // Attributes of an whitelist
        uint256 id; // Unique identifier for whitelisted user
        address user; // User added to whitelist
    }

    event AddToWhitelist(
        uint256 id,
        address user
    );

    constructor(
        Token _token,
        uint256 _price,
        uint256 _maxTokens,
        uint256 _allowBuyingingOn
    ) {
        if (_allowBuyingingOn > block.timestamp) {
        allowBuyingAfter = _allowBuyingingOn - block.timestamp;
        }
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
        timeDeployed = block.timestamp;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }
    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    function buyTokens(uint256 _amount) public payable {
        // require(
        //     block.timestamp >= timeDeployed + allowBuyingAfter,
        //     "Buying not allowed yet"
        // );
        require(whiteListCount > 0);
        require(whiteListed[msg.sender] > 0);
        require(msg.value == (_amount / 1e18) * price);
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount));

        tokensSold += _amount;

        emit Buy(_amount, msg.sender);

    }
    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    // Finalize Sale
    function finalize() public onlyOwner {

        require(token.transfer(owner, token.balanceOf(address(this))));

        uint256 value = address(this).balance;
        (bool sent, ) = owner.call{value: value}("");
        require(sent);

        emit Finalize(tokensSold, value);
    }
    function addToWhiteList( address _whiteListAddress) public onlyOwner {
        whiteListCount ++;
        // Add address to White List
        whiteLists[whiteListCount - 1] = _Whitelist(
            whiteListCount,
            _whiteListAddress
        );
        whiteListed[_whiteListAddress] = whiteListCount;
        // Emit event
        emit AddToWhitelist(
            whiteListCount,
            _whiteListAddress
        );

    }
    function getWhiteListItem(uint256 _id) public view returns (address)
        {
            // Fetch white list item
            _Whitelist storage whitelist = whiteLists[_id];

            return whitelist.user;
        }
    function getAllowBuyingAfter() public view returns (uint256) {
            return allowBuyingAfter;
        }
    function getTimeDeployed() public view returns (uint256) {
            return block.timestamp;
        }
    function getSecondsUntilStart() public view returns (uint256) {
        if (block.timestamp < timeDeployed + allowBuyingAfter) {
            return (timeDeployed + allowBuyingAfter) - block.timestamp;
        } else {
            return 0;
        }
    }

}