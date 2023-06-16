const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Crowdsale', () => {
    let crowdsale, token
    let accounts, deployer, user1, saletime
    let result, timeDeployed
    let milliseconds = 120000 // Number between 100000 - 999999

    const MINUTES_TO_ADD = 60000 * 10  // 10 minutes
    let BEGIN_CROWDSALE_DATE = 0

    beforeEach(async () => {
      // Load Contracts
      const Crowdsale = await ethers.getContractFactory('Crowdsale')
      const Token = await ethers.getContractFactory('Token')

      // Deploy token
      token = await Token.deploy('Dapp University', 'DAPP', '1000000')

      // Configure Accounts
      accounts = await ethers.getSigners()
      deployer = accounts[0]
      user1 = accounts[1]
      
      // Calculate Start Date
      // 86400000 milliseconds = 1 day
      // 3600000 milliseconds = 1 hour
      // 60000 milliseconds = 1 minute
      // 1000 milliseconds = 1 second

      BEGIN_CROWDSALE_DATE = new Date().getTime() + (MINUTES_TO_ADD);
      console.log("begin crowdsale dates: ", BEGIN_CROWDSALE_DATE, " milliseconds, ", Date(BEGIN_CROWDSALE_DATE))


      // Deploy Crowdsale
      crowdsale = await Crowdsale.deploy(token.address, ether(1), '1000000', BEGIN_CROWDSALE_DATE)

      // Send tokens to crowdsale
      let transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000))
      await transaction.wait()

    })

    describe('Deployment', () => {

      // var ms = new Date().getTime() + (86400000 * 100);
      // var daysfromnow100 = new Date(ms);    
      // var END_CROWDSALE_DATE = ms
      // console.log("100 days from now:", daysfromnow100)
      // console.log("right now:", new Date(Date.now()))
      // console.log("end crowdsale date: ", END_CROWDSALE_DATE)

      it('Returns how many seconds left until minting allowed', async () => {
        let buffer = 2
        let target = Number(milliseconds.toString().slice(0, 3))
        result = await crowdsale.getSecondsUntilStart()
        result = Number(result)
        console.log("deployed dates: ", crowdsale.timeDeployed, " milliseconds, ", Date(crowdsale.timeDeployed))

        console.log("Seconds until start:", result)
        console.log("Target:", target)

        expect(await crowdsale.getSecondsUntilStart()).to.be.greaterThan(target)

        // NOTE: Sometimes the seconds may be off by 1, As long as the seconds are 
        // between the buffer zone, we'll pass the test
        // if (result > (target - buffer) && result <= target) {
        //     assert.isTrue(true)
        // } else {
        //     assert.isTrue(false)
        // }
    })


      it('sends tokens to the Crowdsale contract', async () => {
        expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(1000000))
      })

      it('returns the price', async () => {
        expect(await crowdsale.price()).to.equal(ether(1))
      })
  
      it('returns token address', async () => {
        expect(await crowdsale.token()).to.equal(token.address)
      })
    })

    describe('Buying Tokens', () => {
      let transaction, result
      let amount = tokens(10)

      describe('Success', () => {
        beforeEach(async () => {
          transaction = await crowdsale.connect(user1).buyTokens(amount, { value: ether(10) })
          result = await transaction.wait()
        })

        it('transfers tokens', async () => {
          expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(999990))
          expect(await token.balanceOf(user1.address)).to.equal(amount)
        })

        it('updates tokensSold', async () => {
          expect(await crowdsale.tokensSold()).to.equal(amount)
        })

        it('updates contracts ether balance', async () => {
          expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(amount)
        })

        it('emits a buy event', async () => {
          // --> https://hardhat.org/hardhat-chai-matchers/docs/reference#.emit
          await expect(transaction).to.emit(crowdsale, "Buy")
            .withArgs(amount, user1.address)
        })
  

      })

      describe('Failure', () => {

        it('rejects insufficent ETH', async () => {
          await expect(crowdsale.connect(user1).buyTokens(tokens(10), { value: 0 })).to.be.reverted
        })
  
      })
  
    })

    describe('Sending ETH', () => {
      let transaction, result
      let amount = ether(10)
  
      describe('Success', () => {
  
        beforeEach(async () => {
          transaction = await user1.sendTransaction({ to: crowdsale.address, value: amount })
          result = await transaction.wait()
        })
  
        it('updates contracts ether balance', async () => {
          expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(amount)
        })
  
        it('updates user token balance', async () => {
          expect(await token.balanceOf(user1.address)).to.equal(amount)
        })
  
      })
    })

    describe('Updating Price', () => {
      let transaction, result
      let price = ether(2)
  
      describe('Success', () => {
  
        beforeEach(async () => {
          transaction = await crowdsale.connect(deployer).setPrice(ether(2))
          result = await transaction.wait()
        })
  
        it('updates the price', async () => {
          expect(await crowdsale.price()).to.equal(ether(2))
        })
  
      })
  
      describe('Failure', () => {
  
        it('prevents non-owner from updating price', async () => {
          await expect(crowdsale.connect(user1).setPrice(price)).to.be.reverted
        })
  
      })
    })
    
    describe('Finalzing Sale', () => {
      let transaction, result
      let amount = tokens(10)
      let value = ether(10)

      describe('Success', () => {
        beforeEach(async () => {
          transaction = await crowdsale.connect(user1).buyTokens(amount, { value: value })
          result = await transaction.wait()
  
          transaction = await crowdsale.connect(deployer).finalize()
          result = await transaction.wait()
  
        })

        it('transfers remaining tokens to owner', async () => {
          expect(await token.balanceOf(crowdsale.address)).to.equal(0)
          expect(await token.balanceOf(deployer.address)).to.equal(tokens(999990))
        })
  
        it('transfers ETH balance to owner', async () => {
          expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(0)
        })

        it('emits Finalize event', async () => {
          // --> https://hardhat.org/hardhat-chai-matchers/docs/reference#.emit
          await expect(transaction).to.emit(crowdsale, "Finalize")
            .withArgs(amount, value)
        })

      })

      describe('Failure', () => {
        it('prevents non-owner from finalizing', async () => {
          await expect(crowdsale.connect(user1).finalize()).to.be.reverted
        })
 
      })
    })
  

})