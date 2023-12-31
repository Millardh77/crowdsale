const { expect } = require('chai');
const { ethers } = require('hardhat');
const moment = require('moment') 

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Crowdsale', () => {
    let crowdsale, token
    let accounts, deployer, user1, saletime, user2, user3
    let result, timeDeployed, allowBuyingAfter
    let milliseconds = 120000 // Number between 100000 - 999999

    const MINUTES_TO_ADD = 60000 * 10  // 10 minutes
    const BEGIN_CROWDSALE_DATE = (new Date().getTime() + (MINUTES_TO_ADD)).toString().slice(0, 10);
    const DEPLOY_TIME = new Date().getTime();

    // let BEGIN_CROWDSALE_DATE = 0
    // let DEPLOY_TIME = 0

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
      user2 = accounts[2]
      user3 = accounts[3]
      
      // Calculate Start Date
      // 86400000 milliseconds = 1 day
      // 3600000 milliseconds = 1 hour
      // 60000 milliseconds = 1 minute
      // 1000 milliseconds = 1 second


       //BEGIN_CROWDSALE_DATE = new Date().getTime() + (MINUTES_TO_ADD);
       //console.log("begin crowdsale dates: ", BEGIN_CROWDSALE_DATE, " milliseconds, ", Date(BEGIN_CROWDSALE_DATE))



      // Deploy Crowdsale
      crowdsale = await Crowdsale.deploy(token.address, ether(1), '1000000', DEPLOY_TIME, BEGIN_CROWDSALE_DATE)

      // Send tokens to crowdsale
      let transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000))
      await transaction.wait()


      // Add accounts to white list
      transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[1].address)
      transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[2].address)
      await transaction.wait()

      // Set minimum and maximum Contribution Amount
      let minContribution, maxContribution
      minContribution = '10'
      maxContribution = '1000'
      minContribution = ethers.utils.parseUnits(minContribution, 'ether')
      maxContribution = ethers.utils.parseUnits(maxContribution, 'ether')
      transaction = await crowdsale.connect(deployer).setMinContributionAmt(minContribution)
      transaction = await crowdsale.connect(deployer).setMaxContributionAmt(maxContribution)
          await transaction.wait()

    })

    describe('Deployment', () => {

      it('Returns how many seconds left until minting allowed', async () => {
        expect(await crowdsale.allowBuyingAfter()).to.equal(BEGIN_CROWDSALE_DATE)

        // let buffer = 2
        // let target = Number(milliseconds.toString().slice(0, 3))
        // // result = await crowdsale.getSecondsUntilStart()
        // // result = Number(result)
        // // var minutes = result / 60000
        // // var dateFormat = new Date(result);

        // timeDeployed = await crowdsale.timeDeployed();
        // timeDeployed = Number(timeDeployed);
        // allowBuyingAfter = await crowdsale.allowBuyingAfter();
        // allowBuyingAfter = Number(allowBuyingAfter);


        // // console.log("Seconds until start:", result)
        // // console.log("Minutes until start:", minutes)
        // // console.log("Target:", target)
        // // console.log("Seconds until start Date Format:", dateFormat)
        // console.log("Time Deployed:", new Date(timeDeployed))
        // console.log("AllowBuyingAfter:", new Date(allowBuyingAfter))
 
              // Fetch min contribution
          let minContribution = ethers.utils.formatUnits(await crowdsale.minContributionAmount(), 18)
          const formattedMin = ethers.utils.parseUnits(minContribution.toString(), 'ether')
           console.log("minContribution:", minContribution)
          //  console.log("minContribution:", formattedMin)

            // Fetch max contribution
            let maxContribution = ethers.utils.formatUnits(await crowdsale.maxContributionAmount(), 18)
            const formattedMax = ethers.utils.parseUnits(maxContribution.toString(), 'ether')
            console.log("maxContribution:", maxContribution)
            // console.log("maxContribution:", formattedMax)
     



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

    // describe('Adding tokens to Whitelist', () => {
    //   let transaction, result
  
    //   describe('Success', () => {
  
    //     beforeEach(async () => {
    //       transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[1].address)
    //       transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[2].address)
    //       result = await transaction.wait()
    //       // whitelisted[0] = await crowdsale.whitelisted(accounts[1].address)
    //       // whitelisted[1] = await crowdsale.whitelisted(accounts[2].address)
    //       // console.log("Deployer Account:", accounts[0].address)
    //       // console.log("Account 1:", accounts[1].address)
    //       // console.log("Account 2:", accounts[2].address)
    //     })
  
    //     it('tracks the newly created white list item', async () => {
    //       // console.log("whitelist Account 1 #:", await crowdsale.whiteListed(accounts[1].address))
    //       // console.log("whitelist Account 1:", await crowdsale.getWhiteListItem(0))
    //       // console.log("whitelist Account 2 #:", await crowdsale.whiteListed(accounts[1].address))
    //       // console.log("whitelist Account 2:", await crowdsale.getWhiteListItem(1))
    //       expect(await crowdsale.whiteListed(accounts[1].address)).to.equal(1)
    //       expect(await crowdsale.whiteListed(accounts[2].address)).to.equal(2)
    //       expect(await crowdsale.getWhiteListItem(0)).to.equal(accounts[1].address)
    //       expect(await crowdsale.getWhiteListItem(1)).to.equal(accounts[2].address)
    //       expect(await crowdsale.whiteListCount()).to.equal(2)
    //     })
  
    //     it('emits a white list event', async () => {
    //       const event = result.events[0]
    //       expect(event.event).to.equal('AddToWhitelist')
  
    //       // const args = event.args
    //       // expect(args.id).to.equal(1)
    //       // expect(args.user).to.equal(user1.address)
    //     })
  
    //   })
    //   describe('Failure', () => {
    //     it('prevents non-owner from adding to whitelist', async () => {
    //       await expect(crowdsale.connect(user1).addToWhiteList(user1.address)).to.be.reverted
    //     })
 
    //   })

    // })

    describe('Buying Tokens', () => {
      let transaction, result
      let amount = tokens(10)

      describe('Success', () => {
        const BEGIN_CROWDSALE_DATE = Date.now().toString().slice(0,10) // Now
        beforeEach(async () => {
           console.log("begin crowdsale dates: ", BEGIN_CROWDSALE_DATE, " milliseconds, ", Date(BEGIN_CROWDSALE_DATE))
          // console.log("whitelist count:", await crowdsale.whiteListCount())
          // console.log("whitelisted record:", await crowdsale.whiteListed(user1.address))
          const Token = await ethers.getContractFactory('Token')

          // Deploy token
          token = await Token.deploy('Dapp University', 'DAPP', '1000000')
    
          const Crowdsale = await ethers.getContractFactory('Crowdsale')
          crowdsale = await Crowdsale.deploy(token.address, ether(1), '1000000', DEPLOY_TIME, BEGIN_CROWDSALE_DATE)
      
          // Send tokens to crowdsale
          transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000))
          await transaction.wait()

          // Add accounts to white list
          transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[1].address)
          transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[2].address)
          await transaction.wait()

          // Buy tokens
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
        it('rejects not whitelisted', async () => {
          await expect(crowdsale.connect(user3).buyTokens(tokens(10), { value: ether(10) })).to.be.reverted
        })
  
      })
  
    })

    describe('Sending ETH', () => {
      let transaction, result
      let amount = ether(10)
  
      describe('Success', () => {
        const BEGIN_CROWDSALE_DATE = Date.now().toString().slice(0,10) // Now
        beforeEach(async () => {
          const Token = await ethers.getContractFactory('Token')

          // Deploy token
          token = await Token.deploy('Dapp University', 'DAPP', '1000000')
    
          const Crowdsale = await ethers.getContractFactory('Crowdsale')
          crowdsale = await Crowdsale.deploy(token.address, ether(1), '1000000', DEPLOY_TIME, BEGIN_CROWDSALE_DATE)
          
          accounts = await ethers.getSigners()
          deployer = accounts[0]
          user1 = accounts[1]
    
          // Send tokens to crowdsale
          transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000))
          await transaction.wait()

          // Add accounts to white list
          transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[1].address)
          transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[2].address)
          await transaction.wait()
         

          // Buy tokens
          transaction = await crowdsale.connect(user1).buyTokens(amount, { value: ether(10) })
          result = await transaction.wait()
          

          console.log(`User balance: ${await token.balanceOf(user1.address)}`)
          console.log(`amount: ${amount}`)
          console.log(`crowdsale balance before: ${await token.balanceOf(crowdsale.address)}`)
          // transaction = await user1.sendTransaction({ to: crowdsale.address, value: amount })
          // result = await transaction.wait()
        })
  
        it('updates contracts ether balance', async () => {
          console.log(`amount: ${amount}\n`)
          console.log(`crowdsale balance: ${await ethers.provider.getBalance(crowdsale.address)}`)
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
        const BEGIN_CROWDSALE_DATE = Date.now().toString().slice(0,10) // Now
        beforeEach(async () => {
          const Token = await ethers.getContractFactory('Token')

          // Deploy token
          token = await Token.deploy('Dapp University', 'DAPP', '1000000')
    
          const Crowdsale = await ethers.getContractFactory('Crowdsale')
          crowdsale = await Crowdsale.deploy(token.address, ether(1), '1000000', DEPLOY_TIME, BEGIN_CROWDSALE_DATE)

          // Send tokens to crowdsale
          transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000))
          await transaction.wait()

          // Add accounts to white list
          transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[1].address)
          transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[2].address)
          await transaction.wait()

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