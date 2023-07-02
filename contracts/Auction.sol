// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Auction
 * @author https://github.com/K-kaddal
 * @dev For upgradebility, we can have proxy contract as an entry point 
 * to interact with implementation contract separting implementation from storage.
 */
contract Auction {
  address public auctioneer;
  uint256 public auctionStartTime;
  uint256 public auctionEndTime;
  uint256 public totalQuantity;
  bool public isAuctionEnded;
  IERC20 public token;

  struct Bid {
    address bidder;
    uint quantity;
    uint price;
  }

  Bid[] public bids;

  modifier onlyAuctioneer() {
    require(
      msg.sender == auctioneer,
      "Only the auctioneer can call this function."
    );
    _;
  }

  modifier onlyBidder() {
    require(msg.sender != auctioneer, "Only bidders can call this function.");
    _;
  }

  modifier auctionIsRunning() {
    require(!isAuctionEnded, "Auction ended.");
    _;
  }

  event AuctionStarted(uint256 startTime, uint256 endTime, uint256 quantity);
  event BidPlaced(address bidder, uint256 quantity, uint256 price);
  event AuctionEnded(address bidder, uint256 quantity, uint256 price);

  constructor() {
    auctioneer = msg.sender;
  }

  /**
   * @dev Public function that allows only the auctioneer to start the auction.
   * @param _duration The duration of the auction starting from the time of calling the function.
   * @param _totalQuantity The total quantity of ERC20 tokens to be auctioned.
   * @param _tokenAddress The ERC20 token address that is to be auctioned.
   */
  function startAuction(
    uint256 _duration,
    uint256 _totalQuantity,
    address _tokenAddress
  ) public onlyAuctioneer auctionIsRunning {
    require(_totalQuantity > 0, "Quantity must be greater than zero.");
    require(_duration > 0, "Duration must be greater than zero.");

    auctionStartTime = block.timestamp;
    auctionEndTime = block.timestamp + _duration;

    token = IERC20(_tokenAddress);

    require(
      token.balanceOf(address(this)) >= totalQuantity,
      "There is not sufficiend minted tokens for the auction"
    );

    totalQuantity = _totalQuantity;

    isAuctionEnded = false;

    emit AuctionStarted(auctionStartTime, auctionEndTime, _totalQuantity);
  }

  /**
   * @dev Public function allows only bidders to place their bids.
   * @param _quantity The quantity of desired tokens
   * @param _price The proposed price for the bid
   */
  function placeBid(
    uint _quantity,
    uint _price
  ) public onlyBidder auctionIsRunning {
    require(_quantity > 0, "Quantity must be greater than zero.");
    require(
      _quantity <= totalQuantity,
      "Desired quantity must be less or equal to the totalQuantity"
    );
    require(_price > 0, "Price must be greater than zero.");

    bids.push(Bid({ bidder: msg.sender, quantity: _quantity, price: _price }));

    emit BidPlaced(msg.sender, _quantity, _price);
  }

  /**
   * @dev Public function to end the auction and fill all bids from highest to lower.
   * The bids are filled by selling tokens to the highest bidders.
   * Called only by the auctioneer
   */
  function endAuction() public onlyAuctioneer auctionIsRunning {
    require(block.timestamp < auctionEndTime, "Auction still runing");

    uint256 remainingTokens = token.balanceOf(address(this));

    // Sort all bids based on Quantity and Price
    sortBids();

    for (uint256 i = 0; i < bids.length; i++) {
      uint256 tokensToSell = bids[i].quantity;

      if (tokensToSell <= remainingTokens) {
        require(token.approve(address(this), tokensToSell), "Approval failed!");
        require(
          token.transferFrom(address(this), bids[i].bidder, tokensToSell),
          "Transfer failed!"
        );

        remainingTokens -= tokensToSell;
      } else {
        require(
          token.approve(address(this), remainingTokens),
          "Approval failed!"
        );
        require(
          token.transferFrom(address(this), bids[i].bidder, remainingTokens),
          "Transfer failed!"
        );

        remainingTokens = 0;
      }
    }

    isAuctionEnded = true;
    emit AuctionEnded(bids[0].bidder, bids[0].quantity, bids[0].price);
  }

  /**
   * @dev Internal function to sort bids based on quantity * price.
   * @dev For better Gas Optimisation. we can use merge sorting instead of bubble sorting
   */
  function sortBids() internal {
    for (uint256 i = 0; i < bids.length - 1; i++) {
      for (uint256 j = 0; j < bids.length - i - 1; j++) {
        if (
          (bids[j].price * bids[j].quantity) <
          (bids[j + 1].price * bids[j + 1].quantity)
        ) {
          Bid memory temp = bids[j];
          bids[j] = bids[j + 1];
          bids[j + 1] = temp;
        }
      }
    }
    // return bids[0];
  }
}
