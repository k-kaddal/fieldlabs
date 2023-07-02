import { ethers } from "hardhat";
import { expect } from "chai";
import { Auction, Token } from "../typechain-types";

const AUCTION_CONTRACT_NAME = "Auction";
const TOKEN_CONTRACT_NAME = "Token";
const DURATION = 5;
const TOTAL_QUANTITY = 10;

const BIDS = [
  {
    BID_QUANTITY: 1,
    BID_PRICE: 55,
  },
  {
    BID_QUANTITY: 2,
    BID_PRICE: 60,
  },
  {
    BID_QUANTITY: 3,
    BID_PRICE: 66,
  },
];

describe("Auction", async () => {
  const Auction = await ethers.getContractFactory(AUCTION_CONTRACT_NAME);
  const Token = await ethers.getContractFactory(TOKEN_CONTRACT_NAME);

  let auction: Auction;
  let token: Token;

  let auctioneer: any, bidder1: any, bidder2: any, bidder3: any;

  beforeEach(async () => {
    [auctioneer, bidder1, bidder2, bidder3] = await ethers.getSigners();
    auction = await Auction.deploy();
    token = await Token.deploy("TokenName", "TokenSymbol");
    await token.mint(auction.getAddress(), TOTAL_QUANTITY);
  });

  describe("Auction Deployment", () => {
    it("Sets the auctioneer", async () => {
      let setAuctioneer = await auction.auctioneer();
      expect(setAuctioneer).to.equal(auctioneer.address);
    });
  });

  describe("Starting Auction", () => {
    it("is called only by the auctioneer", async () => {
      try {
        await auction
          .connect(bidder1)
          .startAuction(DURATION, TOTAL_QUANTITY, token.getAddress());
      } catch (error) {
        expect(error).to.be.an("Error");
      }
    });

    // START AN AUCTION
    beforeEach(async () => {
      const transaction = await auction
        .connect(auctioneer)
        .startAuction(DURATION, TOTAL_QUANTITY, token.getAddress());

      await transaction.wait();
    });

    it("sets the starting time of the auction", async () => {
      let auctionStartTime = await auction.auctionStartTime();
      expect(auctionStartTime).to.greaterThan(0);
    });

    it("sets the ending time of the auction", async () => {
      let auctionStartTime = await auction.auctionStartTime();
      let auctionEndTime = await auction.auctionEndTime();
      expect(auctionEndTime).to.equal(Number(auctionStartTime) + DURATION);
    });

    it("sets auction total quantity", async () => {
      let totalQuantity = await auction.totalQuantity();
      expect(totalQuantity).to.equal(TOTAL_QUANTITY);
    });

    it("flags the auction as started", async () => {
      let isAuctionEnded = await auction.isAuctionEnded();
      expect(isAuctionEnded).to.equal(false);
    });
  });

  describe("Placing a Bid", () => {
    it("is called only by a bidder", async () => {
      try {
        await auction
          .connect(auctioneer)
          .placeBid(BIDS[0].BID_QUANTITY, BIDS[0].BID_PRICE);
      } catch (error) {
        expect(error).to.be.an("Error");
      }
    });

    beforeEach(async () => {
      // START AN AUCITON
      const startAuctionTransaction = await auction
        .connect(auctioneer)
        .startAuction(DURATION, TOTAL_QUANTITY, token.getAddress());
      await startAuctionTransaction.wait();

      // PLACE A BID
      const placeBidTransaction = await auction
        .connect(bidder1)
        .placeBid(BIDS[0].BID_QUANTITY, BIDS[0].BID_PRICE);
      await placeBidTransaction.wait();
    });

    it("called only if auction has been started", async () => {
      let isAuctionEnded = await auction.isAuctionEnded();
      expect(isAuctionEnded).to.equal(false);
    });

    it("places the bid with a quantity and price", async () => {
      let bid = await auction.bids(0);

      expect(bid.bidder).to.equal(bidder1.address);
      expect(bid.quantity).to.equal(BIDS[0].BID_QUANTITY);
      expect(bid.price).to.equal(BIDS[0].BID_PRICE);
    });
  });

  describe("Ending Auction", async () => {
    let balanceBefore: any;

    it("is called only by the auctioneer", async () => {
      try {
        await auction.connect(bidder1).endAuction();
      } catch (error) {
        expect(error).to.be.an("Error");
      }
    });

    beforeEach(async () => {
      // START AN AUCTION
      const startAuctionTransaction = await auction
        .connect(auctioneer)
        .startAuction(DURATION, TOTAL_QUANTITY, token.getAddress());
      await startAuctionTransaction.wait();

      // PLACE BIDS
      let placeBidTransaction;
      for (var i = 0; i < BIDS.length; i++) {
        const currentBidder = `bidder${i + 1}`;
        placeBidTransaction = await auction
          .connect(eval(currentBidder))
          .placeBid(BIDS[i].BID_QUANTITY, BIDS[i].BID_PRICE);
        await placeBidTransaction.wait();
      }

      balanceBefore = await token.balanceOf(auction.getAddress());

      // End Auction
      const endAuctionTransaction = await auction
        .connect(auctioneer)
        .endAuction();
      await endAuctionTransaction.wait();
    });

    it("sorts bids from highest to lower", async () => {
      let highestBid = await auction.bids(0);
      expect(highestBid.quantity).to.equal(BIDS[2].BID_QUANTITY);
      expect(highestBid.price).to.equal(BIDS[2].BID_PRICE);
    });

    it("transfers tokens to the highest bidders based on their bids", async () => {
      const balanceAfter = await token.balanceOf(auction.getAddress());

      expect(Number(balanceBefore)).to.greaterThanOrEqual(balanceAfter);
      expect(await token.balanceOf(bidder1)).to.equal(BIDS[0].BID_QUANTITY);
      expect(await token.balanceOf(bidder2)).to.equal(BIDS[1].BID_QUANTITY);
      expect(await token.balanceOf(bidder3)).to.equal(BIDS[2].BID_QUANTITY);
    });
  });
});
