// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const NAME = 'Dapp University'
  const SYMBOL = 'DAPP'
  const MAX_SUPPLY = '1000000'
  const PRICE = ethers.utils.parseUnits('0.025', 'ether')
  const MINUTES_TO_ADD = 60000 * 10  // 10 minutes
  const BEGIN_CROWDSALE_DATE = new Date().getTime() + (MINUTES_TO_ADD);
  let accounts, deployer, user1, saletime, user2, user3


  // Deploy Token
  const Token = await hre.ethers.getContractFactory("Token")
  const token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY)
  await token.deployed()

  console.log(`Token deployed to: ${token.address}\n`)

  // Deploy Crowdsale
  const Crowdsale = await hre.ethers.getContractFactory("Crowdsale")
  const crowdsale = await Crowdsale.deploy(token.address, PRICE, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'), BEGIN_CROWDSALE_DATE)
  await crowdsale.deployed();

  console.log(`Crowdsale deployed to: ${crowdsale.address}\n`)

  let transaction = await token.transfer(crowdsale.address, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'))
  await transaction.wait()

  console.log(`Tokens transferred to Crowdsale\n`)

        // Configure Accounts
  accounts = await ethers.getSigners()
  deployer = accounts[0]

  // Add accounts to white list
  transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[0].address)
  transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[1].address)
  transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[2].address)
  transaction = await crowdsale.connect(deployer).addToWhiteList(accounts[3].address)
  await transaction.wait()

  console.log(`White Listed accounts added to Crowdsale\n`)
  
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
