//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Token.sol";

contract Crowdsale {
    address public owner;
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;
    uint256 public minContributionAmount;
    uint256 public maxContributionAmount;
    uint256 public timeDeployed;
    uint256 public allowBuyingAfter;

    mapping(address => bool) public whiteListed;

    uint256 public whiteListCount = 0;

    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);

    event AddToWhitelist(
        address user
    );

    constructor(
        Token _token,
        uint256 _price,
        uint256 _maxTokens,
        uint256 _timeDeployed,
        uint256 _allowBuyingingAfter
    ) {
        allowBuyingAfter = _allowBuyingingAfter;
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
        timeDeployed = _timeDeployed;
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
        // require(block.timestamp >= allowBuyingAfter, "not time to buy yet");
        require(whiteListCount > 0);
        require(whiteListed[msg.sender]);
        require(msg.value == (_amount / 1e18) * price);
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount));

        tokensSold += _amount;

        emit Buy(_amount, msg.sender);

    }
    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    function setMinContributionAmt(uint256 _minContributionAmt) public onlyOwner {
        minContributionAmount = _minContributionAmt;
    }

    function setMaxContributionAmt(uint256 _maxContributionAmt) public onlyOwner {
        maxContributionAmount = _maxContributionAmt;
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
        whiteListed[_whiteListAddress] = true;
        // Emit event
        emit AddToWhitelist(
            _whiteListAddress
        );
    }
}