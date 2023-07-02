# Auction Contract Take Home Test

## Problem:

You are working on a smart contract for an auction system for ERC20 tokens.
The auction system should allow users to place bids on ERC20 tokens.
When the auction ends, bids are filled.

## Requirements:

The smart contract should have the following functionality:

1. Start the auction with a quantity of ERC20 tokens specified by the auctioneer.
2. Allow users to place bids on items (quantity + price).
3. At the end of the auction, the bids are filled until there are no more tokens or no more
   bids

## Exercise:

Guidance: comment up as much of your decision-making process as you can.

1. Implement an auction smart contract with the following functions:
   1. A function to start the auction with a quantity of ERC20 tokens and a duration for the auction. This function should only be accessible to the contract owner.
   2. A function to allow users to place bids on tokens. This function should only beaccessible to non-owner users.
   3. A function to end the auction and fill the bids.
2. Write test cases for the functions (using the Hardhat testing environment if possible)
3. Explain your design choices and how/why you tested the contract to ensure that it is working as intended (comment your code using NatSpec)

Be creative and implement/comment how you might add features that could be useful such as:

- upgradeability
- original ideas welcome
- remember to keep in mind gas optimisation and security considerations

---

# To Run The Answer

```shell
npm i && \
npx hardhat clean && \
npx hardhat compile && \
npx hardhat test
```

---

## Rooms for modifications:

- For better Gas Optimisation. sortBids() could use merge sorting than bubble sorting.
- For upgradebility, we can have proxy contract as an entry point to interact with the implementation contract separting implementation from storage.
